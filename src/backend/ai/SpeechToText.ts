/**
 * @fileoverview SpeechToText.ts
 * @author Luca Warmenhoven
 * @date Created on Friday, October 11 - 16:43
 */
import { AIContext, AIModel } from "./AIContext";
import { decodeBase64Blob }   from "../../shared/Encoding";

type SpeechToTextModelType = 'whisper-1';

/**
 * Configuration object for the speech to text model.
 */
export interface SpeechToTextRequest {
    model: SpeechToTextModelType;
    language?: string;
    temperature?: number;
    file: Blob | string;
    fileName: string;
}

// Constants
export const SpeechToTextFileLimit       = 25 * 1024 * 1024;
export const AudioSegmentationIntervalMs = 500;

type SpeechToTextResponse = string;

/**
 * Speech to text model.
 * This model is used to transcribe speech from the given audio file.
 * Currently, this class only supports OpenAI's Whisper-1 model.
 */
export class SpeechToText extends AIModel {
    /**
     * Constructs a new instance of the SpeechToText class.
     * @param context The AI context to use.
     */
    constructor(context: AIContext) {
        super(context, 'audio/transcriptions');
    }

    /**
     * Create a new instance of the SpeechToText model.
     * @param config The configuration object for the speech to text model.
     * This can be either a configuration object, or a Blob object.
     */
    public async create(config: SpeechToTextRequest): Promise<SpeechToTextResponse> {
        const formData = new FormData();
        if ( typeof config[ 'file' ] === 'string' ) {

            // Convert base64 string to blob
            const arrayBuffer = Uint8Array.from(atob(config['file']), c => c.charCodeAt(0)).buffer;
            const blob        = new Blob([ arrayBuffer ], { type: 'audio/mpeg' });
            formData.append('file', blob, config[ 'fileName' ]);
        }
        else {
            formData.append('file', config[ 'file' ], config[ 'fileName' ]);
        }
        formData.append('language', config[ 'language' ] ?? 'en');
        formData.append('temperature', String(config[ 'temperature' ] ?? .5));
        formData.append('model', config[ 'model' ] ?? 'whisper-1');

        return await super.create(formData)
                          .then(response => response.json())
                          .then(json => json.text);
    }
}
