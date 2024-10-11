/**
 * @fileoverview ChatCompletion.ts
 * @author Luca Warmenhoven
 * @date Created on Friday, October 11 - 15:02
 */

import { AIContext, Model }  from "./AIContext";

export type ModelType =
    'google/gemini-flash-1.5-8b-exp'
    | 'google/gemini-flash-1.5-exp'
    | 'openai/o1-preview'
    | 'openai/chatgpt-4o-latest'
    | 'openai/gpt-4o'
    | 'openai/gpt-4o-mini'
    | 'openai/gpt-3.5-turbo'
    | 'openai/gpt-3.5-turbo-0125'
    | 'openai/gpt-3.5-turbo-1106';


/**
 * Completion request interface.
 * @see https://openrouter.ai/docs/completion
 */
export interface CompletionRequest {
    // Either "messages" or "prompt" is required
    messages?: Message[];
    prompt?: string;

    // If "model" is unspecified, uses the user's default
    model?: ModelType; // See "Supported Models" section

    // Allows to force the model to produce specific output format.
    // Only supported by OpenAI models, Nitro models, and some others - check the
    // providers on the model page on openrouter.ai/models to see if it's supported,
    // and set `require_parameters` to true in your Provider Preferences. See
    // openrouter.ai/docs/provider-routing
    response_format?: { type: 'json_object' };

    stop?: string | string[];
    stream?: boolean; // Enable streaming

    // See LLM Parameters (openrouter.ai/docs/parameters)
    max_tokens?: number; // Range: [1, context_length)
    temperature?: number; // Range: [0, 2]
    top_p?: number; // Range: (0, 1]
    top_k?: number; // Range: [1, Infinity) Not available for OpenAI models
    frequency_penalty?: number; // Range: [-2, 2]
    presence_penalty?: number; // Range: [-2, 2]
    repetition_penalty?: number; // Range: (0, 2]
    seed?: number; // OpenAI only

    // Tool calling
    // Will be passed down as-is for providers implementing OpenAI's interface.
    // For providers with custom interfaces, we transform and map the properties.
    // Otherwise, we transform the tools into a YAML template. The model responds with an assistant message.
    // See models supporting tool calling: openrouter.ai/models?supported_parameters=tools
    tools?: Tool[];
    tool_choice?: ToolChoice;

    // Additional optional parameters
    logit_bias?: { [ key: number ]: number };

    // OpenRouter-only parameters
    // See "Prompt Transforms" section: openrouter.ai/docs/transforms
    transforms?: string[];

    // See "Model Routing" section: openrouter.ai/docs/model-routing
    models?: string[];
    route?: 'fallback';

    // See "Provider Routing" section: openrouter.ai/docs/provider-routing
    provider?: any;
}

export type TextContent = { type: 'text'; text: string; };

export type ImageContentPart = {
    type: 'image_url';
    image_url: {
        url: string; // URL or base64 encoded image data
        detail?: string; // Optional, defaults to 'auto'
    };
};

/**
 * Content part is either a text or an image.
 */
export type ContentPart = TextContent | ImageContentPart;

/**
 * Message interface, used for completion.
 */
export type Message =
    | {
          role: 'user' | 'assistant' | 'system';
          // ContentParts are only for the 'user' role:
          content: string | ContentPart[];
          // If "name" is included, it will be prepended like this
          // for non-OpenAI models: `{name}: {content}`
          name?: string;
      }
    | {
          role: 'tool';
          content: string;
          tool_call_id: string;
          name?: string;
      };

/**
 * Interface representing a tool parameter.
 * This interface can be used to define the parameters of a tool.
 * @see Tool
 */
export interface FunctionDescription {
    description?: string;
    name: string;
    parameters: object; // JSON Schema object
}

/**
 * Interface representing a tool parameter.
 * This interface can be used to define the parameters of a tool.
 * Tools are used to call external API's from the AI.
 */
export interface Tool {
    type: 'function';
    function: FunctionDescription;
}

export type ToolChoice = | 'none' | 'auto' | {
    type: 'function';
    function: {
        name: string;
    };
};

/**
 * The conversation topic.
 * This interface represents a conversation topic,
 * and can be used to store the conversation history.
 */
export interface ConversationTopic {
    /**
     * The UUID of the conversation topic.
     * This is used to identify the conversation topic.
     */
    uuid: string;

    /**
     * The topic of the conversation.
     * This is a summary generated based on the initial message of the conversation.
     */
    topic: string;

    /**
     * The date of the conversation.
     * This is updated whenever a new message is added to the conversation.
     */
    date: number;

    /**
     * The messages of the conversation.
     */
    messages: Message[]
}

const defaultConfiguration: CompletionRequest = {
    model: 'google/gemini-flash-1.5-exp',
    max_tokens: 2048,
    temperature: 0.5,
    messages: []
};

export class ChatCompletion extends Model<CompletionRequest | string> {

    /**
     * The base request.
     * This request is used to set the default model or other parameters.
     */
    private readonly defaultConfig: CompletionRequest;

    /**
     * Constructs a new instance of the Chat Completion class.
     * @param context The AI context to use.
     * @param defaultConfig The base request to use. This can be used
     * to set the default model or other parameters.
     */
    constructor(context: AIContext, defaultConfig?: CompletionRequest) {
        super(context, 'chat/completion');
        this.defaultConfig = defaultConfig || defaultConfiguration;
    }

    /**
     * Create a new completion request.
     * @param config The configuration of the completion request.
     * This can be a string or a completion request object.
     * When a string is provided, the string is used as the prompt,
     * and the base request is used as the configuration.
     */
    create(config: CompletionRequest | string): Promise<Response> {
        if ( typeof config === 'string')
            return super.create({ ...this.defaultConfig, prompt: config });
        return super.create(config);
    }
}
