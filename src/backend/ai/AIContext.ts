/**
 * @fileoverview AIContext.ts
 * @author Luca Warmenhoven
 * @date Created on Friday, October 11 - 15:05
 */

import AIContextConfig = aiCtx.AIContextConfig;
import AIContextRequestParams = aiCtx.AIContextRequestParams;

/**
 * The AI Context class.
 * This class is used to make requests to the AI.
 */
export class AIContext {
    private readonly config: AIContextConfig;

    /**
     * Constructs a new instance of the AI Context.
     * This context can make API calls using its API key.
     * @param config The configuration object for the AI context.
     */
    constructor(config: AIContextConfig) {
        this.config = config;
        this.config.baseURL ??= 'https://api.openai.com/v1/'; // Default to OpenAI
    }

    /**
     * Make a request to the AI.
     * This uses the configured fetch method to make a request to the AI.
     * @param params The configuration of the request.
     */
    public request(params: AIContextRequestParams): Promise<Response> {
        return fetch(this.config.baseURL + params.route, {
            method: params.method ?? 'POST',
            headers: {
                'Authorization': 'Bearer ' + this.config.apiKey,
                'Content-Type': 'application/json',
            },
            body: (params.body instanceof FormData || typeof params.body === 'string') ?
                  params.body : JSON.stringify(params.body)
        });
    }
}

/**
 * The model class.
 * This is the parent class for all AI models,
 */
export class AIModel {

    /**
     * The AI context to use for the model.
     */
    private readonly aiContext: AIContext;

    /**
     * The route to use for the model,
     * e.g. `audio/speech`
     */
    private readonly route: string;

    /**
     * Constructs a new instance of the model.
     * @param context The AI context to use.
     * @param route The route to use.
     */
    constructor(context: AIContext, route: string) {
        this.aiContext = context;
        this.route     = route;
    }

    /**
     * Create a new instance of the model.
     * @param config The configuration of the model.
     */
    public async create(config: any): Promise<any> {
        return this.aiContext.request({ route: this.route, body: config });
    }
}
