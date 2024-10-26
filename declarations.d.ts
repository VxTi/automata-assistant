declare module 'abstractions' {

    /**
     * The resource type.
     * This type is used to represent a resource in the application.
     */
    export type AbstractResource = {
        name: string;
        data: string;
        creationDate: number;
        tags?: string[];
        path?: string;
    }
}

/**
 * LLM Module
 * This module contains the types and interfaces for the LLM API (OpenAI)
 */
declare module 'llm' {

    import { ComposedMessageFragment } from "./src/renderer/src/util/completion/ChatCompletionMessageFragments";
    /**
     * Model type for the LLM API.
     * These are the currently available models, as of writing this,
     * any new models will be added to this list.
     */
    export type ModelType =
        | 'o1-preview'
        | 'chatgpt-4o-latest'
        | 'gpt-4o'
        | 'gpt-4o-mini'
        | 'gpt-3.5-turbo'
        | 'gpt-3.5-turbo-0125'
        | 'gpt-3.5-turbo-1106';

    type ToolType = 'function';


    /**
     * Tool interface.
     * A tool is used to call external API's from the AI.
     */
    export interface Tool {
        /**
         * The type of the tool. Currently, only functions are supported.
         */
        type: ToolType;

        function: {
            /**
             * The name of the function to call. This is the entry that will be present in a
             * tool message.
             */
            name: string,

            /**
             * A description of the function that will be used to determine whether the function
             * is allowed to be called.
             */
            description?: string,

            /**
             * Whether to enable strict schema adherence when generating the function call. If set to true, the
             * model will follow the exact schema defined in the parameters field. Only a subset of JSON Schema is
             * supported when strict is true. Learn more about Structured Outputs in the function calling guide.
             */
            strict?: boolean,

            /**
             * The parameters the functions accepts, described as a JSON Schema object. See the guide for examples,
             * and the JSON Schema reference for documentation about the format. Omitting parameters defines a
             * function with an empty parameter list.
             */
            parameters?: Object;
        }
    }

    type MessageRole = 'user' | 'assistant' | 'system' | 'tool';


    interface ToolCall {
        /**
         * The ID of the tool call.
         */
        id: string;

        /**
         * The type of the tool. Currently, only functions are supported.
         */
        type: ToolType;

        function: {
            name?: string;
            arguments: string;
        }
    }

    type ContentType = string | string[] | { type: 'text', text: string } | {
        type: 'image_url',
        image_url: { url: string }
    }

    /**
     * Message interface.
     * This interface is used to define the message object for the AI.
     */
    export interface Message {
        /**
         * Role of the message.
         */
        role: MessageRole;

        /**
         * Content of the message.
         */
        content: ContentType;

        /**
         * An optional name for the participant. Provides the model information to differentiate between
         * participants of the same role.
         */
        name?: string;

        /**
         * The refusal message by the assistant.
         * This is only present for `role=assistant` messages.
         */
        refusal?: string;

        /**
         * The tool calls generated by the model, such as function calls.
         * This is only present if the tool_choice parameter is set to auto or required, and for
         * `role=assistant` messages.
         */
        tool_calls?: ToolCall[];
    }


    /**
     * Represents a chat completion request to be sent to the model.
     */
    export interface CompletionRequest {

        /**
         * A list of messages comprising the conversation so far. Depending on the model you use, different message
         * types
         * (modalities) are supported, like text, images, and audio.
         */
        messages: Message[];

        /**
         * ID of the model to use. See the model endpoint compatibility table for details on which models work with
         * the Chat API.
         */
        model?: ModelType;

        /**
         * Whether to store the output of this chat completion request for use in our model distillation or evals
         * products. Defaults to false.
         */
        store?: boolean;

        /**
         * Developer-defined tags and values used for filtering completions in the dashboard.
         */
        metadata?: { [ key: string ]: any };

        /**
         * Number between -2.0 and 2.0. Positive values penalize new tokens based on their existing frequency in
         * the text so far, decreasing the model's likelihood to repeat the same line verbatim. Defaults to 0.
         */
        frequency_penalty?: number;

        /**
         * Accepts a JSON object that maps tokens (specified by their token ID in the tokenizer) to an associated
         * bias value from -100 to 100. Mathematically, the bias is added to the logits generated by the model
         * prior to sampling. The exact effect will vary per model, but values between -1 and 1 should decrease or
         * increase likelihood of selection; values like -100 or 100 should result in a ban or exclusive selection
         * of the relevant token. Defaults to an empty object.
         */
        logit_bias?: Map<string, number>;

        /**
         * Whether to return log probabilities of the output tokens or not.
         * If true, returns the log probabilities of each output token returned in the content of message.
         * Defaults to false.
         */
        logprobs?: boolean;

