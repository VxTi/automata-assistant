/**
 * @fileoverview ChatCompletion.ts
 * @author Luca Warmenhoven
 * @date Created on Friday, October 11 - 15:02
 */

import { AIContext, AIModel }              from "./AIContext";
import { mainWindow }                      from "../main";
import { ChatResponse, CompletionRequest } from "llm";

const defaultConfiguration: CompletionRequest = {
    model: 'gpt-3.5-turbo-1106',
    max_completion_tokens: 2048,
    temperature: 0.5,
}

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
    public async create(config: CompletionRequest | string): Promise<ChatResponse | null> {

        if ( typeof config !== 'string' ) {
            config[ 'model' ] = config[ 'model' ] ?? this.defaultConfig.model;
        }

        const streaming = typeof config !== 'string' && 'stream' in config && config.stream;
        const response  = await super.create(
            typeof config === 'string' ?
                { ...this.defaultConfig, messages: [ { role: 'user', content: config } ] } : config
        ) as Response;

        if ( !streaming )
            return await response.json() as ChatResponse;

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
            if ( done || !value )
                break;

            // Decode the value and append it to the content
            content += decoder.decode(value, { stream: true });

            while ( (idxOfNewline = content.indexOf('\n')) > -1 && content.length > 6 ) {
                // Start from after 'data: ' (6 characters)
                const line = content.slice(6, idxOfNewline).trim();

                if ( line.length === 0 ) {
                    content = content.slice(idxOfNewline + 1);
                    continue;
                }
                if ( line === '[DONE]' )
                    break;

                try {
                    const parsed = JSON.parse(line);
                    mainWindow!.webContents.send('ai:completion-chunk', parsed);
                } catch (e) {
                    console.error("Failed to parse JSON: ", line);
                }
                content = content.slice(idxOfNewline + 1);
            }
        }
        mainWindow!.webContents.send('ai:completion-chunk-end');
        return null;
    }
}
