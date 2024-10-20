/**
 * @fileoverview InputField.tsx
 * @author Luca Warmenhoven
 * @date Created on Friday, October 04 - 18:32
 */


import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { ChatResponse, Message, StreamedChatResponse }          from "../../../../backend/ai/ChatCompletionDefinitions";
import { SpeechToTextRequest }                                  from "../../../../backend/ai/SpeechToText";
import { ConversationTopic }                                    from "../../../../backend/ai/ChatCompletion";
import { ChatContext }                                          from "./Conversation";
import { BaseStyles }                                           from "../../util/BaseStyles";

import '../../styles/code-highlighting.css';
import { Icons }                                                from "../../components/Icons";
import { audioDevice, playAudio } from "../../util/Audio";
import { encodeBase64Blob }       from "../../../../shared/Encoding";

/**
 * The interactive field where the user can input text or voice.
 * This field allows the user to input text, voice, or files.
 */
export function ChatInputField() {

    const ctx                                         = useContext(ChatContext);
    const [ selectedDirectory, setSelectedDirectory ] = useState<string | null>(null);
    const [ optionsShown, setOptionsShown ]           = useState(false);
    const [ selectedFiles, setSelectedFiles ]         = useState<string[]>([]);
    const [ recording, setRecording ]                 = useState(false);
    const inputContentRef                             = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if ( !inputContentRef.current ) return;

        inputContentRef.current.select();

        // Smoothly change the height of the input field.
        inputContentRef.current.addEventListener('input', () => {
            inputContentRef.current!.style.height = 'auto';
            inputContentRef.current!.style.height = `${inputContentRef.current!.scrollHeight}px`;
        });
    }, [ inputContentRef ]);

    /**
     * Handles the sending of a request.
     * This function is called when the user sends a message,
     * which happens both after recording and after typing.
     */
    const handleSendRequest = useCallback(async (prompt: string) => {

        let topicTitle = ctx.conversationTopic;
        let uuid       = ctx.topicUUID;

        const newMessages = [ ...ctx.messages, { role: 'user', content: prompt } as Message ];
        ctx.setMessages(() => newMessages);

        /**
         * Generate a summary of the prompt if no messages are present.
         */
        if ( ctx.messages.length === 0 ) {

            console.log('Generating topic title for conversation...');
            const response = await window[ 'ai' ]
                .completion(
                    {
                        model: 'gpt-4o-mini', messages: [ {
                            role: 'user',
                            content: 'Summarize the following question in as little words as possible, at most 5 words: ' + prompt
                        } ]
                    }) as ChatResponse;
            topicTitle     = response.choices[ 0 ].message.content as string;
            ctx.setConversationTopic(topicTitle);

            uuid = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
            ctx.setTopicUUID(uuid);
        }

        ctx.setLiveChatActive(true);


        /**
         * Stream the messages to the AI model.
         */

        let tools: { name: string, value: string }[] = [];
        let response                                 = '';
        const chunk                                  = async (_: any, message: StreamedChatResponse) => {
            const delta = message.choices[ 0 ].delta;

            if ( delta.tool_calls && delta.tool_calls.length > 0 ) {
                console.log('Tool calls:', JSON.stringify(delta));
                if ( delta.tool_calls[ 0 ].index < tools.length && delta.tool_calls[ 0 ].function.name )
                    tools.push({ name: delta.tool_calls[ 0 ].function.name, value: '' });
                else if ( delta.tool_calls[ 0 ].index < tools.length )
                    tools[ delta.tool_calls[ 0 ].index ].value += delta.tool_calls[ 0 ].function.name;

            }

            if ( delta.content && ctx.lastMessageRef.current )
                ctx.lastMessageRef.current!.innerHTML = (response += delta.content ?? '');
        };
        window.electron.ipcRenderer.on('ai:completion-chunk', chunk);
        window.electron.ipcRenderer.once('ai:completion-chunk-end', async () => {
            window.electron.ipcRenderer.removeListener('ai:completion-chunk', chunk);
            ctx.setLiveChatActive(false);

            console.log('final: ', tools.map(tool => tool.name + ": " + tool.value).join('\n'));

            // Update the conversation topic with the new message,
            // and save the conversation to the conversation history.
            ctx.setMessages(() => {
                const updatedMessages = [ ...newMessages, { role: 'assistant', content: response } as Message ];
                window[ 'conversations' ].save(
                    {
                        topic: topicTitle,
                        date: Date.now(),
                        uuid: uuid,
                        messages: updatedMessages
                    } as ConversationTopic);

                return updatedMessages;
            });
            if ( ctx.spokenResponse ) {
                const { data } = await window[ 'ai' ].audio.textToSpeech(
                    { input: response, model: 'tts-1', voice: 'nova' });
                const blob     = new Blob([ window.Buffer.from(data, 'base64') ]);

                playAudio(blob);
            }
        });
        window[ 'ai' ].completion({ model: 'gpt-4o-mini', messages: newMessages, stream: true });

    }, [ ctx.spokenResponse, ctx.messages, ctx.conversationTopic ]);

    /**
     * Handles the sending of a message.
     * This function is called when the user clicks on the send icon,
     * and will send the message to the AI model for a response.
     */
    const handleSend = useCallback(async () => {
        const elementValue = inputContentRef.current!.value.trim() || '';
        // Prevent empty messages
        if ( !inputContentRef.current || !elementValue )
            return;

        inputContentRef.current!.value        = '';
        inputContentRef.current!.style.height = 'auto';
        await handleSendRequest(elementValue);
    }, [ ctx.spokenResponse, ctx.messages ]);

    /**
     * Handles the microphone access.
     * This function is called when the user clicks on the microphone icon,
     * and will attempt to request microphone access, after which it will start recording.
     *
     * Once the recording is stopped, the audio will be sent to the AI model for transcription,
     * transcription will be sent to the AI model for a response, and the response will be added to the chat.
     * If the spoken response option is enabled, the response will also be spoken.
     */
    const handleMicrophoneAccess = useCallback(async () => {

        const device = await audioDevice;

        // Audio device access must be granted when the application starts.
        // If the user declines, we can't record audio.
        if ( !device ) {
            // TODO: Add visual aid letting the user know audio recording is disabled.
            return;
        }

        const chunks: BlobPart[] = [];
        let totalBytes           = 0;

        device.ondataavailable = event => {
            chunks.push(event.data);
            totalBytes += event.data.size;

            if ( totalBytes > window[ 'ai' ][ 'audio' ].speechToTextFileLimit ) {
                device.stop();
            }
        }

        // When the recording is stopped, send the request.
        device.onstop = async () => {
            const audioBlob = new Blob(chunks);
            const audioB64 = await encodeBase64Blob(audioBlob);
            const transcription = await window[ 'ai' ][ 'audio' ]
                .speechToText({ file: audioB64, fileName: 'audio.wav' } as SpeechToTextRequest);

            await handleSendRequest(transcription);
        }

        device[ recording ? 'stop' : 'start' ].call(device, window[ 'ai' ][ 'audio' ].audioSegmentationIntervalMs);
        setRecording( !recording);

    }, [ ctx.spokenResponse, ctx.messages, recording ]);

    return (
        <div className="flex flex-col justify-center items-center mb-3 mt-1 max-w-screen-md w-full">
            <div className="flex justify-start w-full items-center flex-wrap max-w-screen-sm mx-auto my-1">
                {selectedDirectory && (
                    <AttachedFile filePath={selectedDirectory} onDelete={() => setSelectedDirectory(null)}
                                  directory/>
                )}
                {selectedFiles.map((file, index) => (
                    <AttachedFile key={index} filePath={file}
                                  onDelete={() => setSelectedFiles(selectedFiles.filter((_, i) => i !== index))}/>
                ))}
            </div>

            <div
                className="flex flex-col justify-end items-center rounded-3xl max-w-screen-md mx-4 overflow-hidden border-solid border-[1px] border-blue-500 dark:bg-[#161b22]">
                <div
                    className={`flex flex-row justify-center items-center transition-all w-full overflow-hidden duration-500 ${optionsShown ? 'max-h-32 opacity-100' : 'max-h-0 opacity-0'}`}>
                    <ChatAlternativeOption
                        path="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
                        text="Add file" onClick={() => {
                        window[ 'fs' ]
                            .openFile()
                            .then((files: string[]) => {
                                setSelectedFiles([ ...selectedFiles, ...files ]);
                                setOptionsShown(false);
                            });
                    }}/>
                    <ChatAlternativeOption
                        path="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z"
                        text="Add directory" onClick={() => {

                        window[ 'fs' ]
                            .openDirectory()
                            .then((directory: string) => {
                                setSelectedDirectory(directory);
                                setOptionsShown(false);
                            });
                    }}/>
                </div>
                <div
                    className="flex justify-center items-end text-white dark:text-black mx-2">
                    <div
                        className='shrink-0 self-center w-8 h-8 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 duration-300 transition-colors stroke-black dark:stroke-white'
                        onClick={() => setOptionsShown( !optionsShown)}>
                        <Icons.ThreeDots/>
                    </div>
                    <textarea
                        onKeyDown={async event => {
                            if ( event.key === 'Enter' && !event.shiftKey ) {
                                event.preventDefault();
                                await handleSend();
                            }
                        }}
                        placeholder="Ask me anything..."
                        rows={1} cols={50} ref={inputContentRef}
                        className="resize-none mx-2 w-full max-h-52 my-auto grow focus:outline-none bg-transparent text-black dark:text-white p-2"/>
                    <div
                        className={`shrink-0 self-center w-8 h-8 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 duration-300 transition-colors ${recording ? 'stroke-red-600 stroke-2' : 'stroke-black dark:stroke-white'}`}
                        onClick={handleMicrophoneAccess}>
                        {recording ? <Icons.Stop/> : <Icons.Microphone/>}
                    </div>
                    <div
                        className='shrink-0 self-center w-8 h-8 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 duration-300 transition-colors stroke-black dark:stroke-white'
                        onClick={handleSend}>
                        <Icons.PaperAirplane/>
                    </div>
                </div>
            </div>
        </div>
    );
}

