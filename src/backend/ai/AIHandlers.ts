/**
 * @fileoverview AIHandlers.ts
 * @author Luca Warmenhoven
 * @date Created on Monday, October 14 - 09:25
 */
import { AIContext }                         from "./AIContext";
import { resolve }                           from "path";
import * as dotenv                           from 'dotenv';
import { ChatCompletion }                    from "./ChatCompletion";
import { TextToSpeech, TTSRequest }          from "./TextToSpeech";
import { SpeechToText, SpeechToTextRequest } from "./SpeechToText";
import { ipcMain }                           from "electron";
import { ChatResponse, CompletionRequest }   from "./ChatCompletionDefinitions";
import { RegisteredTools }                   from "./RegisteredTools";

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
