/**
 * @fileoverview ChatContext.ts
 * @author Luca Warmenhoven
 * @date Created on Friday, October 04 - 18:31
 */

import { createContext, ReactNode, useRef } from "react";
import { Marked }                           from "marked";
import markedKatex                          from "marked-katex-extension";
import hljs                                 from "highlight.js";
import { markedHighlight }                  from "marked-highlight";
import { ChatCompletionSession }            from "@renderer/util/completion/ChatCompletionSession";

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

const mainChatSession = new ChatCompletionSession(
    {
        messages: [],
        model: 'gpt-4o-mini',
        stream: true
    });

/**
 * Context for chat sessions
 */
export const ChatSessionContext = createContext<{ session: ChatCompletionSession }>({ session: mainChatSession });

export function ChatContextProvider(props: { children: ReactNode }) {

    const chatSessionRef = useRef<ChatCompletionSession>(mainChatSession);
    return (
        <ChatSessionContext.Provider value={{ session: chatSessionRef.current }}>
            {props.children}
        </ChatSessionContext.Provider>
    )
}
