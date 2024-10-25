/**
 * @fileoverview AIHandlers.ts
 * @author Luca Warmenhoven
 * @date Created on Monday, October 14 - 09:25
 */
import { ChatCompletion }                                  from "./ChatCompletion";
import { TextToSpeech, Voices }                            from "./TextToSpeech";
import { SpeechToText }                                    from "./SpeechToText";
import { AIContext }                                       from "./AIContext";
import { RegisteredTools }                                 from "./RegisteredTools";
import { appDirectory }                                    from "../main";
import { ipcMain }                                         from "electron";
import { join, resolve }                                   from "path";
import * as dotenv                                         from 'dotenv';
import * as fs                                             from "node:fs";
import { ChatResponse, CompletionRequest }                 from "llm";
import { TTSRequest, VoiceType }                           from "tts";
import { SpeechToTextRequest }                             from "stt";
import { StableDiffusionConfig }                           from "stable-diffusion";
import { StableDiffusion }                                 from "./StableDiffusion";
import { FilePurpose, FileUploadList, FileUploadResponse } from "ai-file-uploads";
import { FileUploads }                                     from "./FileUploads";
import path                                                from "node:path";

dotenv.config({ path: resolve('.env') });


const ctx = new AIContext(
    { baseURL: 'https://api.openai.com/v1/', apiKey: process.env.OPENAI_API_KEY! });

const completion  = new ChatCompletion(ctx);
const tts         = new TextToSpeech(ctx);
const stt         = new SpeechToText(ctx);
const stableDiff  = new StableDiffusion(ctx);
const fileUploads = new FileUploads(ctx);

// The default fetch interval for API calls, in milliseconds.
const DefaultFetchInterval = 100;
const Wait                 = () => new Promise(resolve => setTimeout(resolve, DefaultFetchInterval));

/**
 * Converts a buffer to a base64 string.
 * @param buffer the buffer to convert.
 */
function bufferToBase64(buffer: Buffer) {
    const arrayBuffer = new Uint8Array(buffer);

    // Create a binary string using a loop
    let binaryString = '';
    for ( let i = 0; i < arrayBuffer.length; i++ ) {
        binaryString += String.fromCharCode(arrayBuffer[ i ]);
    }

    // Convert the binary string to base64
    return btoa(binaryString);
}

ipcMain.handle('ai:completion', async (_: Electron.IpcMainInvokeEvent, request: CompletionRequest) => {
    request.tools ??= RegisteredTools;
    const response = await completion.create(request);
    if ( typeof response !== 'function' && response !== null )
        return response as ChatResponse;
    return null;
});

/**
 * Handles the stable diffusion request and responds to the client
 */
ipcMain.handle('ai:stable-diffusion', async (_: Electron.IpcMainInvokeEvent, request: StableDiffusionConfig) => {
    return stableDiff.create(request);
});

/**
 * Handles the text to speech request and responds to the client
 * with the blob converted to base64.
 */
ipcMain.handle('ai:text-to-speech', async (_: any, request: TTSRequest | string) => {
    const blob: Blob     = await tts.create(request);
    const buffer: Buffer = Buffer.from(await blob.arrayBuffer());
    return {
        data: bufferToBase64(buffer)
    };
});

/**
 * Handles speech to text request and sends the response back to the client.
 */
ipcMain.handle('ai:speech-to-text', async (_: any, request: SpeechToTextRequest) => {
    return await stt.create(request);
});

/**
 * Handles the file upload request and responds to the client.
 * TODO: Add URL path support for remote files.
 */
ipcMain.handle('ai:upload-files', async (_: any, files: {
    path: string,
    purpose: FilePurpose
}[]): Promise<FileUploadResponse[]> => {

    const responses = new Array<FileUploadResponse>(files.length);

    for ( let i = 0; i < files.length; i++ ) {
        const fileBuffer: Buffer = fs.readFileSync(files[ i ].path);
        const file: File         = new File([ fileBuffer ], path.basename(files[ i ].path));

        responses[ i ] = await fileUploads.upload({ file: file, purpose: files[ i ].purpose });

        // If there's more files to upload, we'll wait a bit to prevent rate limiting.
        if ( i + 1 < files.length )
            await Wait();
    }
    return responses;
});

/**
 * Handles the file list request and responds to the client with a list of files.
 */
ipcMain.handle('ai:list-files', async (_: any, purpose?: FilePurpose): Promise<FileUploadList> => {
    return await fileUploads.get(purpose);
})

/**
 * Handles the voice assistant examples request and responds to the client
 * with a map of voice types and their base64 encoded audio.
 */
ipcMain.handle('ai:voice-assistant-examples', async (_: any): Promise<{ data: Map<VoiceType, string> }> => {
    const voiceCachePath = join(appDirectory, 'voice-assistant-cache');

    // If the directory doesn't exist, we'll create it.
    if ( !fs.existsSync(voiceCachePath) ) {
        fs.mkdirSync(voiceCachePath);
    }


    // If cache files are missing, we'll just renew all of them.
    if ( fs.readdirSync(voiceCachePath).length !== Voices.length ) {
        for ( const file of fs.readdirSync(voiceCachePath) ) {
            fs.unlinkSync(join(voiceCachePath, file));
        }

        let audioBuffers: Buffer[] = Array<Buffer>(Voices.length);

        // Generate files
        for ( let i = 0; i < Voices.length; i++ ) {
            const voice: string = Voices[ i ];
            const blob: Blob    = await tts.create(
                {
                    input: 'Hello! My name is ' + voice,
                    voice: (voice.toLowerCase()) as VoiceType,
                    model: 'tts-1', speed: 1.0
                });

            const buffer: Buffer        = Buffer.from(await blob.arrayBuffer());
            audioBuffers[ i ]   = buffer;

            const filePath = join(voiceCachePath, `${voice}.wav`); // Adjust the extension as necessary
            fs.writeFileSync(filePath, buffer);

            // If there's more voices to generate, we'll wait a bit to prevent rate limiting.
            if ( i + 1 < Voices.length )
                await Wait();
        }

        // Return base64 encoded audio
        return {
            data: new Map(audioBuffers.map((buffer, i) => {
                return [ Voices[ i ] as VoiceType, bufferToBase64(buffer) ];
            })),
        };
    }

    return {
        data: new Map(fs.readdirSync(voiceCachePath).map(file => {
            const filePath = join(voiceCachePath, file);
            const voice    = file.split('.')[ 0 ] as VoiceType;
            return [ voice, bufferToBase64(fs.readFileSync(filePath)) ];
        })),
    }
});
