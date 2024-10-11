/**
 * @fileoverview AIContext.ts
 * @author Luca Warmenhoven
 * @date Created on Friday, October 11 - 15:05
 */


/**
 * Configuration object for the AI Context.
 */
export interface AIContextConfig {

    /**
     * The API key to use for the context.
     */
    apiKey: string;

    /**
     * The base URL of the API, e.g. https://api.openai.com/v1
     */
    baseURL: string;

    /**
     * The name of the application.
     * This is only used for OpenRouter.
     */
    appName?: string;

    /**
     * The URL of the site.
     * This is also only used for OpenRouter.
     */
    siteURL?: string;

    /**
     * The fetch method to use.
     * This defaults to the global fetch method.
     */
    fetchMethod?: (url: string | URL | Request, init?: RequestInit) => Promise<Response>
}

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
    }

    /**
     * Make a request to the AI.
     * This uses the configured fetch method to make a request to the AI.
     * @param route The route to request, e.g. 'audio/speech'
     * @param method The method to use, e.g. 'POST'
     * @param body The body of the request.
     */
    request(route: string, method: string, body: any): Promise<Response> {
        return (this.config.fetchMethod ?? fetch)(this.config.baseURL + route, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + this.config.apiKey
            },
            body: JSON.stringify(body)
        });
    }
}

/**
 * The model class.
 * This is the parent class for all AI models,
 */
export class Model<T> {

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
     * @param context
     */
    constructor(context: AIContext, route: string) {
        this.aiContext = context;
        this.route     = route;
    }

    /**
     * Create a new instance of the model.
     * @param config The configuration of the model.
     */
    create(config: T): Promise<Response> {
        return this.aiContext.request(this.route, 'POST', config);
    }
}
