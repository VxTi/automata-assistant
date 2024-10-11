/**
 * @fileoverview SpeechToText.ts
 * @author Luca Warmenhoven
 * @date Created on Friday, October 11 - 16:43
 */
import { AIContext, Model } from "./AIContext";

type SpeechToTextModelType = 'whisper-1';

/**
 * Configuration object for the speech to text model.
 */
export interface SpeechToTextConfig {
    model: SpeechToTextModelType;
    language?: string;
    temperature?: number;
    file: Blob;
    fileName: string;
}

// Constants
export const SpeechToTextFileLimit = 25 * 1024 * 1024;
export const AudioSegmentationIntervalMs = 500;

// Default configuration
const defaultConfiguration = {
    model: 'whisper-1',
    fileName: 'audio.wav'
} as SpeechToTextConfig;

/**
 * Speech to text model.
 * This model is used to transcribe speech from the given audio file.
 * Currently, this class only supports OpenAI's Whisper-1 model.
 */
export class SpeechToText extends Model<SpeechToTextConfig>
{
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
    create(config: SpeechToTextConfig | Blob): Promise<Response> {
        if ( config instanceof Blob ) {
            return super.create({ ...defaultConfiguration, model: 'whisper-1', file: config });
        }
        return super.create(config);
    }
}
