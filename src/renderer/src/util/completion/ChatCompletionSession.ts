/**
 * @fileoverview ChatCompletionSession.ts
 * @author Luca Warmenhoven
 * @date Created on Wednesday, October 23 - 00:35
 */
import { ChatResponse, CompletionRequest, Message, StreamedChatResponse, ToolCall } from "llm";

type MessageListener = (message: Message) => void;
type MessageChunkListener = (response: StreamedChatResponse) => void;
type MessageChunkEndListener = (lastChunk: StreamedChatResponse) => void;
type ErrorListener = (error: Error) => void;
type ToolCallListener = (tool: ToolCall) => void;

/**
 * This class is used to manage a chat completion session.
 * The abstraction is created to reduce the amount of React hooks used in the ChatConversationInteractivityHook.
 * @class ChatCompletionSession
 */
export class ChatCompletionSession {

    /** The messages in the chat session. */
    private readonly _messages: Message[];

    /** The base request to use for the completion session. */
    private _baseRequest: CompletionRequest;

    /** The streaming state. */
    private _isStreaming: boolean = false;

    /** The streamed response buffer. */
    private _streamedResponseBuffer: string = '';

    /** -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- **
     | The event listeners.                                          |
     | These event listeners are used to handle the response of      |
     | the chat assistant, and can be updated by the users using     |
     | `onresponse`, `onchunk`, `onchunkend` and `onerror`.          |
     ** -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- **/

    /** The event listener for the response of the chat assistant. */
    public onmessage: (MessageListener | undefined;

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
     */
    constructor(baseRequest: CompletionRequest) {
        this._messages    = baseRequest.messages;
        this._baseRequest = baseRequest;

        window.electron.ipcRenderer.on('ai:completion-chunk', this._handleChunk);
        window.electron.ipcRenderer.on('ai:completion-end', this._handleChunkEnd);
        window.electron.ipcRenderer.on('ai:completion-error', this._handleError);
    }

    /**
     * Handles a chunk of the completion response.
     * @param _ The event (ignored)
     * @param chunk The chunk that was received.
     */
    private _handleChunk(_: any, chunk: StreamedChatResponse) {
        this._streamedResponseBuffer += chunk.choices[ 0 ].delta.content;
        this.onchunk!(chunk);
    }

    /**
     * Handles the end of the completion chunk.
     */
    private _handleChunkEnd(_: any, lastChunk: StreamedChatResponse) {
        this._isStreaming = false;
        this.onchunkend!(lastChunk);
        this._streamedResponseBuffer = '';
    }

    /**
     * Handles an error from the chat assistant.
     * @param _ The event (ignored)
     * @param error The error that was received.
     */
    private _handleError(_: any, error: Error) {
        if ( !this.onerror ) {
            console.error(error);
            return;
        }
        this.onerror!(error);
    }

    /**
     * The messages in the chat session.
     */
    public get messages(): Message[] {
        return this._messages;
    }

    /**
     * The streamed response buffer.
     */
    public get streamedResponseBuffer(): string {
        return this._streamedResponseBuffer;
    }

    /**
     * The streaming state.
     */
    public get streaming(): boolean {
        return this._isStreaming;
    }

    /**
     * Appends a message to the chat session.
     * @param message
     */
    public appendMessage(message: Message) {
        this._messages.push(message);
        this.onmessage!(message);
    }

    /**
     * Registers a listener for the error of the chat assistant.
     * This will be called when an IO error occurs, or any other (future implemented)
     * error.
     * @param listener The listener to register.
     */
    public onError(listener: ErrorListener): ChatCompletionSession {
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
     * Requests a completion from the chat assistant.
     * This method will send a completion request to the chat assistant,
     * and append the message to the chat session.
     * If an `onmessage` listener is registered, it will be called with the message.
     * @param message The message to send to the chat assistant.
     */
    public complete(message: Message): ChatCompletionSession {
        // Append the last message to the chat session.
        this.appendMessage(message);
        this._baseRequest.messages.push(message);

        window[ 'ai' ]
            .completion(this._baseRequest)
            .then((response: ChatResponse | null) => {
                // If response is null, it means the request was streamed,
                // or an IO error occurred.
                if ( !response )
                    return;

                // If the non-streamed request returns tool calls, we'll
                // invoke the listener for every tool call.
                if ( response.choices[0].message.tool_calls)
                {
                    for (let tool_call of response.choices[0].message.tool_calls)
                        this.ontoolcall!(tool_call);
                    return;
                }

                // Otherwise we'll just append the ordinary message and
                // call the `onmessage` listener, if exists.
                this._messages.push(
                    {
                        content: response.choices[ 0 ].message.content, role: 'assistant'
                    });
                this.onmessage!(response.choices[ 0 ].message);
            });

        return this;
    }
}
