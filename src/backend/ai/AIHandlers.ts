/**
 * @fileoverview AIHandlers.ts
 * @author Luca Warmenhoven
 * @date Created on Monday, October 14 - 09:25
 */
import { AIContext }                           from "./AIContext";
import { join, resolve }                       from "path";
import * as dotenv                             from 'dotenv';
import { ChatCompletion }                      from "./ChatCompletion";
import { TextToSpeech, TTSRequest, VoiceType } from "./TextToSpeech";
import { SpeechToText, SpeechToTextRequest }   from "./SpeechToText";
import { ipcMain }                             from "electron";
import { ChatResponse, CompletionRequest }     from "./ChatCompletionDefinitions";
import { RegisteredTools }                     from "./RegisteredTools";
import { appDirectory }                        from "../main";
import * as fs                                 from "node:fs";

dotenv.config({ path: resolve('.env') });


const ctx = new AIContext(
    { baseURL: 'https://api.openai.com/v1/', apiKey: process.env.OPENAI_API_KEY! });

const completion = new ChatCompletion(ctx);
const tts        = new TextToSpeech(ctx);
const stt        = new SpeechToText(ctx);

ipcMain.handle('ai:completion', async (_: Electron.IpcMainInvokeEvent, request: CompletionRequest) => {
    request.tools ??= RegisteredTools;
    const response = await completion.create(request);
    if ( typeof response !== 'function' )
        return response as ChatResponse;
    return null;
});

/**
 * Handles the text to speech request and responds to the client
 * with the blob converted to base64.
 */
ipcMain.handle('ai:text-to-speech', async (_: any, request: TTSRequest | string) => {
    const blob = await tts.create(request);
    const data = (await blob.arrayBuffer().then(arrBuf => Buffer.from(arrBuf))).toString('base64')
    console.log('Generated data: ', data);
    return { data: (await blob.arrayBuffer().then(arrBuf => Buffer.from(arrBuf))).toString('base64') };
});

/**
 * Handles speech to text request and sends the response back to the client.
 */
ipcMain.handle('ai:speech-to-text', async (_: any, request: SpeechToTextRequest) => {
    return await stt.create(request);
});

const bufferToBase64 = (buffer: Buffer) => {
    const arrayBuffer  = new Uint8Array(buffer);
    const binaryString = String.fromCharCode(...arrayBuffer);
    return btoa(binaryString);
};

ipcMain.handle('ai:voice-assistant-examples', async (_: any): Promise<{ data: Map<VoiceType, string> }> => {
    const examplesPath = join(appDirectory, 'voice-assistant-cache');
    const voices       = [ 'alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer' ];

    console.log(examplesPath)

    // If the directory doesn't exist, we'll create it.
    if ( !fs.existsSync(examplesPath) ) {
        fs.mkdirSync(examplesPath);
    }

    let audioBuffers: Buffer[] = [];

    // If cache files are missing, we'll just renew all of them.
    if ( fs.readdirSync(examplesPath).length !== voices.length ) {
        for ( const file of fs.readdirSync(examplesPath) )
            fs.unlinkSync(join(examplesPath, file));

        // Generate files
        audioBuffers = await Promise.all(voices.map(async (voice, i) => {
            return new Promise<Buffer>((resolve) => {
                setTimeout(async () => {
                    const audioBlob = await tts.create(
                        {
                            input: 'Hello! My name is ' + voice, voice: voice as VoiceType,
                            model: 'tts-1', speed: 1.0
                        });
                    resolve(Buffer.from(await audioBlob.arrayBuffer()));
                }, i * 100);
            });
        }));

        // Save the audio to cache as .wav files (or any format you are using)
        await Promise.all(voices.map(async (voice, index) => {
            const filePath = join(examplesPath, `${voice}.wav`); // Adjust the extension as necessary
            fs.writeFileSync(filePath, bufferToBase64(audioBuffers[ index ]));
        }));
    }
    else {
        audioBuffers = fs.readdirSync(examplesPath).map(file => {
            const filePath = join(examplesPath, file);
            return fs.readFileSync(filePath);
        });
    }


    // Return base64 encoded audio
    return {
        data: new Map(audioBuffers.map((buffer, i) => {
            return [ voices[ i ] as VoiceType, bufferToBase64(buffer) ];
        })),
    };
});
