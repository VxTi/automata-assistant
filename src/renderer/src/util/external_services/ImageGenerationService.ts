/**
 * @fileoverview ImageGenerationService.ts
 * @author Luca Warmenhoven
 * @date Created on Thursday, October 24 - 14:14
 */
import { Service }                             from "@renderer/util/external_services/Services";
import { ChatCompletionSession }               from "@renderer/util/completion/ChatCompletionSession";
import { ImageStyle, StableDiffusionResponse } from "stable-diffusion";
import { AbstractResource }                    from "abstractions";

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
        window[ 'ai' ]
            .stableDiffusion(
                {
                    prompt: params.prompt,
                    style: params.imageStyle,
                    response_format: 'url',
                    model: 'dall-e-2',
                    size: "256x256",
                    n: 1
                }
            )
            .then(async (response: StableDiffusionResponse) => {
                window[ 'fs' ]
                    .fetchRemoteResource(response.data[ 0 ].url)
                    .then((resource: AbstractResource) => {
                        const uint8Array = new TextEncoder().encode(resource.data);
                        const binaryString = new TextDecoder('latin1').decode(uint8Array);
                        resource.data = btoa(binaryString);
                        resource.name = params.prompt;
                        window['fs'].saveResource(resource);
                    })

                params.session.appendMessage(
                    {
                        role: 'assistant',
                        content: `<img src="${response.data[ 0 ].url}" alt="${params.prompt}" class="w-64 h-64" />`
                    });
            });
    }
}
