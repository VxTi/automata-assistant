/**
 * @fileoverview ChatCompletionSession.ts
 * @author Luca Warmenhoven
 * @date Created on Wednesday, October 23 - 00:35
 */
import { ChatResponse, CompletionRequest, ConversationTopic, Message, StreamedChatResponse } from "llm";

type ToolQueueEntry = {
    name: string,
    arguments: Object,
    buffer?: string
};

type MessageListener = (message: Message) => void;
type MessageChunkListener = (response: StreamedChatResponse) => void;
type MessageChunkEndListener = () => void;
type ErrorListener = (error: Error) => void;
type ToolCallListener = (tool: ToolQueueEntry) => void;


/**
 * This class is used to manage a chat completion session.
 * The abstraction is created to reduce the amount of React hooks used in the ChatConversationInteractivityHook.
 * @class ChatCompletionSession
 */
export class ChatCompletionSession {

    /** The messages in the chat session. */
    private _messages: Message[];

    /** The base request to use for the completion session. */
    private _baseRequest: CompletionRequest;

    private _conversationTopic: string | undefined;
    private _conversationUUID: string | undefined;
    private _isStreaming: boolean = false;

    /** The streamed response buffer. */
    private _streamedResponseBuffer: string = '';

    private _streamedToolCallQueue: Map<number, ToolQueueEntry> = new Map();

    /** -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- **
     | The event listeners.                                          |
     | These event listeners are used to handle the response of      |
     | the chat assistant, and can be updated by the users using     |
     | `onresponse`, `onchunk`, `onchunkend` and `onerror`.          |
     ** -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- **/

    /** The event listener for the response of the chat assistant. */
    public onmessage: MessageListener | undefined;

    /** The event listener for the chunk of the chat assistant. */
    public onchunk: MessageChunkListener | undefined;

    /** The event listener for the end of the chunk of the chat assistant. */
    public onchunkend: MessageChunkEndListener | undefined;

    /** The event listener for the error of the chat assistant. */
    public onerror: ErrorListener | undefined;

    /** The event listener for the tool call of the chat assistant. */
    public ontoolcall: ToolCallListener | undefined;

    /**
     * Constructs a new instance of the ChatCompletionSession class.
     * @param baseRequest The base request to use for the completion session.
     * This can contain the messages that are already in the chat session,
     * tool calls, and other information that is needed for the completion session.
     * @param conversation Information about the conversation. This is optional, and usually not present
     * in new conversations. This data will be generated once new messages are appended to the chat.
     */
    constructor(baseRequest: CompletionRequest, conversation?: {
        conversationTitle: string,
        conversationUUID: string
    }) {
        this._messages    = [...baseRequest.messages]; // prevent reference
        this._baseRequest = baseRequest;

        this._conversationTopic = conversation?.conversationTitle ?? undefined;
        this._conversationUUID  = conversation?.conversationUUID;

        console.log("Registering event listeners")

        window.electron.ipcRenderer.on('ai:completion-chunk', this._handleChunk.bind(this));
        window.electron.ipcRenderer.on('ai:completion-chunk-end', this._handleChunkEnd.bind(this));
        window.electron.ipcRenderer.on('ai:completion-error', this._handleError.bind(this));
    }

    /**
     * Handles a chunk of the completion response.
     * @param _ The event (ignored)
     * @param chunk The chunk that was received.
     */
    private _handleChunk(_: any, chunk: StreamedChatResponse) {

        if ( chunk.choices[ 0 ].delta.tool_calls ) {
            for ( let tool_call of chunk.choices[ 0 ].delta.tool_calls ) {
                if ( tool_call.function.name ) {
                    this._streamedToolCallQueue.set(tool_call.index, {
                        name: tool_call.function.name,
                        buffer: tool_call.function.arguments || "",
                    } as ToolQueueEntry);
                }
                else {
                    const tool_call_entry = this._streamedToolCallQueue.get(tool_call.index);
                    tool_call_entry!.buffer += tool_call.function.arguments;
                }
            }
            return;
        }

        if ( !chunk.choices[ 0 ].delta.content )
            return;

        this.onchunk?.call(null, chunk);
        this._streamedResponseBuffer += chunk.choices[ 0 ].delta.content;
    }

    /**
     * Handles the end of the completion chunk.
     */
    private _handleChunkEnd(_: any) {
        this._isStreaming = false;
        this.onerror      = console.error;
        this.onchunkend?.call(null);

        // If there is a streamed response buffer, we'll append it to the chat session.
        if ( this._streamedResponseBuffer ) {
            this.appendMessage({ content: this._streamedResponseBuffer, role: 'assistant' } as Message);
        }

        if ( this._streamedToolCallQueue.size > 0 ) {

            for ( let tool_call of this._streamedToolCallQueue.values() ) {
                tool_call.arguments = JSON.parse(tool_call.buffer!);
                delete tool_call.buffer;
                this.ontoolcall?.call(null, tool_call);
            }

            this._streamedToolCallQueue.clear();
        }
        this._streamedResponseBuffer = '';
    }

    /**
     * Handles an error from the chat assistant.
     * @param _ The event (ignored)
     * @param error The error that was received.
     */
    private _handleError(_: any, error: Error): void {
        if ( !this.onerror ) {
            console.error(error);
            return;
        }
        this.onerror?.call(null, error);
    }

