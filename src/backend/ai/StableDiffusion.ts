/**
 * @fileoverview StableDiffusion.ts
 * @author Luca Warmenhoven
 * @date Created on Sunday, October 13 - 13:19
 */
import { AIContext, AIModel } from "./AIContext";
import { StableDiffusionConfig } from "stable-diffusion";

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
