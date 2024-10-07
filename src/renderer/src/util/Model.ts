import { playAudio } from "./Audio";
import { CompletionMessage, SpeechGenerationConfig, TextCompletionConfig, TranscriptionConfig } from "declarations";

/**
 * AI models object.
 * This object contains all the AI models that can be used in the application.
 */
export const openai = {
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
                speed: 1.0
            } as SpeechGenerationConfig,
            /**
             * Generate speech from the given input text using the specified voice and model.
             * This will return a promise that resolves to a boolean indicating whether the speech was generated
             * successfully.
             * @param input The input text to generate speech from.
             * @param configuration The configuration object for the speech generation.
             */
            generate: async function (input: string, configuration: SpeechGenerationConfig = openai.audio.speech.defaultConfiguration) {
                return fetch(openai.baseUrl + this.url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + openai.apiKey },
                    body: JSON.stringify({ ...configuration, input: input })
                })
                    .then(response => response.blob())
                    .then(async blob => {
                        playAudio(blob);
                        return blob;
                    })
                    .catch(_ => null)
            }
        },

        /**
         * Transcription model.
         * This model is used to transcribe audio from the given file.
         */
        transcription: {
            url: 'audio/transcriptions',
            defaultConfiguration: {
                model: 'whisper-1',
                language: 'en',
            } as TranscriptionConfig,

            // see https://help.openai.com/en/articles/8555545-file-uploads-faq
            // 25MB limit
            fileSizeLimit: 25 * 1024 * 1024,
            fragmentationInterval: 500, // 500ms per blob fragment

            /**
             * Generate a transcription from the given audio file using the specified model.
             * This function returns a promise that resolves to the generated transcription
             * @param config The configuration object for the transcription.
             */
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

                return fetch(openai.baseUrl + this.url, {
                    method: 'POST',
                    headers: {
                        'Authorization': 'Bearer ' + openai.apiKey
                    },
                    body: formData
                })
                    .then(response => response.json())
                    .then(json => json.text)
                    .catch(_ => "Sorry, something went wrong with the transcription.")
            }
        }
    },
    chat: {
        url: 'chat/completions',
        defaultConfiguration: {
            model: 'gpt-4o',//'gpt-3.5-turbo',
            max_tokens: 1024,
            temperature: 0.5,
            messages: []
        } as TextCompletionConfig,

        // see https://help.openai.com/en/articles/8555545-file-uploads-faq
        maxFileCount: 20,
        fileSizeHardLimit: 512 * (1 << 20), // 512MB
        imageFileSizeLimit: 20 * (1 << 20), // 20MB
        spreadsheetFileSizeLimit: 50 * (1 << 20), // 50MB

        /**
         * Generate a response to the given messages using the specified model.
         * This function returns a promise that resolves to the generated response
         * once the response is complete.
         * @param prompt The prompt to generate a response to.
         * @param messages The messages to generate a response to.
         * @param config The configuration object for the response generation.
         */
        generate: async function (prompt: string, messages: CompletionMessage[] = [], config: TextCompletionConfig = openai.chat.defaultConfiguration): Promise<Object> {

            // If there's files to upload, add them to the form data
            if ( config.files && config.files.length > 0 ) {
                const formData = new FormData();
                for ( let i = 0; i < config.files.length; i++ ) {
                    formData.append('files', config.files[ i ]);
                }
            }

            return fetch(openai.baseUrl + this.url, {
                method: 'POST',
                headers: {
                    'Authorization': 'Bearer ' + openai.apiKey,
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
    },

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