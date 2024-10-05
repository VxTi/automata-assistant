import { playAudio } from "./Audio";

export type TranscriptionModel = 'whisper-1';

export type SpeechVoiceType = 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer';
export type SpeechModelType = 'tts-1' | 'tts-1-hd';

export type CompletionMessageType = 'user' | 'system' | 'assistant';
export type CompletionModelType = 'gpt-4o' | 'gpt-3.5-turbo' | 'gpt-3.5-turbo-0125' | 'gpt-3.5-turbo-1106';

/**
 * Completion message interface.
 * This interface represents a message that can be used for completion.
 */
export interface CompletionMessage {
    role: CompletionMessageType;
    content: string;
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

interface Model {
    generate: (...props: any[]) => any;
    url: string;
    defaultConfiguration: any;
}

export const AIModels = {
    baseUrl: 'https://api.openai.com/v1/',
    /* @ts-ignore */
    apiKey: window.api.openAiKey,
    audio: {
        /**
         * Speech generation model.
         * This model is used to generate speech from the given input text.
         */
        speech: {
            url: 'audio/speech',
            defaultConfiguration: {
                model: 'tts-1',
                voice: 'nova',
                speed: 1.1
            } as SpeechGenerationConfig,
            /**
             * Generate speech from the given input text using the specified voice and model.
             * This will return a promise that resolves to a boolean indicating whether the speech was generated
             * successfully.
             * @param input The input text to generate speech from.
             * @param configuration The configuration object for the speech generation.
             */
            generate: async function (input: string, configuration: SpeechGenerationConfig = AIModels.audio.speech.defaultConfiguration) {
                return fetch(AIModels.baseUrl + this.url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + AIModels.apiKey },
                    body: JSON.stringify({ ...configuration, input: input })
                })
                    .then(response => response.blob())
                    .then(async blob => {
                        playAudio(blob);
                        return blob;
                    })
                    .catch(_ => null)
            }
        } as Model,

        /**
         * Transcription model.
         * This model is used to transcribe audio from the given file.
         */
        transcription: {
            url: 'audio/transcriptions',
            defaultConfiguration: {
                model: 'whisper-1',
                language: 'en',//'en',
            } as TranscriptionConfig,
            generate: async function (config: TranscriptionConfig) {
                const formData = new FormData();
                formData.append('file', config.file, config.fileName);
                formData.append('model', config.model);
                if ( config.language ) {
                    formData.append('language', config.language);
                }
                if ( config.temperature ) {
                    formData.append('temperature', config.temperature.toString());
                }

                return fetch(AIModels.baseUrl + this.url, {
                    method: 'POST',
                    headers: {
                        'Authorization': 'Bearer ' + AIModels.apiKey
                    },
                    body: formData
                })
                    .then(response => response.json())
                    .then(json => json.text)
                    .catch(_ => "Sorry, something went wrong with the transcription.")
            }
        } as Model
    },
    chat: {
        url: 'chat/completions',
        defaultConfiguration: {
            model: 'gpt-3.5-turbo',
            max_tokens: 1024,
            temperature: 0.5,
            messages: []
        } as TextCompletionConfig,
        /**
         * Generate a response to the given messages using the specified model.
         * This function returns a promise that resolves to the generated response
         * once the response is complete.
         * @param prompt The prompt to generate a response to.
         * @param messages The messages to generate a response to.
         * @param config The configuration object for the response generation.
         */
        generate: async function (prompt: string, messages: CompletionMessage[] = [], config: TextCompletionConfig = AIModels.chat.defaultConfiguration): Promise<Object> {
            return fetch(AIModels.baseUrl + this.url, {
                method: 'POST',
                headers: {
                    'Authorization': 'Bearer ' + AIModels.apiKey,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(
                    {
                        ...config,
                        messages: [
                            ...config.messages,
                            ...messages,
                            { role: 'user', content: prompt }
                        ]
                    })
            })
                .then(response => response.json())
                .catch(_ => {
                    console.error("Sorry, something went wrong.");
                    return null;
                })
        }
    } as Model,

    /**
     * Validate the given OpenAI API key.
     * This function returns a promise that resolves to a string indicating whether the key is valid or not.
     * @param key The OpenAI API key to validate.
     */
    validateApiKey: async function (key: String): Promise<('valid' | 'invalid' | 'error')> {
        if ( key === undefined || key === null || key === '' )
            return 'invalid';
        console.log("Info - Validating OpenAI API key");
        return await fetch(this.baseUrl + 'models', {
            method: 'GET',
            headers: { 'Authorization': 'Bearer ' + key }
        })
            // Request status checking
            .then(response => {
                if ( response.status != 200 )
                    return 'error';
                return response.json()
            })
            // Key validation
            .then(json => {
                if ( json[ 'error' ] )
                    return 'invalid';
                return 'valid';
            })
            .catch(_ => 'error');
    }
}