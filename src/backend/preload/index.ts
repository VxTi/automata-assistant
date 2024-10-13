import { contextBridge, ipcMain } from 'electron'
import { electronAPI }            from '@electron-toolkit/preload'
import { ConversationTopic }  from "../../../declarations";
import { CompletionRequest }  from "../ai/ChatRequest";
import { SpeechToTextConfig } from "../ai/SpeechToText";
import { TTSRequest }         from "../ai/TextToSpeech";
import { sep }                from 'path';
import './Audio'
import { ChatCompletionResponse } from "../ai/ChatCompletion";

// Expose the APIs to the renderer process
contextBridge.exposeInMainWorld('electron', electronAPI);

/**
 * Expose the event APIs to the renderer process.
 */
contextBridge.exposeInMainWorld('events', {
    on: (event: string, callback: (args: any[]) => any) => {
        const handler = (_: any, args: any[]) => callback(args);
        ipcMain.on(event, handler);
    }
});

/**
 * Expose the file system APIs to the renderer process.
 */
contextBridge.exposeInMainWorld('fs', {
    /**
     * The path separator.
     */
    separator: sep,
    /**
     * Open a file dialog.
     */
    openFile: async (): Promise<string | null> => {
        return await electronAPI.ipcRenderer.invoke('open-file');
    },
    /**
     * Open a directory dialog.
     */
    openDirectory: async (): Promise<string | null> => {
        return await electronAPI.ipcRenderer.invoke('open-directory');
    },
});

/**
 * Expose conversation APIs to the renderer process.
 */
contextBridge.exposeInMainWorld('conversations', {
    /**
     * Save a conversation topic to the conversation directory.
     * @param topic The conversation topic to save
     */
    save: async (topic: ConversationTopic): Promise<void> => {
        return await electronAPI.ipcRenderer.invoke('save-conversation', topic);
    },
    /**
     * Delete a conversation topic from the conversation directory.
     * @param uuid The UUID of the conversation topic to delete
     */
    delete: async (uuid: string): Promise<void> => {
        return await electronAPI.ipcRenderer.invoke('delete-conversation', uuid);
    },
    /**
     * List all conversation topics in the conversation directory.
     * @returns A promise that resolves to an array of conversation topics.
     */
    list: async (): Promise<ConversationTopic[]> => {
        return await electronAPI.ipcRenderer.invoke('list-conversations');
    }
});

/**
 * The AI APIs for the renderer process.
 */
contextBridge.exposeInMainWorld('ai', {
    completion: {
        /**
         * Handle the chat completion request.
         * @param request The completion request to handle, or a string prompt.
         */
        create: async (request: string | CompletionRequest): Promise<ChatCompletionResponse> => {
            return await electronAPI.ipcRenderer.invoke('ai:chat-completion', request);
        }
    },
    audio: {
        /**
         * Handle the text-to-speech request.
         * @param request The text-to-speech request to handle.
         */
        textToSpeech: async (request: TTSRequest | string): Promise<Blob> => {
            return await electronAPI.ipcRenderer.invoke('ai:text-to-speech', request);
        },
        /**
         * Handle the speech-to-text request.
         * @param request The speech-to-text request to handle.
         */
        speechToText: async (request: Blob | SpeechToTextConfig): Promise<string> => {
            return await electronAPI.ipcRenderer.invoke('ai:speech-to-text', request);
        },

        speechToTextFileLimit: 25 * 1024 * 1024,
        audioSegmentationIntervalMs: 500,
    }
});
