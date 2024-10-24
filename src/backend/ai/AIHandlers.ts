/**
 * @fileoverview AIHandlers.ts
 * @author Luca Warmenhoven
 * @date Created on Monday, October 14 - 09:25
 */
import { ChatCompletion }                  from "./ChatCompletion";
import { TextToSpeech, Voices }            from "./TextToSpeech";
import { SpeechToText }                    from "./SpeechToText";
import { AIContext }                       from "./AIContext";
import { RegisteredTools }                 from "./RegisteredTools";
import { appDirectory }                    from "../main";
import { ipcMain }                         from "electron";
import { join, resolve }                   from "path";
import * as dotenv                         from 'dotenv';
import * as fs                             from "node:fs";
import { ChatResponse, CompletionRequest } from "llm";
import { TTSRequest, VoiceType }           from "tts";
import { SpeechToTextRequest }             from "stt";
import { StableDiffusionConfig }           from "stable-diffusion";
import { StableDiffusion }                 from "./StableDiffusion";

dotenv.config({ path: resolve('.env') });


const ctx = new AIContext(
    { baseURL: 'https://api.openai.com/v1/', apiKey: process.env.OPENAI_API_KEY! });

const completion = new ChatCompletion(ctx);
const tts        = new TextToSpeech(ctx);
const stt        = new SpeechToText(ctx);
const stableDiff = new StableDiffusion(ctx);

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
    const blob = await tts.create(request);
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
    const voiceCachePath = join(appDirectory, 'voice-assistant-cache');

    console.log(voiceCachePath)

    // If the directory doesn't exist, we'll create it.
    if ( !fs.existsSync(voiceCachePath) ) {
        fs.mkdirSync(voiceCachePath);
    }

    let audioBuffers: Buffer[] = [];

    // If cache files are missing, we'll just renew all of them.
    if ( fs.readdirSync(voiceCachePath).length !== Voices.length ) {
        for ( const file of fs.readdirSync(voiceCachePath) ) {
            fs.unlinkSync(join(voiceCachePath, file));
        }

        // Generate files
        for ( let i = 0; i < Voices.length; i++ ) {
            const voice  = Voices[ i ];
            const buffer = Buffer.from(await (await tts.create(
                {
                    input: 'Hello! My name is ' + voice, voice: (voice.toLowerCase()) as VoiceType,
                    model: 'tts-1', speed: 1.0
                })).arrayBuffer());

            audioBuffers.push(buffer);

            const filePath = join(voiceCachePath, `${voice}.wav`); // Adjust the extension as necessary
            fs.writeFileSync(filePath, buffer);

            // If there's more voices to generate, we'll wait a bit to prevent rate limiting.
            if ( i + 1 < Voices.length )
                await new Promise(resolve => setTimeout(resolve, 100));
        }

        // Save the audio to cache as .wav files (or any format you are using)
        await Promise.all(Voices.map(async (voice, index) => {
            const filePath = join(voiceCachePath, `${voice}.wav`); // Adjust the extension as necessary
            fs.writeFileSync(filePath, audioBuffers[ index ]);
        }));
    }
    else {
        audioBuffers = fs.readdirSync(voiceCachePath).map(file => {
            const filePath = join(voiceCachePath, file);
            return fs.readFileSync(filePath);
        });
    }


    // Return base64 encoded audio
    return {
        data: new Map(audioBuffers.map((buffer, i) => {
            return [ Voices[ i ] as VoiceType, bufferToBase64(buffer) ];
        })),
    };
});
