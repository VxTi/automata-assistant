/**
 * @fileoverview ChatCompletion.ts
 * @author Luca Warmenhoven
 * @date Created on Friday, October 11 - 15:02
 */

import { AIContext, AIModel }                                             from "./AIContext";
import { ChatResponse, CompletionRequest, Message, StreamedChatResponse } from "./ChatCompletionDefinitions";

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

export type ChatCompletionResponse = ChatResponse | (() => AsyncGenerator<StreamedChatResponse>);

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

        if ( typeof config !== 'string' ) {
            config['model'] = config['model'] ?? this.defaultConfig.model;
        }

        const streaming = typeof config !== 'string' && 'stream' in config && config.stream;
        const response  = await super.create(
            typeof config === 'string' ?
                { ...this.defaultConfig, messages: [ { role: 'user', content: config } ] } : config
        ) as Response;

        if ( !streaming )
            return await response.json() as ChatResponse;

        // Return an async iterator that will
        // parse the incoming packets and yield them.
        return (async function* (): AsyncGenerator<StreamedChatResponse> {

            const reader     = response.body!.getReader();
            const decoder    = new TextDecoder('utf-8');
            let content      = '';
            let idxOfNewline = -1;

            /**
             * Read the incoming data and yield the parsed JSON.
             * Since some chunks arrive in multiple parts, we'll need to
             * buffer the data and split it into lines.
             */
            while ( true ) {
                const { done, value } = await reader.read();
                if ( done || !value)
                    return;

                // Decode the value and append it to the content
                content += decoder.decode(value, { stream: true });

                console.log("Reading packet: ", content);

                // Since data fragmentation's can occur, we need to split the content
                // into lines and parse them individually.
                while (( idxOfNewline = content.indexOf('\n') ) > -1 && content.length > 0 ) {
                    // Start from after 'data: '
                    const line = content.slice(6, idxOfNewline);

                    if ( line.length === 0 ) continue;
                    if ( line === '[DONE]') return;

                    try {
                        const parsed = JSON.parse(line);
                        console.log('Parsed: ', parsed);
                        console.log("Content: ", parsed.choices[0].delta);
                        yield parsed as StreamedChatResponse;
                    } catch (e) {
                        console.error("Failed to parse JSON: ", line);
                    }
                    content = content.slice(idxOfNewline + 1);
                    await new Promise(resolve => setImmediate(resolve));
                }
            }
        });
    }
}