        /**
         * An integer between 0 and 20 specifying the number of most likely tokens to return at each token position,
         * each with an associated log probability. logprobs must be set to true if this parameter is used.
         */
        top_logprobs?: number;

        /**
         * The maximum number of `tokens` that can be generated in the chat completion. This value can be used to
         * control costs for text generated via API.
         *
         * This value is now deprecated in favor of max_completion_tokens, and is not compatible with o1 series
         * models.
         */
        max_tokens?: number

        /**
         * An upper bound for the number of tokens that can be generated for a completion,
         * including visible output tokens and reasoning tokens.
         */
        max_completion_tokens?: number;

        /**
         * How many chat completion choices to generate for each input message.
         * Note that you will be charged based on the number of generated tokens across all the choices. Keep n as
         * 1 to minimize costs.
         */
        n?: number;

        /**
         * Number between -2.0 and 2.0. Positive values penalize new tokens based on whether they appear in the
         * text so far, increasing the model's likelihood to talk about new topics.
         */
        presence_penalty?: number;

        /**
         * An object specifying the format that the model must output. Compatible with GPT-4o, GPT-4o mini, GPT-4
         * Turbo and all GPT-3.5 Turbo models newer than `gpt-3.5-turbo-1106`.
         *
         * Setting to `{ "type": "json_schema", "json_schema": {...} }` enables Structured Outputs which ensures
         * the model will match your supplied JSON schema. Learn more in the Structured Outputs guide.
         *
         * Setting to `{ "type": "json_object" }` enables JSON mode, which ensures the message the model generates
         * is valid JSON.
         *
         * Important: when using JSON mode, you must also instruct the model to produce JSON yourself via a system
         * or user message. Without this, the model may generate an unending stream of whitespace until the
         * generation reaches the token limit, resulting in a long-running and seemingly "stuck" request. Also note
         * that the message content may be partially cut off if `finish_reason="length"`, which indicates the
         * generation exceeded `max_tokens` or the conversation exceeded the max context length.
         */
        response_format?: {
                              type: 'json_schema',
                              json_schema: { description?: string, name: string, schema?: any, strict?: boolean }
                          }
                          | { type: ('text' | 'json_object') };

        /**
         * This feature is in Beta. If specified, our system will make a best effort to sample deterministically,
         * such that repeated requests with the same `seed` and parameters should return the same result.
         * Determinism is not guaranteed, and you should refer to the `system_fingerprint` response parameter to
         * monitor changes in the backend.
         */
        seed?: number;

        /**
         * Specifies the latency tier to use for processing the request. This parameter is relevant for customers
         * subscribed to the scale tier service:
         *
         * - If set to 'auto', and the Project is Scale tier enabled, the system will utilize scale tier credits
         * until they are exhausted.
         * - If set to 'auto', and the Project is not Scale tier enabled, the request will be processed using the
         * default service tier with a lower uptime SLA and no latency guarentee.
         * - If set to 'default', the request will be processed using the default service tier with a lower uptime
         * SLA and no latency guarentee.
         * - When not set, the default behavior is 'auto'.
         *
         * When this parameter is set, the response body will include the `service_tier` utilized.
         */
        service_tier?: 'auto' | string | null;

        /**
         * Up to 4 sequences where the API will stop generating further tokens.
         */
        stop?: string | string[] | null;

        /**
         * If set, partial message deltas will be sent, like in ChatGPT. Tokens will be sent as data-only
         * server-sent events as they become available, with the stream terminated by a data: [DONE] message.
         */
        stream?: boolean;

        /**
         * Options for streaming response. Only set this when you set `stream: true`.
         */
        stream_options?: { include_usage: boolean };

        /**
         * What sampling temperature to use, between 0 and 2. Higher values like 0.8 will make the output more
         * random, while lower values like 0.2 will make it more focused and deterministic.
         *
         * We generally recommend altering this or `top_p` but not both.
         */
        temperature?: number;

        /**
         * The top p value of the model.
         * This parameter is used to control the randomness of the model,
         * alternative to temperature.
         */
        top_p?: number;

        /**
         * A list of tools the model may call.
         * Currently, only functions are supported as a tool.
         * Use this to provide a list of functions the model may generate JSON inputs for. A max of 128 functions
         * are supported.
         */
        tools?: Tool[];

        /**
         * Controls which (if any) tool is called by the model. none means the model will not call any tool and
         * instead generates a message. auto means the model can pick between generating a message or calling one
         * or more tools. required means the model must call one or more tools. Specifying a particular tool via
         * `{"type": "function", "function": {"name": "my_function"}}` forces the model to call that tool.
         *
         * `none` is the default when no tools are present. auto is the default if tools are present.
         */
        tool_choice?: 'none' | 'auto' | 'required' | { type: ToolType, function: { name: string } };

