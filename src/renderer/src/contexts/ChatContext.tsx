/**
 * @fileoverview ChatContext.ts
 * @author Luca Warmenhoven
 * @date Created on Friday, October 04 - 18:31
 */

import { createContext, ReactNode, RefObject, useRef, useState } from "react";
import { Marked }                                                from "marked";
import markedKatex                                     from "marked-katex-extension";
import hljs                                            from "highlight.js";
import { markedHighlight }                             from "marked-highlight";
import { Message }                                     from "llm";
import { ChatCompletionSession }                       from "@renderer/util/completion/ChatCompletionSession";

export const mdParser = new Marked();
mdParser.use(
    markedKatex(
        {
            throwOnError: false,
            nonStandard: true,
            displayMode: true,
            output: 'html',
        })
);
mdParser.use(
    markedHighlight(
        {
            langPrefix: 'hljs language-',
            highlight(code: string, lang: string) {
                const language = hljs.getLanguage(lang) ? lang : 'plaintext';
                return hljs.highlight(code, { language }).value;
            }
        }),
);


export interface ChatContextType {
    messages: Message[],
    setMessages: (messages: (previous: Message[]) => (Message)[]) => void,
    conversationTopic: string,
    setConversationTopic: (topic: string) => void,
    spokenResponse: boolean,
    setSpokenResponse: (spoken: boolean) => void,
    lastMessageRef: RefObject<HTMLDivElement>,
}

/**
 * The chat context.
 * This context is used to store the chat messages.
 */
export const ChatContext = createContext<ChatContextType>(
    {
        spokenResponse: false, setSpokenResponse: () => void 0,
        conversationTopic: 'New conversation', setConversationTopic: () => void 0,
        messages: [], setMessages: () => void 0,
        lastMessageRef: { current: null },
    });

/**
 * Context for chat sessions
 */
export const ChatSessionContext = createContext<{
    session: ChatCompletionSession,
    verbose: boolean, setVerbose: (verbose: boolean) => void,
}>({ session: {} as ChatCompletionSession, verbose: false, setVerbose: () => void 0 });

export function ChatContextProvider(props: { children: ReactNode }) {

    const [ verbose, setVerbose ] = useState<boolean>(false);

    const chatSessionRef = useRef<ChatCompletionSession>(
        new ChatCompletionSession(
            {
                messages: [],
                model: 'gpt-4o-mini',
                stream: true
            }));
    return (
        <ChatSessionContext.Provider value={{ session: chatSessionRef.current, verbose, setVerbose }}>
            {props.children}
        </ChatSessionContext.Provider>
    )
}