    /**
     * Generates a topic for the conversation.
     * This will attempt to summarize the initial question in as little words as possible,
     * and create a topic UUID.
     * @param initialQuestion The initial question to generate the topic from.
     */
    private _generateTopic(initialQuestion: string): void {
        // Generate topic title
        window[ 'ai' ]
            .completion(
                {
                    messages: [ {
                        content: 'Summarize the following question in as little words as possible, at most 5 words: ' + initialQuestion,
                        role: 'user'
                    } ],
                    model: 'gpt-3.5-turbo'
                })
            .then((response: ChatResponse | null) => {
                // If response is null, then obviously an IO error occurred,
                // since the request was not streamed.
                if ( !response ) {
                    this.onerror?.call(null, new Error('IO error occurred.'));
                    return;
                }

                console.log("Generated topic: ", response.choices[ 0 ].message.content);

                this._conversationTopic = response.choices[ 0 ].message.content as string;
            });
    }

    /**
     * The messages in the chat session.
     */
    public get messages(): Message[] {
        return this._messages;
    }

    /**
     * Getter for the conversation topic
     */
    public get topic(): string {
        return this._conversationTopic ?? 'New conversation';
    }

    /**
     * Getter for the conversation UUID.
     */
    public get uuid(): string {
        if (!this._conversationUUID)
            this._conversationUUID = Math.random().toString(36).substring(2, 15);

        return this._conversationUUID;
    }

    /**
     * Getter for the streamed response buffer.
     */
    public get streamedResponseBuffer(): string {
        return this._streamedResponseBuffer;
    }

    /**
     * Getter for the conversation topic.
     */
    public get streaming(): boolean {
        return this._isStreaming;
    }

    /**
     * Appends a message to the chat session.
     * @param message
     */
    public appendMessage(message: Message) {

        // If there aren't any previous user sent messages,
        // we'll have to generate a topic and conversation UUID.
        if ( !this._conversationTopic && (this._messages.length < 1 || !this._messages.some(msg => msg.role === 'user')) ) {
            this._generateTopic(message.content as string);
        }
        this._messages.push(message);
        this._baseRequest.messages.push(message);
        this.onmessage?.call(null, message);
    }

    /**
     * Registers a listener for the error of the chat assistant.
     * This will be called when an IO error occurs, or any other (future implemented)
     * error.
     * @param listener The listener to register.
     */
    public onError(listener: ErrorListener):
        ChatCompletionSession {
        this.onerror = listener;
        return this;
    }

    /**
     * Registers a listener for the response of the chat assistant,
     * and returns the current instance of the ChatCompletionSession.
     * This allows for chaining of the methods.
     * @param listener The listener to register.
     */
    public onMessage(listener: MessageListener): ChatCompletionSession {
        this.onmessage = listener;
        return this;
    }

    /**
     * Registers a listener for the chunk of the chat assistant,
     * and returns the current instance of the ChatCompletionSession.
     * This allows for chaining of the methods.
     * @param listener The listener to register.
     */
    public onChunk(listener: MessageChunkListener): ChatCompletionSession {
        this.onchunk = listener;
        return this;
    }

    /**
     * Registers a listener for the end of the chunk of the chat assistant,
     * and returns the current instance of the ChatCompletionSession.
     * This allows for chaining of the methods.
     * @param listener The listener to register.
     */
    public onChunkEnd(listener: MessageChunkEndListener): ChatCompletionSession {
        this.onchunkend = listener;
        return this;
    }

    /**
     * Registers a listener for the error of the chat assistant,
     * and returns the current instance of the ChatCompletionSession.
     * This allows for chaining of the methods.
     * @param listener The listener to register.
     */
    public onToolCall(listener: ToolCallListener): ChatCompletionSession {
        this.ontoolcall = listener;
        return this;
    }

    /**
     * Resets the chat session.
     * This will clear all messages, and reset the conversation topic and UUID.
     */
    public reset(): void {
        this._messages.length             = 0;
        this._baseRequest.messages.length = 0;
        this._conversationTopic           = undefined;
        this._conversationUUID            = undefined;
    }

    /**
     * Updates the conversation topic.
     * @param topic The new conversation topic.
     */
    public update(topic: ConversationTopic): void {
        this._conversationTopic    = topic.topic;
        this._conversationUUID     = topic.uuid;
        this._messages             = topic.messages;
        this._baseRequest.messages = topic.messages;
    }

    /**
     * Requests a completion from the chat assistant.
     * This method will send a completion request to the chat assistant,
     * and append the message to the chat session.
     * If an `onmessage` listener is registered, it will be called with the message.
     * @param message The message to send to the chat assistant.
     */
    public complete(message: Message): ChatCompletionSession {
        // Append the last message to the chat session.
        this.appendMessage(message);
        console.log("Completing message: ", message);

        window[ 'ai' ]
            .completion(this._baseRequest)
            .then((response: ChatResponse | null) => {
                // If response is null, it means the request was streamed,
                // or an IO error occurred.
                if ( !response )
                    return;

                // If the non-streamed request returns tool calls, we'll
                // invoke the listener for every tool call.
                if ( response.choices[ 0 ].message.tool_calls ) {
                    for ( let tool_call of response.choices[ 0 ].message.tool_calls )
                        this.ontoolcall?.call(null, {
                            name: tool_call.function.name,
                            arguments: JSON.parse(tool_call.function.arguments)
                        } as ToolQueueEntry);
                    return;
                }

                // Otherwise we'll just append the ordinary message and
                // call the `onmessage` listener, if exists.
                this.appendMessage({ content: response.choices[ 0 ].message.content, role: 'assistant' });
            });

        return this;
    }
}
