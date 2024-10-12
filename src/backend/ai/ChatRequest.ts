/**
 * @fileoverview ChatRequest.ts
 * @author Luca Warmenhoven
 * @date Created on Saturday, October 12 - 11:38
 */


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
 * Tool message interface.
 */
export interface ToolMessage {
    role: 'tool';
    content: string;
    tool_call_id: string;
    name?: string;
}

/**
 * Regular message interface.
 */
export interface RegularMessage {
    role: 'user' | 'assistant' | 'system';
    content: string | ContentPart[];
    name?: string;
}

/**
 * Message interface, used for completion.
 */
export type Message = RegularMessage | ToolMessage;

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
