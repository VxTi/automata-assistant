import { ElectronAPI }                                        from '@electron-toolkit/preload'
import { ChatResponse, CompletionRequest, ConversationTopic } from "llm";
import { TTSRequest, VoiceType }                              from "tts";
import { SpeechToTextRequest }                            from "stt";
import { StableDiffusionConfig, StableDiffusionResponse } from "stable-diffusion";
import { AbstractResource }                                   from "abstractions";


declare global {
    interface Window {
        electron: ElectronAPI
        fs: {
            separator: string,
            openFile: () => Promise<string[]>,
            openDirectory: () => Promise<string>,

            saveResource: (resource: AbstractResource) => Promise<void>,
            getResources: () => Promise<AbstractResource[]>,
            deleteResource: (name: string) => Promise<void>
        },
        conversations: {
            save: (topic: ConversationTopic) => Promise<void>,
            delete: (uuid: string) => Promise<void>,
            list: () => Promise<ConversationTopic[]>
        },
        audio: {
            play: (audioBlob: Blob) => HTMLAudioElement,
            requestMicrophone: () => Promise<MediaRecorder | null>
        },
        ai: {
            stableDiffusion: (request: StableDiffusionConfig) => Promise<StableDiffusionResponse>,
            completion: (request: CompletionRequest | string) => Promise<ChatResponse | null>,
            audio: {
                getVoiceAssistantExamples: () => Promise<{ data: Map<VoiceType, string> }>,
                textToSpeech: (request: TTSRequest) => Promise<{ data: string }>,
                speechToText: (request: SpeechToTextRequest) => Promise<string>,
                speechToTextFileLimit: number,
                audioSegmentationIntervalMs: number
            }
        }
    }
}
