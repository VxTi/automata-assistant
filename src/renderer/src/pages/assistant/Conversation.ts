/**
 * @fileoverview Conversation.ts
 * @author Luca Warmenhoven
 * @date Created on Friday, October 04 - 18:31
 */

import { createContext, RefObject } from "react";
import { Marked }                   from "marked";
import markedKatex                  from "marked-katex-extension";
import hljs                         from "highlight.js";
import { markedHighlight }          from "marked-highlight";
import { Message }                  from "../../../../backend/ai/ChatCompletionDefinitions";


export const mdParser = new Marked();
mdParser.use(
    markedKatex(
        {
            throwOnError: false,
            nonStandard: true,
            displayMode: true,
            output: 'html',
        }),
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
    topicUUID: string | undefined,
    setTopicUUID: (uuid: string) => void,
    conversationTopic: string,
    setConversationTopic: (topic: string) => void,
    spokenResponse: boolean,
    setSpokenResponse: (spoken: boolean) => void,
    lastMessageRef: RefObject<HTMLDivElement>,
    setLiveChatActive: (active: boolean) => void
}

/**
 * The chat context.
 * This context is used to store the chat messages.
 */
export const ChatContext = createContext<ChatContextType>(
    {
        spokenResponse: false, setSpokenResponse: () => void 0,
        topicUUID: undefined, setTopicUUID: () => void 0,
        conversationTopic: 'New conversation', setConversationTopic: () => void 0,
        messages: [], setMessages: () => void 0,
        lastMessageRef: { current: null },
        setLiveChatActive: () => void 0
    });
