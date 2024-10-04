import { contextBridge }     from 'electron'
import { electronAPI }       from '@electron-toolkit/preload'
import { ConversationTopic } from "../renderer/src/pages/assistant/Conversation";

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
    getTopicHistory: async (): Promise<string[]> => {
        return await electronAPI.ipcRenderer.invoke('get-topic-history');
    },
    saveTopicHistory: async (topics: ConversationTopic[]): Promise<void> => {
        return await electronAPI.ipcRenderer.invoke('save-topic-history', topics);
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
