/**
 * @fileoverview ChatCompletionSession.ts
 * @author Luca Warmenhoven
 * @date Created on Wednesday, October 23 - 00:35
 */
import { ChatResponse, CompletionRequest, ConversationTopic, Message, MessageRole, StreamedChatResponse } from "llm";

import {
    ComposedMessageFragment,
    FileListFragment,
    MessageFragment,
    TextFragment
} from "./ChatCompletionMessageFragments";

import { ChatCompletionContentGenerator } from "./ChatCompletionContentGenerator";
import { Settings }                       from "../../util/Settings";
import { playAudio }                      from "../../util/Audio";
import { VoiceType }                      from "tts";
import { Dispatch, SetStateAction }       from "react";

type ToolQueueEntry = { name: string, arguments: Object, buffer?: string };

type EventFragmentListener = (fragment: MessageFragment, role: MessageRole) => void;
type EventChunkListener = (response: StreamedChatResponse) => void;
type EventChunkEndListener = () => void;
type EventErrorListener = (error: Error) => void;
type EventToolCallListener = (tool: ToolQueueEntry) => void;

/**
 * The initial user calibration prompt.
 * This is used to calibrate the summary of the user.
 * @param userMessage The message of the user.
 * @param initialSummary The initial summary of the user.
 */
const InitialUserCalibrationPrompt = (userMessage: string, initialSummary = "") => `Here below are two messages given, first, your previous summary of the user, and the message of the user itself. Your task is to calibrate the summary of the user with as much accuracy and verbosity as possible. This is for you to get a better image of the user, so the more verbose, the better. If there is not enough information for you to summarize, just return the original summary. If you think the summary is already perfect, you can also return the original summary. The summary should be at least 5 words long. If the user asks you whether you are able to remember, you can now say yes. The user's message is as follows: "${userMessage}", and your initial summary: ${initialSummary}`;

/**
 * The topic generation prompt.
 * This is used to generate a topic for the conversation.
 * @param initialQuestion The initial question to generate the topic from.
 */
const TopicGenerationPrompt = (initialQuestion: string) => `Here below is a question that you can summarize in as little words as possible. This is for you to generate a topic for the conversation. The question is as follows: "${initialQuestion}".`;

/**
 * The user calibration message.
 * This is used to calibrate the summary of the user.
 */
const UserCalibrationMessage = () => {
    return {
        role: 'system',
        content: `Here follows a summary of the person you are talking to. This summary is based on the previous messages and interactions of the user you had. These messages aren't saved in the current chat, though you've summarized these before. If the user has given you response preferences, then these will be present in the summary so that you can respond to the user in a way that they prefer. The summary is as follows: ${Settings.get(Settings.USER_SUMMARY)}`
    } as Message
};

// The generic conversation title, for when the conversation title is not set.
const GenericConversationTitle = 'New conversation';

/**
 * This class is used to manage a chat completion session.
 * The abstraction is created to reduce the amount of React hooks used in the ChatConversationInteractivityHook.
 * @class ChatCompletionSession
 */
export class ChatCompletionSession {

    /** Private fields related to the chat session. */
    private readonly _contentGenerator: ChatCompletionContentGenerator;
    private _conversationTopic: string | undefined;
    private _conversationUUID: string | undefined;
    private _isStreaming: boolean     = false;
    private _spokenResponses: boolean = false;
    private _currentAudio: HTMLAudioElement | undefined;
    private _messages: Message[]      = [];

    /**
     * The generated fragments for the completion.
     * This can be parsed into React nodes to render the completion
     * using the `content` getter.
     */
    private _composedFragments: ComposedMessageFragment[] = [];

    private _reactUpdateDispatch: Dispatch<SetStateAction<void>> | undefined;

    private _streamedToolCallQueue: Map<number, ToolQueueEntry> = new Map();

    /**
     * Constructs a new instance of the ChatCompletionSession class.
     */
    constructor() {
        this._contentGenerator = new ChatCompletionContentGenerator(this);
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

        this._isStreaming = true;
        this.onchunk?.call(null, chunk);
        this.appendFragment({ type: 'text', content: chunk.choices[ 0 ].delta.content }, 'assistant');
    }

    /**
     * Sets the update listener for the chat session.
     * This will be called when the chat session is updated.
     * This allows this non-React class to update the React state,
     * causing a re-render of the chat session.
     *
     * @param dispatch The dispatch function to call when the chat session is updated.
     */
    public setUpdateListener(dispatch?: Dispatch<SetStateAction<any>>) {
        this._reactUpdateDispatch = dispatch;
    }

