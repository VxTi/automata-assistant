/**
 * @fileoverview ChatCompletion.ts
 * @author Luca Warmenhoven
 * @date Created on Friday, October 11 - 15:02
 */

import { AIContext, AIModel }         from "./AIContext";
import { CompletionRequest, Message } from "./ChatRequest";
import { ChatResponse }               from "./ChatResponse";

/**
 * The conversation topic.
 * This interface represents a conversation topic,
 * and can be used to store the conversation history.
 */
export interface ConversationTopic {
    /**
     * The UUID of the conversation topic.
     * This is used to identify the conversation topic.
     */
    uuid: string;

    /**
     * The topic of the conversation.
     * This is a summary generated based on the initial message of the conversation.
     */
    topic: string;

    /**
     * The date of the conversation.
     * This is updated whenever a new message is added to the conversation.
     */
    date: number;

    /**
     * The messages of the conversation.
     */
    messages: Message[]
}

const defaultConfiguration: CompletionRequest = {
    model: 'google/gemini-flash-1.5-exp',
    max_tokens: 2048,
    temperature: 0.5,
    messages: []
};

type ChatCompletionResponse = ChatResponse | (() => AsyncIterator<ChatResponse>);

export class ChatCompletion extends AIModel {

    /**
     * The base request.
     * This request is used to set the default model or other parameters.
     */
    private readonly defaultConfig: CompletionRequest;

    /**
     * Constructs a new instance of the Chat Completion class.
     * @param context The AI context to use.
     * @param defaultConfig The base request to use. This can be used
     * to set the default model or other parameters.
     */
    constructor(context: AIContext, defaultConfig?: CompletionRequest) {
        super(context, 'chat/completion');
        this.defaultConfig = defaultConfig || defaultConfiguration;
    }

    /**
     * Create a new completion request.
     * @param config The configuration of the completion request.
     * This can be a string or a completion request object.
     * When a string is provided, the string is used as the prompt,
     * and the base request is used as the configuration.
     */
    public async create(config: CompletionRequest | string): Promise<ChatCompletionResponse> {

        const streaming = typeof config === 'object' && config.stream;
        const response  = await super.create(typeof config === 'string' ?
                                                 { ...this.defaultConfig, prompt: config } : config) as Response;

        if ( !streaming )
            return await response.json() as ChatResponse;

        return (async function* (): AsyncIterator<ChatResponse> {

            const reader  = response.body!.getReader();
            const decoder = new TextDecoder('utf-8');
            let content   = '';
            let idxOfNewline = -1;

            while ( true ) {
                const { done, value } = await reader.read();
                if ( done ) break;

                content += decoder.decode(value);

                // Split the content by newlines
                while ( (idxOfNewline = content.indexOf('\n')) >= 0 ) {
                    // Start from after 'data: '
                    const line = content.slice(6, idxOfNewline);
                    console.log(line);
                    content    = content.slice(idxOfNewline + 1);
                    yield JSON.parse(line) as ChatResponse;
                }
            }
        });
    }


}
