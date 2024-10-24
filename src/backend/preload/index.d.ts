import { ElectronAPI }                                        from '@electron-toolkit/preload'
import { ChatResponse, CompletionRequest, ConversationTopic } from "llm";
import { TTSRequest, VoiceType }                              from "tts";
import { SpeechToTextRequest }                                from "stt";
import { StableDiffusionConfig, StableDiffusionResponse }     from "stable-diffusion";
import { AbstractResource }                                   from "abstractions";


declare global {
    interface Window {
        electron: ElectronAPI,

        /**
         * File system APIs (Interacting with the file system)
         */
        fs: {
            /**
             * The path separator.
             */
            separator: string,

            /**
             * Open a file dialog to select a file.
             */
            selectFile: () => Promise<string[]>,

            /**
             * Open a directory dialog to select a directory.
             */
            selectDirectory: () => Promise<string>,

            /**
             * Open a file in the file explorer.
             */
            openFile: (path: string) => Promise<boolean>,

            /**
             * Saves a resource to the file system.
             */
            saveResource: (resource: AbstractResource) => Promise<void>,

            /**
             * Get a list of all loaded resources.
             */
            getResources: () => Promise<AbstractResource[]>,

            /**
             * Delete a resource from the file system.
             */
            deleteResource: (name: string) => Promise<void>,

            /**
             * Fetch a remote resource.
             * This will download the resource and return it as an AbstractResource.
             * This method makes sure there's no issues with CORS.
             * @param url The URL of the resource to fetch.
             * @returns A promise that resolves to the fetched resource.
             */
            fetchRemoteResource: (url: string) => Promise<AbstractResource>
        },

        /**
         * Conversation APIs (Managing locally stored conversations)
         */
        conversations: {
            /**
             * Save a conversation topic to the local storage.
             * @param topic The conversation topic to save.
             */
            save: (topic: ConversationTopic) => Promise<void>,

            /**
             * Delete a conversation topic from the local storage.
             * @param uuid The UUID of the conversation topic to delete.
             */
            delete: (uuid: string) => Promise<void>,

            /**
             * Get a list of all conversation topics.
             */
            list: () => Promise<ConversationTopic[]>
        },

        /**
         * AI APIs (Interacting with the AI models)
         */
        audio: {
            /**
             * Play an audio blob.
             * @param audioBlob The audio blob to play.
             */
            play: (audioBlob: Blob) => HTMLAudioElement,

            /**
             * Request microphone access.
             */
            requestMicrophone: () => Promise<MediaRecorder | null>
        },

        /**
         * AI APIs (Interacting with the AI models)
         */
        ai: {
            stableDiffusion: (request: StableDiffusionConfig) => Promise<StableDiffusionResponse>,
            completion: (request: CompletionRequest | string) => Promise<ChatResponse | null>,
            audio: {
                getVoiceAssistantExamples: () => Promise<{ data: Map<VoiceType, string> }>,
                textToSpeech: (request: TTSRequest) => Promise<{ data: string }>,
                speechToText: (request: SpeechToTextRequest) => Promise<string>,
                ttsBase64ToBlob: (base64: string) => Blob
                speechToTextFileLimit: number,
                audioSegmentationIntervalMs: number
            }
        }
    }
}