        /**
         * Whether to enable parallel function calling during tool use.
         * Defaults to true
         */
        parallel_tool_calls?: boolean

        /**
         * A unique identifier representing your end-user, which can help OpenAI to monitor and detect abuse.
         */
        user?: string;
    }

    interface LogProbs {
        /**
         * The token
         */
        token: string,

        /**
         * The log probability of this token, if it is within the top 20 most likely tokens. Otherwise, the
         * value -9999.0 is used to signify that the token is very unlikely.
         */
        logprob: number,

        /**
         * A list of integers representing the UTF-8 bytes representation of the token. Useful in instances
         * where characters are represented by multiple tokens and their byte representations must be combined
         * to generate the correct text representation. Can be null if there is no bytes representation for the
         * token.
         */
        bytes: null | number[]
    }

    type LogProbsTop = LogProbs & { top_logprobs: LogProbs[] };

    type FinishReasonType = 'stop' | 'length' | 'content_filter' | 'tool_calls' | 'function_call' | null;

    /**
     * Represents a generic response returned by the model.
     * This is data that is present in both streamed and non-streamed responses.
     */
    interface GenericResponse {
        /**
         * A unique identifier for the chat completion. Each chunk has the same ID.
         */
        id: string;

        /**
         * The Unix timestamp (in seconds) of when the chat completion was created.
         */
        created: number;

        /**
         * The model used for the chat completion.
         */
        model: ModelType;

        /**
         * The service tier used for processing the request. This field is only included if the service_tier
         * parameter is specified in the request.
         */
        service_tier?: string | null;

        /**
         * This fingerprint represents the backend configuration that the model runs with.
         * Can be used in conjunction with the `seed` request parameter to understand when backend changes have
         * been made that might impact determinism.
         */
        system_fingerprint: string;
    }

    interface GenericUsage {
        /**
         * Number of tokens in the generated completion.
         */
        completion_tokens: number;

        /**
         * Number of tokens in the prompt.
         */
        prompt_tokens: number;

        /**
         * Total number of tokens used in the request (prompt + completion).
         */
        total_tokens: number;
    }

    /**
     * Represents a streamed chunk of a chat completion response returned by model, based on the provided input.
     */
    export interface StreamedChatResponse extends GenericResponse {


        /**
         * The object type, which is always `chat.completion`.
         */
        object: 'chat.completion.chunk';

        /**
         * A list of chat completion choices. Can contain more than one elements if n is greater than 1. Can also
         * be empty for the last chunk if you set stream_options: {"include_usage": true}.
         */
        choices: {
            /**
             * A chat completion delta generated by streamed model responses.
             */
            delta: {
                /**
                 * The contents of the chunk message.
                 */
                content: string | null;

                /**
                 * The tool calls generated by the model, such as function calls.
                 */
                tool_calls: (ToolCall & { index: number })[];

                /**
                 * The role of the author of this message.
                 */
                role: MessageRole;

                /**
                 * The refusal message generated by the model.
                 */
                refusal: string | null;

                /**
                 * The reason the model stopped generating tokens. This will be stop if the model hit a natural
                 * stop point or a provided stop sequence, length if the maximum number of tokens specified in the
                 * request was reached, content_filter if content was omitted due to a flag from our content
                 * filters, tool_calls if the model called a tool, or function_call (deprecated) if the model
                 * called a function.
                 */
                finish_reason: FinishReasonType;

                /**
                 * The index of the choice in the list of choices.
                 */
                index: number;
            },
            /**
             * Log probability information for the choice.
             */
            logprobs: null | {
                /**
                 * A list of message content tokens with log probability information.
                 */
                content: null | LogProbsTop[];

                /**
                 * A list of message refusal tokens with log probability information.
                 */
                refusal: null | LogProbsTop[];
            },
        }[];

        /**
         * Usage statistics for the completion request.
         */
        usage: GenericUsage;
    }

    /**
     * Represents a chat completion response returned by model, based on the provided input.
     */
    export interface ChatResponse extends GenericResponse {
        /**
         * A list of chat completion choices. Can be more than one if n is greater than 1.
         */
        choices: {
            /**
             * The reason the model stopped generating tokens. This will be `stop` if the model hit a natural stop
             * point or a provided stop sequence, `length` if the maximum number of tokens specified in the request
             * was reached,
             * `content_filter` if content was omitted due to a flag from our content filters, `tool_calls` if the
             * model called a tool, or `function_call` (deprecated) if the model called a function.
             */
            finish_reason: FinishReasonType;

            /**
             * The index of the choice in the list of choices.
             */
            index: number;

            /**
             * A chat completion message generated by the model.
             */
            message: Message;

            /**
             * Log probability information for the choice.
             */
            logprobs: null | {
                /**
                 * A list of message content tokens with log probability information.
                 */
                content: null | LogProbsTop[];

                /**
                 * A list of message refusal tokens with log probability information.
                 */
                refusal: null | LogProbsTop[];
            }
        }[],


