/**
 * @fileoverview AIApiHandlers.ts
 * @author Luca Warmenhoven
 * @date Created on Saturday, October 12 - 10:01
 */

import { ChatCompletion, CompletionRequest } from "../ai/ChatCompletion";
import { SpeechToText, SpeechToTextConfig }  from "../ai/SpeechToText";
import { TextToSpeech, TTSRequest }          from "../ai/TextToSpeech";
import { AIContext }                         from "../ai/AIContext";
import { ipcMain }                           from 'electron';
import { join }                              from "path";
import * as dotenv                           from 'dotenv';

dotenv.config({ path: join(__dirname, './.env') });

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
 */
ipcMain.handle('ai:chat-completion', async (_, prompt: CompletionRequest | string): Promise<Response> => {
    return await completion.create(prompt);
});

/**
 * Handle the text-to-speech request.
 */
ipcMain.handle('ai:text-to-speech', async (_, config: TTSRequest): Promise<Response> => {
    return await textToSpeech.create(config);
});

/**
 * Handle the speech-to-text request.
 */
ipcMain.handle('ai:speech-to-text', async (_, config: SpeechToTextConfig | Blob): Promise<Response> => {
    return await speechToText.create(config);
});
