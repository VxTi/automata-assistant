/**
 * @fileoverview ChatInputField.tsx
 * @author Luca Warmenhoven
 * @date Created on Friday, October 04 - 18:32
 */


import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { Icons, InteractiveIcon }                               from "../../components/Icons";
import { playAudio }                                            from "../../util/Audio";
import { ChatSessionContext }                                   from "../../contexts/ChatContext";

import '../../styles/code-highlighting.css';
import { encodeBlobToBase64 } from "../../../../shared/Encoding";


/**
 * The interactive field where the user can input text or voice.
 * This field allows the user to input text, voice, or files.
 */
export function ChatInputField() {

    const [ selectedDirectory, setSelectedDirectory ] = useState<string | null>(null);
    const [ optionsShown, setOptionsShown ]           = useState(false);
    const [ selectedFiles, setSelectedFiles ]         = useState<string[]>([]);
    const [ recording, setRecording ]                 = useState(false);

    const inputContentRef = useRef<HTMLTextAreaElement>(null);

    const { session, verbose } = useContext(ChatSessionContext);

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
    const handleSendRequest = useCallback((prompt: string) => {
        session.complete({ role: 'user', content: prompt });
    }, [ session ]);

    /**
     * Handles the sending of a message.
     * This function is called when the user clicks on the send icon,
     * and will send the message to the AI model for a response.
     */
    const handleSend = useCallback(() => {
        const elementValue = inputContentRef.current!.value.trim() || '';
        // Prevent empty messages
        if ( !inputContentRef.current || !elementValue )
            return;

        inputContentRef.current!.value        = '';
        inputContentRef.current!.style.height = 'auto';
        handleSendRequest(elementValue);

    }, [ inputContentRef, handleSendRequest ]);

    const mediaRecorder = useRef<MediaRecorder | undefined | null>(null);

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

        if (mediaRecorder.current === null) {
            const mediaStream = await window.navigator.mediaDevices
                                            .getUserMedia({ audio: true }).catch(_ => null);

            if ( !mediaStream ) {
                // TODO: Add visual aid letting the user know audio recording is disabled.
                return;
            }

            mediaRecorder.current = new MediaRecorder(mediaStream, { audioBitsPerSecond: 16000 });
        }

        // Not available at all.
        if ( mediaRecorder.current === undefined)
            return;


        const chunks: BlobPart[] = [];
        let totalBytes           = 0;

        // Append incoming audio chunks to the chunks array.
        mediaRecorder.current.ondataavailable = event => {
            chunks.push(event.data);
            totalBytes += event.data.size;

            // Prevent file size from getting too large, currently capped at 25MB.
            if ( totalBytes > window[ 'ai' ][ 'audio' ].speechToTextFileLimit ) {
                mediaRecorder.current?.stop();
            }
        }

        // When the recording is stopped, send the request.
        mediaRecorder.current.onstop = async () => {
            console.log('Recording stopped');
            const audioBlob = new Blob(chunks);

            console.log(audioBlob.size, audioBlob.type);

            mediaRecorder.current = null;

            document.addEventListener('click', () => playAudio(audioBlob));

            const base64 = await encodeBlobToBase64(audioBlob);

            console.log(base64);

            /*const transcription = await window[ 'ai' ][ 'audio' ]
             .speechToText({ file: base64 } as SpeechToTextRequest);*/

            // console.log(transcription)
            //handleSendRequest(transcription);
        }

        mediaRecorder.current[ recording ? 'stop' : 'start' ]?.(window[ 'ai' ][ 'audio' ].audioSegmentationIntervalMs);
        setRecording( !recording);

    }, [ verbose, recording ]);

    return (
        <div className="flex flex-col justify-center items-center mb-4 mt-1 max-w-screen-md w-full">
            <div className="flex justify-start self-stretch items-center flex-wrap max-w-screen-sm my-1 mx-4 sm:mr-4">
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
                className="flex flex-col justify-end items-center rounded-3xl max-w-screen-md mx-4 sm:mr-4 sm:ml-0 overflow-hidden border-solid border-[1px] content-container selectable transition-colors duration-200">
                <div
                    className={`flex flex-row justify-center items-center transition-all w-full overflow-hidden duration-500 ${optionsShown ? 'max-h-24 opacity-100' : 'max-h-0 opacity-0'}`}>
                    <ChatAlternativeOption
                        path="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
                        text="Add file" onClick={() => {
                        window[ 'fs' ]
                            .selectFile()
                            .then((files: string[]) => {
                                setSelectedFiles([ ...selectedFiles, ...files ]);
                                setOptionsShown(false);
                            });
                    }}/>
                    <ChatAlternativeOption
                        path="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z"
                        text="Add directory" onClick={() => {

                        window[ 'fs' ]
                            .selectDirectory()
                            .then((directory: string) => {
                                setSelectedDirectory(directory);
                                setOptionsShown(false);
                            });
                    }}/>
                </div>
                <div
                    className="flex justify-center items-end text-white dark:text-black mx-2">
                    <InteractiveIcon icon={<Icons.ThreeDots/>}
                                     onClick={() => setOptionsShown( !optionsShown)}
                                     className="self-center"/>
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

                    <InteractiveIcon icon={recording ? <Icons.Stop/> : <Icons.Microphone/>}
                                     onClick={handleMicrophoneAccess}
                                     className="self-center"
                    />
                    <InteractiveIcon icon={<Icons.PaperAirplane/>} onClick={handleSend}
                                     className="self-center"/>
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
                 className="w-6 h-6 p-0.5 mb-1 shrink-0 transition-colors duration-300 rounded-full">
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
            className="content-container flex-row justify-between items-center mx-0.5 my-1 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5}
                 className='w-7 h-7 p-1 apply-stroke shrink-0 transition-colors duration-300 rounded-full'
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
            <div
                onClick={props.onDelete}
                className='w-7 h-7 p-1 apply-stroke shrink-0 transition-colors duration-300 rounded-full hover:brightness-75 hover:cursor-pointer'>
                <Icons.Cross/>
            </div>
        </div>
    );
}
