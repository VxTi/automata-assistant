/**
 * @fileoverview SpeechToText.ts
 * @author Luca Warmenhoven
 * @date Created on Friday, October 11 - 16:43
 */
import { AIContext, AIModel }                        from "./AIContext";
import { SpeechToTextRequest, SpeechToTextResponse } from "stt";

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
            const base64 = config[ 'file'];
            const byteCharacters = atob(base64);
            const byteNumbers    = new Array(byteCharacters.length);
            for ( let i = 0; i < byteCharacters.length; i++ ) {
                byteNumbers[ i ] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([ byteArray ], { type: 'audio/wav' });
            formData.append('file', blob, config[ 'fileName' ] ?? 'audio.wav');
        }
        else {
            formData.append('file', config[ 'file' ], config[ 'fileName' ]);
        }
        formData.append('model', config[ 'model' ] ?? 'whisper-1');
        formData.append('language', config[ 'language' ] ?? 'en');
        formData.append('temperature', String(config[ 'temperature' ] ?? .5));

        console.log(formData);

        try {
            const response = await super.create(formData);
            const json     = await response.json();
            console.log(json)
            return json.text as SpeechToTextResponse;
        } catch (error) {
            console.error(error);
            return '';
        }
    }
}