/**
 * An interaction option.
 * This option is used to interact with the assistant.
 * These options reside above the input field.
 * @param props The properties of the interaction option.
 */
function ChatAlternativeOption(props: { path: string, text: string, onClick: () => void }) {
    return (
        <div
            onClick={props.onClick}
            className="content-container hoverable apply-stroke flex-row justify-center items-center mx-1 py-0.5 px-2 my-1 basis-24 shrink-0 rounded-xl duration-300 transition-all">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5}
                 className="w-6 h-6 mb-1 shrink-0 transition-colors duration-300 rounded-full">
                <path strokeLinecap="round" strokeLinejoin="round"
                      d={props.path}/>
            </svg>
            <div className="ml-1 text-xs text-nowrap">{props.text}</div>
        </div>
    )
}

/**
 * An interaction file.
 * This file is used to interact with the assistant.
 * @param props The properties of the interaction file.
 */
function AttachedFile(props: { filePath: string, onDelete: () => void, directory?: boolean }) {
    // @ts-ignore
    const fileName = props.filePath.substring(props.filePath.lastIndexOf(window[ 'fs' ].separator) + 1);
    return (
        <div
            className="flex flex-row justify-between items-center bg-gray-700 mx-0.5 my-1 rounded-3xl">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5}
                 className={BaseStyles.ICON_NO_MARGIN}
                 onClick={props.onDelete}>
                <path strokeLinecap="round" strokeLinejoin="round"
                      d={props.directory ?
                         "M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75" +
                             " 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 " +
                             "0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z" : "M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0" +
                             " 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621" +
                             " 0-1.125.504-1.125" +
                             " 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0" +
                             " 0 0-9-9Z"}/>
            </svg>
            <div className="truncate text-xs mx-0.5">{fileName}</div>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5}
                 className={BaseStyles.ICON_NO_MARGIN}
                 onClick={props.onDelete}>
                <path strokeLinecap="round" strokeLinejoin="round"
                      d="M6 6l12 12M6 18l12-12"/>
            </svg>
        </div>
    );
}
