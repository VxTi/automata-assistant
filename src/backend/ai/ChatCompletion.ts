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
    model: 'gpt-3.5-turbo-1106',
    max_completion_tokens: 2048,
    temperature: 0.5,
}

export type ChatCompletionResponse = ChatResponse | (() => AsyncGenerator<ChatResponse>);

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
        super(context, 'chat/completions');
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

        if ( typeof config !== 'string')
        {
            config.model ??= this.defaultConfig.model;
        }

        const streaming = typeof config !== 'string' && 'stream' in config && config.stream;
        const response  = await super.create(typeof config === 'string'
                                             ?
                                                 {
                                                     ...this.defaultConfig,
                                                     messages: [ { role: 'user', content: config } ]
                                                 }
                                             : config) as Response;

        if ( !streaming )
            return await response.json() as ChatResponse;

        // Return an async iterator that will
        // parse the incoming packets and yield them.
        return (async function* (): AsyncGenerator<ChatResponse> {

            const reader     = response.body!.getReader();
            const decoder    = new TextDecoder('utf-8');
            let content      = '';
            let idxOfNewline = -1;

            while ( true ) {
                const { done, value } = await reader.read();
                if ( done ) break;

                const chunk = decoder.decode(value, { stream: true });

                // Decode the value and append it to the content
                content += chunk;

                idxOfNewline = content.indexOf('\n');

                // Since data fragmentation's can occur, we need to split the content
                // into lines and parse them individually.
                if ( idxOfNewline > -1 ) {
                    // Start from after 'data: '
                    const line = content.slice(6, idxOfNewline);

                    if ( line === '[DONE]' )
                        return;

                    console.log(line);
                    content = content.slice(idxOfNewline + 1);
                    idxOfNewline = -1;
                    yield JSON.parse(line) as ChatResponse;
                }
            }
        });
    }


}
