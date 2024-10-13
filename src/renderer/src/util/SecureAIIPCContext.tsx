/**
 * @fileoverview SecureAIIPCContext.tsx
 * @author Luca Warmenhoven
 * @date Created on Saturday, October 12 - 14:11
 */
import { createContext, Dispatch, ReactNode, SetStateAction, useEffect, useState } from "react";
import {
    ChatResponse
}                                                                                  from "../../../backend/ai/ChatResponse";

const emptyHandler = () => void 0;

export const SecureAIIPCContext = createContext<{
    setCompletionHandler: Dispatch<SetStateAction<undefined | ((response: ChatResponse) => void)>>,
    setSpeechToTextHandler: Dispatch<SetStateAction<undefined | ((text: string) => void)>>,
    setTextToSpeechHandler: Dispatch<SetStateAction<undefined | ((buffer: Buffer) => void)>>,
}>(
    {
        setCompletionHandler: emptyHandler, setSpeechToTextHandler: emptyHandler, setTextToSpeechHandler: emptyHandler
    }
);

/**
 * This context provider will provide the necessary handlers to the AIIPCContext.
 * This allows the main process to communicate with the renderer process
 * without sharing any sensitive information.
 */
export function SecureAIIPCContextProvider(props: { children: ReactNode }) {

    const [ completionHandler, setCompletionHandler ]     = useState<undefined | ((response: ChatResponse) => void)>(emptyHandler);
    const [ speechToTextHandler, setSpeechToTextHandler ] = useState<undefined | ((text: string) => void)>(emptyHandler);
    const [ textToSpeechHandler, setTextToSpeechHandler ] = useState<undefined | ((buffer: Buffer) => void)>(emptyHandler);

    useEffect(() => {

        console.log('evt: ', window, window[ 'events' ].on);
        if ( !window[ 'events' ] || typeof window[ 'events' ].on !== 'function' )
            return;

        // @ts-ignore
        const ipc = electron.ipcRenderer;
        ipc.on('ai:chat-completion-response', (response: ChatResponse) => (completionHandler ?? emptyHandler)(response));
        ipc.on('ai:text-to-speech-response', (buffer: Buffer) => (textToSpeechHandler ?? emptyHandler)(buffer));
        ipc.on('ai:speech-to-text-response', (text: string) => (speechToTextHandler ?? emptyHandler)(text));

    }, []);

    return (
        <SecureAIIPCContext.Provider
            value={{ setCompletionHandler, setTextToSpeechHandler, setSpeechToTextHandler }}>
            {props.children}
        </SecureAIIPCContext.Provider>
    );
}