    /**
     * Handles the end of the completion chunk.
     * This will be called when the completion chunk has ended (receives a [DONE] message).
     * If any tool calls were received, these will be parsed and sent to the tool call listener.
     */
    private _handleChunkEnd(_: any) {
        this._isStreaming = false;
        this.onchunkend?.call(null);

        // If there are tool calls, we'll parse the tool calls and send them to the tool call listener
        for ( let tool_call of this._streamedToolCallQueue.values() ) {
            tool_call.arguments = JSON.parse(tool_call.buffer!);
            delete tool_call.buffer;
            this.ontoolcall?.call(null, tool_call);
        }

        this._saveConversation();
    }

    /**
     * Handles an error from the chat assistant.
     * @param _ The event (ignored)
     * @param error The error that was received.
     */
    private _handleError(_: any, error: Error): void {
        (this.onerror || console.error)(error);
    }

    /**
     * Whether a topic should be generated.
     * This is the case when the conversation topic is not set, or is the generic conversation title (also unset,
     * just wrongly saved).
     */
    private _shouldGenerateTopic(): boolean {
        return !this._conversationTopic || this._conversationTopic === GenericConversationTitle;
    }

    /**
     * Returns the content generator for the chat session.
     * This can be used to generate React nodes for the completion.
     */
    public get contentGenerator(): ChatCompletionContentGenerator {
        return this._contentGenerator;
    }

    /**
     * Generates a topic for the conversation.
     * This will attempt to summarize the initial question in as little words as possible,
     * and create a topic UUID.
     * @param initialQuestion The initial question to generate the topic from.
     */
    private async _generateTopic(initialQuestion: string): Promise<any> {

        return await window[ 'ai' ]
            .completion(
                {
                    messages: [ { content: TopicGenerationPrompt(initialQuestion), role: 'user' } ],
                    model: 'gpt-3.5-turbo'
                })
            .then((response: ChatResponse | null) => {
                // If response is null, then obviously an IO error occurred,
                // since the request was not streamed.
                if ( !response ) {
                    this._handleError(null, new Error('IO error occurred.'));
                    return;
                }

                this._conversationTopic = response.choices[ 0 ].message.content as string;
                this._saveConversation();
                this._reactUpdateDispatch?.();
            });
    }

    /**
     * Saves the conversation.
     * This will save the conversation if the conversation is longer than 1 message,
     * and the user has enabled automatic conversation saving.
     */
    private _saveConversation(): void {
        if ( this._composedFragments.length > 1 && Settings.get(Settings.SAVE_CONVERSATIONS) ) {
            console.log('Saving conversation...');
            window[ 'conversations' ].save(
                {
                    topic: this.topic,
                    uuid: this.uuid,
                    messageFragments: this._composedFragments,
                    date: Date.now()
                });
        }
    }

    /**
     * Silences the chat assistant, if it is speaking.
     */
    public silence() {
        if ( this._currentAudio ) {
            this._currentAudio.pause();
            this._currentAudio = undefined;
        }
    }


    /**
     * Registers a listener for the error of the chat assistant.
     * This will be called when an IO error occurs, or any other (future implemented)
     * error.
     * @param listener The listener to register.
     */
    public onError(listener: EventErrorListener): ChatCompletionSession {
        this.onerror = listener;
        return this;
    }

    /**
     * Registers a listener for the chunk of the chat assistant,
     * and returns the current instance of the ChatCompletionSession.
     * This allows for chaining of the methods.
     * @param listener The listener to register.
     */
    public onChunk(listener: EventChunkListener): ChatCompletionSession {
        this.onchunk = listener;
        return this;
    }

    /**
     * Registers a listener for the end of the chunk of the chat assistant,
     * and returns the current instance of the ChatCompletionSession.
     * This allows for chaining of the methods.
     * @param listener The listener to register.
     */
    public onChunkEnd(listener: EventChunkEndListener): ChatCompletionSession {
        this.onchunkend = listener;
        return this;
    }

    /**
     * Registers a listener for the error of the chat assistant,
     * and returns the current instance of the ChatCompletionSession.
     * This allows for chaining of the methods.
     * @param listener The listener to register.
     */
    public onToolCall(listener: EventToolCallListener): ChatCompletionSession {
        this.ontoolcall = listener;
        return this;
    }

