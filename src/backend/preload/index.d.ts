import { ElectronAPI }                                               from '@electron-toolkit/preload'
import { ChatCompletion, ChatCompletionResponse, ConversationTopic } from "../ai/ChatCompletion";
import { SpeechToText, SpeechToTextRequest }   from "../ai/SpeechToText";
import { TextToSpeech, TTSRequest, VoiceType } from "../ai/TextToSpeech";
import {
    ChatResponse,
    CompletionRequest
}                                              from "../ai/ChatCompletionDefinitions";

declare global {
    interface Window {
        electron: ElectronAPI
        fs: {
            separator: string,
            openFile: () => Promise<string[]>,
            openDirectory: () => Promise<string>
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
