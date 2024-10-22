/**
 * @fileoverview ChatCompletionSession.ts
 * @author Luca Warmenhoven
 * @date Created on Wednesday, October 23 - 00:35
 */
import { CompletionRequest, Message, StreamedChatResponse } from "llm";

/**
 * This class is used to manage a chat completion session.
 * The abstraction is created to reduce the amount of React hooks used in the ChatConversationInteractivityHook.
 * @class ChatCompletionSession
 */
export class ChatCompletionSession {

    /** The messages in the chat session. */
    private _messages: Message[];

    /** The streaming state. */
    private _isStreaming: boolean = false;

    /** The streamed response buffer. */
    private _streamedResponseBuffer: string = '';

    /**
     * The event listeners.
     * These event listeners are used to handle the response of the chat assistant,
     * and can be updated by the users using `onresponse`, `onchunk`, `onchunkend` and `onerror`.
     */

    /**
     * The event listener for the response of the chat assistant.
     */
    public onmessage: ((message: Message) => void) | undefined;

    /**
     * The event listener for the chunk of the chat assistant.
     */
    public onchunk: (chunk: StreamedChatResponse) => void | undefined;

    /**
     * The event listener for the end of the chunk of the chat assistant.
     */
    public onchunkend: () => void | undefined;

    /**
     * The event listener for the error of the chat assistant.
     */
    public onerror: (error: Error) => void | undefined;


    /**
     * Constructs a new instance of the ChatCompletionSession class.
     * @param messages The messages to start the chat session with, default is an empty array.
     */
    constructor(messages: Message[] = []) {
        this._messages = messages;
        window.electron.ipcRenderer.on('ai:completion-chunk', this.handleChunk);
        window.electron.ipcRenderer.on('ai:completion-end', this.handleChunkEnd);
    }

    /**
     * Handles a chunk of the completion response.
     * @param _ The event (ignored)
     * @param chunk The chunk that was received.
     */
    private handleChunk(_: any, chunk: StreamedChatResponse) {
        this._streamedResponseBuffer += chunk.choices[ 0 ].delta.content;
        this.onchunk!(chunk);
    }

    /**
     * Handles the end of the completion chunk.
     */
    private handleChunkEnd(_: any) {
        this._isStreaming = false;
        this.onchunkend!();
        this._streamedResponseBuffer = '';
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
     * Requests a completion from the chat assistant.
     * @param request The completion request to send to the chat assistant.
     */
    public complete(request: CompletionRequest) {
        window[ 'ai' ]
            .completion(request)
            .then((response) => {
                // If response is null, it means the request was streamed.
                if ( !response )
                    return;

                this._messages.push(
                    {
                        content: response.choices[ 0 ].message.content,
                        role: 'assistant'
                    });
                this.onmessage!(response.choices[ 0 ].message);
            });
    }
}
