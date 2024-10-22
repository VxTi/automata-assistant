/**
 * @fileoverview ChatConversationInteractivityHook.ts
 * @author Luca Warmenhoven
 * @date Created on Tuesday, October 22 - 17:01
 */
import { useCallback, useContext, useRef, useState } from "react";
import { Message, StreamedChatResponse }             from "llm";
import { ChatContext }                               from "@renderer/contexts/ChatContext";

/**
 * @description This hook is used to interact with the chat assistant in any way.
 * This hook is used to append messages and message chunks to the current conversation.
 * @returns appendChunk, appendMessage
 */
export function useAssistant() {

    const [ isStreaming, setIsStreaming ]                                               = useState(false);
    const { messages, setMessages, setTopicUUID, setConversationTopic, spokenResponse } = useContext(ChatContext);
    const streamedResponseBuffer                                                        = useRef<string>('');
    const toolCallBuffer                                                                = useRef<string>('');

    const responseListeners = useRef<Map<string, (response: string) => void>>(new Map());

    /*
     * Appends an incoming chunk to the appropriate buffer.
     */
    const appendChunk = useCallback((chunk: StreamedChatResponse) => {

        if ( chunk.choices[ 0 ].delta.content ) {
            streamedResponseBuffer.current += chunk.choices[ 0 ].delta.content;
        }
        else if ( chunk.choices[ 0 ].delta.tool_calls ) {
            toolCallBuffer.current += chunk.choices[ 0 ].delta.tool_calls;
        }

        // If the finish reason is stop, we can call all listeners with the streamed response buffer.
        if ( chunk.choices[ 0 ].delta.finish_reason === 'stop' ) {

            // Call all listeners with the streamed response buffer.
            responseListeners.current.forEach((listener) => {
                listener(streamedResponseBuffer.current);
            });

            if ( messages.length <= 1 ) {
                setTopicUUID(Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15));

            }

            setMessages((prev) => [ ...prev, { content: streamedResponseBuffer.current, role: 'assistant' } ]);

            streamedResponseBuffer.current = '';

            setIsStreaming(false);
            return;
        }
        else if ( !isStreaming ) {
            setIsStreaming(true);
        }
    }, [ isStreaming, streamedResponseBuffer, toolCallBuffer ]);

    /*
     * Appends a message to the conversation.
     */
    const appendMessage = useCallback((message: Message) => {
        setMessages((prev) => [ ...prev, message ]);
    }, [ messages ]);

    /*
     * Requests a completion from the assistant.
     */
    const requestCompletion = useCallback((message: Message) => {
        const newMessages = [ ...messages, message ];
        window[ 'ai' ].completion(
            {
                model: 'gpt-4o-mini',
                messages: newMessages
            });
        appendMessage(message);
    }, [ messages, appendMessage ]);

    /*
     * Registers a response listener to the assistant.
     * These will be called when a complete response is received (not a chunk).
     */
    const addResponseListener = useCallback((id: string, listener: (response: string) => void) => {
        responseListeners.current.set(id, listener);
    }, [ responseListeners ]);

    /**
     * Removes a response listener from the assistant.
     */
    const removeResponseListener = useCallback((id: string) => {
        responseListeners.current.delete(id);
    }, [ responseListeners ]);


    return {
        requestCompletion,
        appendChunk,
        appendMessage,
        isStreaming,
        addResponseListener,
        removeResponseListener
    };
}
