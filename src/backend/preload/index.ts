import { contextBridge, ipcMain }                         from 'electron'
import { electronAPI }                                    from '@electron-toolkit/preload'
import { sep }                                            from 'path';
import { CompletionRequest, ConversationTopic }           from "llm";
import { TTSRequest, VoiceType }                          from "tts";
import { SpeechToTextRequest }                            from "stt";
import { StableDiffusionConfig, StableDiffusionResponse } from "stable-diffusion";
import { AbstractResource }                               from "abstractions";


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

    /**
     * Save a resource
     */
    saveResource: async (resource: AbstractResource): Promise<void> => {
        return await electronAPI.ipcRenderer.invoke('resources:save', resource);
    },

    /**
     * Returns a list of all loaded resources.
     */
    getResources: async (): Promise<AbstractResource[]> => {
        return await electronAPI.ipcRenderer.invoke('resources:list');
    },

    /**
     * Delete a resource
     */
    deleteResource: async (name: string) => {
        return await electronAPI.ipcRenderer.invoke('resources:delete', name);
    }
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
    completion: async (request: CompletionRequest) => {
        return await electronAPI.ipcRenderer.invoke('ai:completion', request);
    },

    /**
     * Handle the stable diffusion request.
     * @param request The stable diffusion request to handle.
     */
    stableDiffusion: async (request: StableDiffusionConfig): Promise<StableDiffusionResponse> => {
        return await electronAPI.ipcRenderer.invoke('ai:stable-diffusion', request);
    },
    audio: {
        /**
         * Get the voice assistant examples.
         * @returns A promise that resolves to a map of voice types and examples.
         */
        getVoiceAssistantExamples: async (): Promise<{ data: Map<VoiceType, string> }> => {
            return await electronAPI.ipcRenderer.invoke('ai:voice-assistant-examples');
        },
        /**
         * Handle the text-to-speech request.
         * @param request The text-to-speech request to handle.
         * @returns A promise that resolves to the base64 encoded audio data.
         */
        textToSpeech: async (request: TTSRequest): Promise<{ data: string }> => {
            return await electronAPI.ipcRenderer.invoke('ai:text-to-speech', request);
        },
        /**
         * Handle the speech-to-text request.
         * @param request The speech-to-text request to handle.
         */
        speechToText: async (request: SpeechToTextRequest) => {
            return await electronAPI.ipcRenderer.invoke('ai:speech-to-text', request);
        },
        speechToTextFileLimit: 25 * 1024 * 1024,
        audioSegmentationIntervalMs: 500,
    }
});