    /**
     * Registers a listener for the fragment of the chat assistant,
     * and returns the current instance of the ChatCompletionSession.
     * This allows for chaining of the methods.
     * @param listener The listener to register.
     */
    public onFragment(listener: EventFragmentListener): ChatCompletionSession {
        this.onfragment = listener;
        return this;
    }

    /**
     * Resets the chat session.
     * This will clear all messages, and reset the conversation topic and UUID.
     */
    public reset(): void {
        this._composedFragments      = [];
        this._conversationTopic      = undefined;
        this._conversationUUID       = undefined;
        this._streamedToolCallQueue.clear();
        this._reactUpdateDispatch?.();
    }

    /**
     * Updates the conversation topic.
     * This will update the conversation topic, the conversation UUID and the messages.
     * @param topic The new conversation topic.
     */
    public update(topic: ConversationTopic): void {
        this._conversationTopic = topic.topic;
        this._conversationUUID  = topic.uuid;
        this._composedFragments = topic.messageFragments;

        // Fuckin 'ell,
        // Since message fragments can be composed of quite a lot of subtypes,
        // and since we're only interested into the textual parts of them,
        // we'll have to transform the composed fragments into ones that only contain
        // text fragments, and then append all those text fragments onto each other,
        // after which we'll transform them into messages from the appropriate origin.
        this._messages = topic.messageFragments
                              .map((composedFragment: ComposedMessageFragment) =>
                                       composedFragment
                                           .fragments
                                           .filter((fragment: MessageFragment) => fragment.type === 'text')
                                           .reduce((acc: Message, fragment: TextFragment) => ({
                                               content: acc.content + fragment.content,
                                               role: acc.role
                                           }), { content: '', role: composedFragment.role } as Message))
                              .filter((message: Message) => message.content !== '');

        this._reactUpdateDispatch?.();
    }

    /**
     * Appends a message to the chat session.
     * This is the same as calling `appendFragment` with a text fragment,
     * except this method will also append the message to the messages list.
     * @param message The message to append to the chat session.
     */
    public async appendMessage(message: Message) {

        this._messages.push(message);
        this.appendFragment({ type: 'text', content: message.content as string }, message.role);

        if ( this.verbose && message.role === 'assistant' ) {
            window[ 'ai' ]
                .audio
                .textToSpeech(
                    {
                        input: message.content as string,
                        voice: Settings.TTS_VOICES[ Settings.get(Settings.ASSISTANT_VOICE_TYPE) ].toLowerCase() as VoiceType,
                        model: 'tts-1', speed: 1.0,
                    })
                .then(({ data }) => this._currentAudio = playAudio(window[ 'ai' ].audio.ttsBase64ToBlob(data)));
        }
    }

    /**
     * Requests a completion from the chat assistant.
     * This is the main method of this class, and will do the following things:
     * - Append the last message to the chat session.
     * - Update the summary of the user's message if this is enabled
     * - Send the completion request to the chat assistant.
     *
     * @param message The message to send to the chat assistant.
     */
    public complete(message: Message): ChatCompletionSession {
        // Append the last message to the chat session.
        this.appendMessage(message);

        const completionRequest = {
            messages: [],
            model: 'gpt-4o-mini',
            stream: true
        } as CompletionRequest;

        /**
         * Personalized messages.
         * If the user has enabled personalized messages, we'll prompt the user
         * to calibrate the summary of the user. This allows the assistant to
         * get a better image of the user.
         */
        if ( Settings.get(Settings.PERSONALIZED_MESSAGES) ) {
            completionRequest.messages.push(UserCalibrationMessage());

            window[ 'ai' ]
                .completion(
                    {
                        model: 'gpt-4o-mini',
                        messages: [
                            {
                                role: 'system',
                                content: InitialUserCalibrationPrompt(message.content as string, Settings.get(Settings.USER_SUMMARY)),
                            },
                            { role: 'user', content: message.content, }
                        ]
                    }
                )
                .then((response: ChatResponse | null) => {
                    if ( !response )
                        return;

                    Settings.set(Settings.USER_SUMMARY, response.choices[ 0 ].message.content);
                })
        }

        completionRequest.messages.push(...this._messages);
        completionRequest.messages.push(message);

        // Since we're always streaming, we won't have to deal with
        // the response of this request, since it'll always be `null`.
        window[ 'ai' ].completion(completionRequest);
        this._reactUpdateDispatch?.();

        return this;
    }


