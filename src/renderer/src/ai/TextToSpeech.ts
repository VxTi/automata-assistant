/**
 * @fileoverview TTS.ts
 * @author Luca Warmenhoven
 * @date Created on Friday, October 11 - 14:46
 */
import { AIContext, Model } from "./AIContext";

export type VoiceType = 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer';
export type VoiceModel = 'tts-1' | 'tts-1-hd';

/**
 * The text-to-speech request.
 * This is the request object that is used to generate speech from text.
 */
export interface TTSRequest {
    input: string;
    model: VoiceModel;
    voice: VoiceType;
    speed?: number
}

/**
 * Default configuration for the text-to-speech request.
 */
const defaultConfiguration: TTSRequest = {
    input: '',
    model: 'tts-1',
    voice: 'nova'
};

/**
 * The text-to-speech class.
 * This class is used to generate speech from the given input text.
 */
export class TextToSpeech extends Model<TTSRequest> {

    /**
     * Constructs a new instance of the TTS class.
     * @param context The AI context to use.
     */
    constructor(context: AIContext) {
        super(context, 'tts');
    }

    /**
     * Create a new text-to-speech request.
     * This function returns a `Response` object that can be used to play the audio with.
     * This can be done by doing the following:
     * ```typescript
     *
     * const tts = new TextToSpeech(context);
     * tts.create('Hello, world!')
     *  .then(response => response.blob())
     *  .then(async audioBlob => { ... } )
     * ```
     * @param config The configuration for the text-to-speech request.
     */
    create(config: TTSRequest | string): Promise<Response> {
        if ( typeof config === 'string' )
            return super.create({ ...defaultConfiguration, input: config });
        return super.create(config);
    }
}