        /**
         * The object type, which is always `chat.completion`.
         */
        object: 'chat.completion';

        /**
         * Usage statistics for the completion request.
         */
        usage: GenericUsage & {
            /**
             * Breakdown of tokens used in a completion.
             */
            completion_tokens_details: {
                /**
                 * Audio input tokens generated by the model.
                 */
                audio_tokens: number;

                /**
                 * Tokens generated by the model for reasoning.
                 */
                reasoning_tokens: number
            },

            /**
             * Breakdown of tokens used in the prompt.
             */
            prompt_tokens_details: {
                /**
                 * Audio input tokens present in the prompt.
                 */
                audio_tokens: number;

                /**
                 * Cached tokens present in the prompt.
                 */
                cached_tokens: number;
            }
        }
    }


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
        messageFragments: ComposedMessageFragment[];
    }
}

declare module 'tts' {

    export type VoiceType = 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer';
    export type VoiceModel = 'tts-1' | 'tts-1-hd';

    /**
     * The text-to-speech request.
     * This is the request object that is used to generate speech from text.
     */
    export interface TTSRequest {
        input: string;
        model: VoiceModel;
        voice: VoiceType;
        speed?: number
    }
}

declare module 'stt' {

    type SpeechToTextModelType = 'whisper-1';

    /**
     * Configuration object for the speech to text model.
     */
    export interface SpeechToTextRequest {
        model: SpeechToTextModelType;
        language?: string;
        temperature?: number;
        file: Blob | string;
        fileName?: string;
    }

    type SpeechToTextResponse = string;
}

declare module 'ai-file-uploads' {

    /**
     * The purpose of the file upload.
     * This is used to determine where the file should be uploaded to,
     * and can be used to retrieve the file later.
     */
    export type FilePurpose = 'assistants' | 'vision' | 'batch' | 'fine-tune';

    /**
     * The file upload request.
     */
    export interface FileUploadRequest {

        /**
         * The files to upload.
         */
        file: File;

        /**
         * The purpose of the file upload.
         */
        purpose: FilePurpose;
    }

    /**
     * The file upload response.
     * This is the response object returned by the file upload service.
     */
    export interface FileUploadResponse {
        /**
         * The ID of the file.
         */
        id: string;

        /**
         * The object type.
         */
        object: 'file';

        /**
         * The size of the file in bytes.
         */
        bytes: number;

        /**
         * The date at which the file was created, in seconds since EPOCH.
         */
        created_at: number;

        /**
         * The filename of the file.
         */
        filename: string;

        /**
         * The purpose of the file, e.g. 'assistants'.
         */
        purpose: FilePurpose;
    }

    /**
     * The file upload list response.
     * This is the response object returned by the file upload service.
     */
    export interface FileUploadList {
        data: FileUploadResponse[];
        object: 'list';
    }
}

declare module 'stable-diffusion' {

    export type ImageStyle = 'vivid' | 'natural';
    export type StableDiffusionModelType = 'dall-e-3' | 'dall-e-2';
    export type ImageDimensions = '256x256' | '512x512' | '1024x1024'// | '1024x1792' | '1792x1024';

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
        style?: ImageStyle;
    }

    /**
     * The error response object for the stable diffusion model.
     */
    export interface StableDiffusionErrorResponse {
        /**
         * Object containing information about why the fetch failed
         */
        error: {
            /**
             * The error code returned by the fetch
             */
            code: string,

            /**
             * The error message
             */
            message: string,
            /**
             * No idea
             */
            param: any

            /**
             * The type of error
             */
            type: string
        }
    }

    /**
     * A valid response object.
     */
    export interface StableDiffusionValidResponse {
        /**
         * The time at which the image was generated since EPOCH (1970).
         */
        created: number;

        data: {
            /**
             * The URL of the image.
             */
            url: string;
        }[]
    }

    /**
     * The response object for the stable diffusion model.
     * This can contain both error and validated responses.
     */
    export type StableDiffusionResponse = StableDiffusionValidResponse | StableDiffusionErrorResponse;
}

declare module 'ai-context' {

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
        baseURL?: string;

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
     * Request parameters for the AI Context.
     */
    interface AIContextRequestParams {
        /**
         * The route to request, e.g. 'audio/speech'
         */
        route: string;
        /**
         * The method to use. Defaults to 'POST'
         */
        method?: string;

        /**
         * The body of the request.
         */
        body: any;

        /**
         * The headers of the request.
         */
        headers?: Record<string, string>;
    }
}

