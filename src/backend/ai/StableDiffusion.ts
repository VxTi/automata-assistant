/**
 * @fileoverview StableDiffusion.ts
 * @author Luca Warmenhoven
 * @date Created on Sunday, October 13 - 13:19
 */
import { AIContext, AIModel } from "./AIContext";

export type StableDiffusionModelType = 'dall-e-3' | 'dall-e-2';
export type ImageDimensions = '1024x2024' | '1024x1792' | '1792x1024';

/**
 * Configuration object for the stable diffusion model.
 */
export interface StableDiffusionConfig {
    /**
     * The size of the image to generate.
     * This defaults to 1024x1024.
     */
    size?: ImageDimensions;

    /**
     * The model to use for the image generation.
     * This defaults to DALL-E 2.
     */
    model?: StableDiffusionModelType;

    /**
     * The prompt to use for the image generation.
     */
    prompt: string;

    /**
     * The quality of the image to generate.
     * Setting this to 'hd' will generate a high-definition image.
     * This parameter is only available for DALL-E 3.
     */
    quality?: 'hd' | undefined;

    /**
     * The number of images to generate.
     * This is 1 for DallE-3, and up to 10 for DallE-2.
     */
    n?: number;

    /**
     * The response format to use.
     * This can be either 'url' or 'b64_json'.
     */
    response_format?: 'url' | 'b64_json';

    /**
     * The style of the image to generate.
     * This can be either 'vivid' or 'natural'.
     * This parameter is only available for DALL-E 3.
     */
    style?: 'vivid' | 'natural';
}

/**
 * Stable Diffusion model.
 * This model is used to generate images using the Stable Diffusion model.
 * Currently, this class only supports OpenAI's DALL-E model.
 */
export class StableDiffusion extends AIModel {

    /**
     * Constructs a new instance of the Stable Diffusion class.
     * @param context The AI context to use.
     */
    constructor(context: AIContext) {
        super(context, 'images/generations');
    }

    /**
     * Create a new instance of the Stable Diffusion model.
     * @param config The configuration object for the stable diffusion model.
     */
    public async create(config: StableDiffusionConfig): Promise<any> {
        return super.create(config);
    }
}
