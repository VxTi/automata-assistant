import { contextBridge }     from 'electron'
import { electronAPI }       from '@electron-toolkit/preload'
import { ConversationTopic } from "../../declarations";

// Custom APIs for renderer
const api = {
    separator: process.platform === 'win32' ? '\\' : '/',
    openAiKey: process.env.OPENAI_API_KEY,
    openFile: async (): Promise<string | null> => {
        return await electronAPI.ipcRenderer.invoke('open-file');
    },
    openDirectory: async (): Promise<string | null> => {
        return await electronAPI.ipcRenderer.invoke('open-directory');
    },
    conversations: {
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
    }
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if ( process.contextIsolated ) {
    try {
        contextBridge.exposeInMainWorld('electron', electronAPI)
        contextBridge.exposeInMainWorld('api', api)
    } catch (error) {
        console.error(error)
    }
}
else {
    // @ts-ignore (define in dts)
    window.electron = electronAPI
    // @ts-ignore (define in dts)
    window.api      = api
}
