declare module '*.glsl' {
    const value: string;
    export default value;
}

/**
 * OpenAI module.
 * This module contains types and interfaces for the OpenAI API.
 * @module openai
 */
declare module openai {
    export type TranscriptionModel = 'whisper-1';

    export type SpeechVoiceType = 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer';
    export type SpeechModelType = 'tts-1' | 'tts-1-hd';

    export type CompletionMessageType = 'user' | 'system' | 'assistant';
    export type CompletionModelType = 'o1-preview' | 'chatgpt-4o-latest' | 'gpt-4o' | 'gpt-4o-mini' | 'gpt-3.5-turbo' | 'gpt-3.5-turbo-0125' | 'gpt-3.5-turbo-1106';

    export interface completions {

    }

    /**
     * Completion message interface.
     * This interface represents a message that can be used for completion.
     */
    export interface CompletionMessage {
        role: CompletionMessageType;
        content: string;
    }

    /**
     * The conversation topic.
     * This interface represents a conversation topic,
     * and can be used to store the conversation history.
     */
    export interface ConversationTopic {
        uuid: string,
        topic: string,
        date: number,
        messages: CompletionMessage[]
    }

    /**
     * Configuration object for the text completion.
     */
    export interface TextCompletionConfig {
        messages: CompletionMessage[];
        model: CompletionModelType;
        max_tokens?: number;
        temperature?: number;
        top_p?: number;
        tools?: CompletionToolFunction;
        files?: Blob[];
    }

    /**
     * Interface representing a tool parameter.
     */
    export interface CompletionToolParameter {
        type: 'object' | 'string' | 'number';
        description: string;
    }

    /**
     * Interface representing a GPT(3.5+) tool.
     * This can be used to call external API's.
     */
    export interface CompletionToolFunction {
        name: string;
        description?: string;
        parameters?: {};
    }

    /**
     * Configuration object for the transcription.
     */
    export interface TranscriptionConfig {

        language?: string;
        file: Blob;
        fileName: string;
        model: TranscriptionModel;
        temperature?: number;
    }

    /**
     * @fileoverview Model.ts
     * @author Luca Warmenhoven
     * @date Created on Friday, October 04 - 13:06
     */
    export interface SpeechGenerationConfig {
        input: string;
        voice: SpeechVoiceType;
        model?: SpeechModelType;
        speed?: number;
    }
}

export = openai;
