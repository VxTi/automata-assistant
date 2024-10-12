import { ElectronAPI }                          from '@electron-toolkit/preload'
import { CompletionRequest, ConversationTopic } from "../ai/ChatCompletion";
import { SpeechToTextConfig }                   from "../ai/SpeechToText";
import { TTSRequest }                           from "../ai/TextToSpeech";

declare global {
    interface Window {
        electron: ElectronAPI
        fs: {
            separator: string,
            openFile: () => Promise<string | null>,
            openDirectory: () => Promise<string | null>
        },
        conversations: {
            save: (topic: ConversationTopic) => Promise<void>,
            delete: (uuid: string) => Promise<void>,
            list: () => Promise<ConversationTopic[]>
        },
        ai: {
            completion: {
                create: (prompt: string | CompletionRequest) => Promise<Response>
            },
            audio: {
                textToSpeech: (config: TTSRequest) => Promise<Response>,
                speechToText: (config: SpeechToTextConfig | Blob) => Promise<Response>
            }
        }
    }
}
