/**
 * @fileoverview AIIPCHandlers.ts
 * @author Luca Warmenhoven
 * @date Created on Saturday, October 12 - 10:01
 */

import { ChatCompletion }                   from "../ai/ChatCompletion";
import { SpeechToText, SpeechToTextConfig } from "../ai/SpeechToText";
import { TextToSpeech, TTSRequest }         from "../ai/TextToSpeech";
import { AIContext }                        from "../ai/AIContext";
import { ipcMain }                          from 'electron';
import { resolve }                          from "path";
import * as dotenv                          from 'dotenv';
import { CompletionRequest }                from "../ai/ChatRequest";

dotenv.config({ path: resolve('.env') });

/**
 * Create contexts for the AI services.
 * These contexts will then be made available to the renderer process.
 */
const openrouterCtx = new AIContext(
    { baseURL: "https://openrouter.ai/api/v1/", apiKey: process.env.OPEN_ROUTER_API_KEY! });
const openaiCtx     = new AIContext(
    { baseURL: 'https://api.openai.com/v1/', apiKey: process.env.OPENAI_API_KEY! });

/**
 * Create instances of the AI services.
 * These instances will be utilized by the renderer process using
 * the Electron IPC API.
 */
const textToSpeech = new TextToSpeech(openaiCtx);
const speechToText = new SpeechToText(openaiCtx);
const completion   = new ChatCompletion(openrouterCtx);

/**
 * Handle the chat completion request.
 * This handler is used to handle the chat completion request from the renderer process.
 */
ipcMain.handle('ai:chat-completion', async (event, prompt: CompletionRequest | string): Promise<any> => {
    const response = await completion.create(prompt);
    if ( !(typeof response === 'function') ) {
        event.sender.send('ai:chat-completion-response', response);
        return;
    }

    const iterator = response()
    for await ( const response of iterator ) {
        console.log('response: ', response);
        event.sender.send('ai:chat-completion-response', response);
    }
});

/**
 * Handle the text-to-speech request.
 */
ipcMain.handle('ai:text-to-speech', async (event, config: TTSRequest | string): Promise<any> => {
    const blob        = await textToSpeech.create(config);
    const arrayBuffer = await blob.arrayBuffer();
    event.sender.send('ai:text-to-speech-response', Buffer.from(arrayBuffer));
});

/**
 * Handle the speech-to-text request.
 */
ipcMain.handle('ai:speech-to-text', async (event, config: SpeechToTextConfig | Blob): Promise<any> => {
    event.sender.send('ai:speech-to-text-response', await speechToText.create(config));
});
