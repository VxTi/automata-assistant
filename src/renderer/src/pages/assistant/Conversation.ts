/**
 * @fileoverview Conversation.ts
 * @author Luca Warmenhoven
 * @date Created on Friday, October 04 - 18:31
 */

import { CompletionMessage } from "../../util/Model";
import { createContext }     from "react";

/**
 * The conversation topic.
 * This interface represents a conversation topic,
 * and can be used to store the conversation history.
 */
export interface ConversationTopic {
    topic: string,
    date: string,
    messages: CompletionMessage[]
}

/** The chat context message type. */
export type ChatContextMessageType = { message: CompletionMessage, representation?: JSX.Element };

export interface ChatContextType {
    messages: ChatContextMessageType[],
    setMessages: (messages: ChatContextMessageType[]) => void,
    conversationTopic: string,
    setConversationTopic: (topic: string) => void,
    historyVisible: boolean,
    setHistoryVisible: (visible: boolean) => void,
    spokenResponse: boolean,
    setSpokenResponse: (spoken: boolean) => void
}

/**
 * The chat context.
 * This context is used to store the chat messages.
 */
export const ChatContext = createContext<ChatContextType>(
    {
        historyVisible: false, setHistoryVisible: () => void 0,
        spokenResponse: false, setSpokenResponse: () => void 0,
        conversationTopic: 'New conversation', setConversationTopic: () => void 0,
        messages: [], setMessages: () => void 0,
    });
