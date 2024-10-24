/**
 * @fileoverview ImageGenerationService.ts
 * @author Luca Warmenhoven
 * @date Created on Thursday, October 24 - 14:14
 */
import { Service } from "@renderer/util/external_services/Services";
import { ChatCompletionSession }               from "@renderer/util/completion/ChatCompletionSession";
import { ImageStyle, StableDiffusionResponse } from "stable-diffusion";

type ImageGenerationServiceParams = {
    prompt: string,
    imageStyle: ImageStyle,
    session: ChatCompletionSession
}

export class ImageGenerationService extends Service<ImageGenerationServiceParams> {

    constructor() {
        super('acquire_image');
    }

    /**
     * Invoke the image generation service.
     * This will attempt to generate an image and
     * display it to the user.
     * @param params The parameters to pass to the service.
     */
    public invoke(params: ImageGenerationServiceParams) {
        window['ai'].stableDiffusion(
            {
                prompt: params.prompt,
                style: params.imageStyle,
                response_format: 'url',
                model: 'dall-e-2',
                size: "512x512",
                n: 1
            }
        ).then((response: StableDiffusionResponse) => {
            fetch(response.data[ 0 ].url)
                .then(response => response.blob())
                .then(async blob => {
                    const buffer = await blob.arrayBuffer();
                    const binaryData: string = Array.from(new Uint8Array(buffer)).map(byte => String.fromCharCode(byte)).join('');
                    await window[ 'fs' ].saveResource({ name: `image_${Date.now()}.png`, data: binaryData, creationDate: response.created });
                });

            params.session.appendMessage({
                role: 'assistant',
                content: `<img src="${response.data[ 0 ].url}" alt="Generated image" class="w-64 h-64" />`
            });
        });
    }
}
