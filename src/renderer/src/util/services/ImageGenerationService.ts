/**
 * @fileoverview ImageGenerationService.ts
 * @author Luca Warmenhoven
 * @date Created on Thursday, October 24 - 14:14
 */
import { Service }                                              from "@renderer/util/services/Services";
import { ChatCompletionSession }                                from "@renderer/util/completion/ChatCompletionSession";
import { ImageDimensions, ImageStyle, StableDiffusionResponse } from "stable-diffusion";
import { AbstractResource }                                     from "abstractions";
import { Settings }                                             from "@renderer/util/Settings";

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
        const imageSize = Settings.get(Settings.IMAGE_GENERATION_QUALITY) as ImageDimensions;
        params.session.appendFragment(
            {
                type: 'text', content: 'Generating image...'
            }, 'assistant'
        );

        window[ 'ai' ]
            .stableDiffusion(
                {
                    prompt: params.prompt,
                    style: params.imageStyle,
                    response_format: 'url',
                    model: 'dall-e-2',
                    size: imageSize,
                    n: 1
                }
            )
            .then(async (response: StableDiffusionResponse) => {
                console.log(response)

                if ( 'error' in response ) {

                    params.session.appendFragment(
                        {
                            type: 'text', content: 'An error occurred while generating the image: ' + response.error
                        },
                        'assistant',
                    )
                    return;
                }

                window[ 'fs' ]
                    .fetchRemoteResource(response.data[ 0 ].url)
                    .then((resource: AbstractResource) => {
                        const uint8Array   = new TextEncoder().encode(resource.data);
                        const binaryString = new TextDecoder('latin1').decode(uint8Array);
                        resource.data      = btoa(binaryString);
                        resource.name      = params.prompt;
                        window[ 'fs' ].saveResource(resource);
                    })

                params.session.appendFragment(
                    {
                        type: 'image',
                        url: response.data[ 0 ].url,
                        alt: params.prompt,
                        dimensions: imageSize
                    },
                    'assistant');
            });
    }
}