    /**
     * Appends fragments to the fragment node list.
     * If the last fragment is of the same origin, the fragment will be appended to the last fragment,
     * otherwise a new fragment node will be created.
     */
    public appendFragment(fragment: MessageFragment, roleOrigin: MessageRole) {

        // Various conditions for whether the topic should be generated or not.
        // This depends on both settings and the properties of the given fragment.
        if ( fragment.type === 'text' && this._shouldGenerateTopic() ) {
            this._generateTopic(fragment.content as string);
        }

        if ( fragment.type === 'text' && !this._isStreaming && roleOrigin === 'assistant' && this.verbose ) {
            window[ 'ai' ]
                .audio
                .textToSpeech(
                    {
                        input: fragment.content as string,
                        voice: Settings.TTS_VOICES[ Settings.get(Settings.ASSISTANT_VOICE_TYPE) ].toLowerCase() as VoiceType,
                        model: 'tts-1', speed: 1.0,
                    })
                .then(({ data }) => this._currentAudio = playAudio(window[ 'ai' ].audio.ttsBase64ToBlob(data)));
        }

        do {
            const lastIdx = this._composedFragments.length - 1;

            // If there are no previous fragments, or the last fragment is not of the same origin, create a new fragment
            // node
            if ( this._composedFragments.length === 0 || this._composedFragments[ lastIdx ].role !== roleOrigin ) {

                // If the fragment is a file, we'll create a new file list fragment
                if ( fragment.type === 'file' ) {
                    this._composedFragments.push(
                        { fragments: [ { type: 'file-list', files: [ fragment ] } ], role: roleOrigin });

                    break;
                }
                this._composedFragments.push({ fragments: [ fragment ], role: roleOrigin });
                break;
            }

            const lastFragment = this._composedFragments[ lastIdx ].fragments[ this._composedFragments[ lastIdx ].fragments.length - 1 ];

            // If the last fragment is a file list, and the new fragment is a file,
            // append the file to the file list and break the loop
            if ( lastFragment.type === 'file-list' && fragment.type === 'file' ) {
                (lastFragment as FileListFragment).files.push(fragment);
                break;
            }

            // If the last fragment is a text fragment, and the new fragment is a text fragment,
            // append the content to the last fragment and break the loop
            if ( lastFragment.type === 'text' && fragment.type === 'text' ) {
                (lastFragment as TextFragment).content += fragment.content;
                break;
            }

            // Append the fragment to the last fragment node
            this._composedFragments[ lastIdx ].fragments.push(fragment);

        } while ( false );

        this.onfragment?.(fragment, roleOrigin);
        this._reactUpdateDispatch?.();

        if ( !this._isStreaming )
            this._saveConversation();
    }


    /** -- -- -- -- -- -- -- -- -- -- -- -- -- **
     |                                          |
     |             Event Listeners              |
     |                                          |
     ** -- -- -- -- -- -- -- -- -- -- -- -- -- **/

    /** The event listener for the message of the chat assistant. */
    public onfragment: EventFragmentListener | undefined;

    /** The event listener for the chunk of the chat assistant. */
    public onchunk: EventChunkListener | undefined;

    /** The event listener for the end of the chunk of the chat assistant. */
    public onchunkend: EventChunkEndListener | undefined;

    /** The event listener for the error of the chat assistant. */
    public onerror: EventErrorListener | undefined;

    /** The event listener for the tool call of the chat assistant. */
    public ontoolcall: EventToolCallListener | undefined;


    /** -- -- -- -- -- -- -- -- -- -- -- -- -- **
     |                                          |
     |       Getters and setters methods        |
     |                                          |
     ** -- -- -- -- -- -- -- -- -- -- -- -- -- **/

    /**
     * Setter for whether the responses should be spoken.
     */
    public set verbose(spoken: boolean) {
        this._spokenResponses = spoken;
        this._reactUpdateDispatch?.();
    }

    /**
     * Getter for the conversation topic
     */
    public get topic(): string {
        return this._conversationTopic || GenericConversationTitle;
    }

    /**
     * Getter for whether the responses should be spoken.
     */
    public get verbose(): boolean {
        return this._spokenResponses;
    }

    /**
     * Getter for the conversation UUID.
     */
    public get uuid(): string {
        if ( !this._conversationUUID )
            this._conversationUUID = Math.random().toString(36).substring(2, 15);

        return this._conversationUUID;
    }

    /**
     * Getter for whether the chat assistant is streaming.
     */
    public get streaming(): boolean {
        return this._isStreaming;
    }

    /**
     * Getter for the fragments of the completion.
     */
    public get fragments(): ComposedMessageFragment[] {
        return this._composedFragments;
    }
}
