/**
 * @fileoverview InputField.tsx
 * @author Luca Warmenhoven
 * @date Created on Friday, October 04 - 18:32
 */


import { useCallback, useContext, useRef, useState } from "react";
import { BaseStyles }                                from "../../util/BaseStyles";
import { requestMicrophoneAccess }                   from "../../util/Audio";
import { AIModels, CompletionMessage }               from "../../util/Model";
import { ChatContext, ChatContextMessageType }       from "./Conversation";
import { Marked }                                    from 'marked';
import { markedHighlight }                           from 'marked-highlight';
import hljs                                          from 'highlight.js';
import markedKatex                                   from "marked-katex-extension";
import '../../styles/code-highlighting.css';
import 'katex/dist/katex.min.css';

const marked = new Marked();
marked.use(
    markedHighlight(
        {
            langPrefix: 'hljs language-',
            highlight(code: string, lang: string) {
                const language = hljs.getLanguage(lang) ? lang : 'plaintext';
                return hljs.highlight(code, { language }).value;
            }
        }),
    markedKatex({ throwOnError: false })
);


/**
 * The interactive field where the user can input text or voice.
 * This field allows the user to input text, voice, or files.
 */
export function ChatInputField() {

    const [ recording, setRecording ]       = useState(false);
    const [ optionsShown, setOptionsShown ] = useState(false);

    const [ selectedFiles, setSelectedFiles ]         = useState<string[]>([]);
    const [ selectedDirectory, setSelectedDirectory ] = useState<string | null>(null);

    const inputContentRef = useRef<HTMLTextAreaElement>(null);
    const audioDevice     = useRef<MediaRecorder | null | undefined>(null);

    const { messages, setMessages, spokenResponse } = useContext(ChatContext);

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

        inputContentRef.current!.value = '';

        const myMessage: ChatContextMessageType = { message: { role: 'user', content: elementValue } };
        setMessages((previous: ChatContextMessageType[]) => [ ...previous, myMessage ]);

        const response = await AIModels.chat.generate(elementValue, messages.map(message => message.message));
        if ( !('choices' in response) )
            return;

        const responseMessage: ChatContextMessageType = {
            message: {
                role: response.choices[ 0 ][ 'message' ][ 'role' ],
                content: marked.parse(response.choices[ 0 ][ 'message' ][ 'content' ])
            } as CompletionMessage
        };
        setMessages((previous: ChatContextMessageType[]) => [ ...previous, responseMessage ]);
        if ( spokenResponse ) {
            await AIModels.audio.speech.generate(response.choices[ 0 ][ 'message' ][ 'content' ]);
        }
    }, [ spokenResponse, messages ]);

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
        // If we're going to start recording, request microphone access.
        if ( audioDevice.current === null ) {
            audioDevice.current = await requestMicrophoneAccess();
            // If the audio device is still not available, it probably means the user denied access.
            if ( !audioDevice.current )
                return;

            const chunks: BlobPart[] = [];
            let totalBytes           = 0;

            audioDevice.current.ondataavailable = event => {
                chunks.push(event.data);
                totalBytes += event.data.size;
                if ( totalBytes > 25 * 1024 * 1024 ) {
                    audioDevice.current!.stop();
                }
            }

            audioDevice.current.onstop = async () => {

                const transcription                     = await AIModels.audio.transcription.generate(
                    {
                        file: new Blob(chunks),
                        fileName: 'audio.mp4',
                        model: 'whisper-1',
                        temperature: 0.5
                    });
                const myMessage: ChatContextMessageType = { message: { role: 'user', content: transcription } };
                setMessages((previous: ChatContextMessageType[]) => [ ...previous, myMessage ]);
                const response = await AIModels.chat.generate(transcription, [ ...messages, myMessage ].map(message => message.message));

                if ( !('choices' in response) )
                    return;

                const responseMessage: ChatContextMessageType = {
                    message: {
                        role: response.choices[ 0 ][ 'message' ][ 'role' ],
                        content: (response.choices[ 0 ][ 'message' ][ 'content' ])
                    } as CompletionMessage
                };

                setMessages((previous) => [ ...previous, responseMessage ]);

                if ( spokenResponse ) {
                    await AIModels.audio.speech.generate(response.choices[ 0 ][ 'message' ][ 'content' ]);
                }
            }
        }

        // If the audio device is not available, return.
        if ( audioDevice.current === undefined )
            return;

        if ( !recording ) {
            audioDevice.current!.start(500);
        }
        else {
            audioDevice.current!.stop();
        }
        setRecording( !recording);
    }, [ spokenResponse, messages, recording ]);

    return (
        <div className="flex flex-col justify-center items-center mb-3 mt-1 mx-1">
            <div className="flex justify-start w-full items-center flex-wrap max-w-screen-sm my-1">
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
                className="flex flex-col justify-end items-center bg-gray-800 rounded-3xl max-w-screen-sm md:max-w-screen-lg overflow-hidden border-[1px] border-solid border-gray-700">
                <div
                    className={`flex flex-row justify-center items-center transition-all w-full overflow-hidden duration-500 ${optionsShown ? 'max-h-32 opacity-100' : 'max-h-0 opacity-0'}`}>
                    <ChatAlternativeOption
                        path="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
                        text="Add file" onClick={() => {
                        // @ts-ignore
                        window.api.openFile()
                              .then((files: string[]) => {
                                  setSelectedFiles([ ...selectedFiles, ...files ]);
                                  setOptionsShown(false);
                              });
                    }}/>
                    <ChatAlternativeOption
                        path="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z"
                        text="Add directory" onClick={() => {
                        // @ts-ignore
                        window.api.openDirectory()
                              .then((directory: string) => {
                                  setSelectedDirectory(directory);
                                  setOptionsShown(false);
                              });
                    }}/>
                </div>
                <div
                    className="flex justify-center items-center text-white mx-2">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5}
                         className={BaseStyles.ICON + ` ${optionsShown ? 'bg-gray-600' : ''}`}
                         onClick={() => setOptionsShown( !optionsShown)}>
                        <path strokeLinecap="round" strokeLinejoin="round"
                              d="m19.5 8.25-7.5 7.5-7.5-7.5"
                              className={(optionsShown ? 'opacity-100' : 'opacity-0') + ' transition-all duration-500'}/>
                        <path strokeLinecap="round" strokeLinejoin="round"
                              className={(optionsShown ? 'opacity-0' : 'opacity-100') + ' transition-all duration-500'}
                              d="M6.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM12.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM18.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"/>
                    </svg>
                    <textarea
                        placeholder="Ask me anything..."
                        rows={1} cols={50} ref={inputContentRef}
                        className="resize-none mx-2 w-full font-helvetica-neue grow focus:outline-none bg-transparent text-white p-2"/>
                    <svg xmlns="http://www.w3.org/2000/svg" fill={recording ? '#fff' : 'none'} viewBox="0 0 24 24"
                         strokeWidth={recording ? 0 : 1.5}
                         onClick={handleMicrophoneAccess}
                         className={BaseStyles.ICON}>
                        {recording ? (
                                       <>
                                           <path fill="#0c80b6"
                                                 d="M8.25 4.5a3.75 3.75 0 1 1 7.5 0v8.25a3.75 3.75 0 1 1-7.5 0V4.5Z"></path>
                                           <path
                                               d="M6 10.5a.75.75 0 0 1 .75.75v1.5a5.25 5.25 0 1 0 10.5 0v-1.5a.75.75 0 0 1 1.5 0v1.5a6.751 6.751 0 0 1-6 6.709v2.291h3a.75.75 0 0 1 0 1.5h-7.5a.75.75 0 0 1 0-1.5h3v-2.291a6.751 6.751 0 0 1-6-6.709v-1.5A.75.75 0 0 1 6 10.5Z"></path>
                                       </>
                                   ) :
                         <path strokeLinecap="round" strokeLinejoin="round"
                               d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z"/>
                        }
                    </svg>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5}
                         className={BaseStyles.ICON}
                         onClick={handleSend}>
                        <path strokeLinecap="round" strokeLinejoin="round"
                              d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5"></path>
                    </svg>
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
            className="flex flex-row justify-center items-center mx-1 py-1 px-2 my-1 basis-24 shrink-0 bg-gray-700 rounded-xl hover:brightness-125 hover:cursor-pointer duration-500 transition-all">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5}
                 className="w-6 h-6 mb-1 stroke-white shrink-0 transition-colors duration-500 rounded-full">
                <path strokeLinecap="round" strokeLinejoin="round"
                      d={props.path}/>
            </svg>
            <div className="text-white ml-1 text-xs text-nowrap">{props.text}</div>
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
    const fileName = props.filePath.substring(props.filePath.lastIndexOf(window.api.separator) + 1);
    return (
        <div
            className="flex flex-row justify-between items-center bg-gray-700 p-1 mx-0.5 my-1 rounded-3xl">
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
            <div className="text-white truncate text-xs mx-0.5">{fileName}</div>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5}
                 className={BaseStyles.ICON_NO_MARGIN}
                 onClick={props.onDelete}>
                <path strokeLinecap="round" strokeLinejoin="round"
                      d="M6 6l12 12M6 18l12-12"/>
            </svg>
        </div>
    );
}
