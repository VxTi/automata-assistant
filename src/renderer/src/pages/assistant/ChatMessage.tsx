/**
 * @fileoverview ChatMessage.tsx
 * @author Luca Warmenhoven
 * @date Created on Saturday, October 05 - 01:45
 */
import { RefObject, useCallback, useContext, useEffect, useRef, useState } from "react";
import { CreateSequence }                                                  from "../../util/AnimationSequence";
import { Icons, InteractiveIcon }                                          from "../../components/Icons";
import renderMathInElement              from "katex/contrib/auto-render";
import { ChatSessionContext, mdParser } from "../../contexts/ChatSessionContext";
import { Message }                      from "llm";
import '../../styles/markdown.css'
import 'katex/dist/katex.min.css'
import { AnnotatedIcon }                                                   from "@renderer/components/AnnotatedIcon";
import { Settings }                                                        from "@renderer/util/Settings";
import { VoiceType }                                                       from "tts";
import { playAudio }                                                       from "@renderer/util/Audio";

/**
 * The chat message.
 * This component is used to display a chat message.
 * @param props the properties of the component.
 * @constructor
 */
export function ChatMessage(props: { entry: Message }) {

    const [ playing, setPlaying ]                     = useState(false);
    const [ audioBlob, setAudioBlob ]                 = useState<Blob | null>(null);
    const [ copiedToClipboard, setCopiedToClipboard ] = useState(false);

    const saveToClipboardCb = useCallback(async () => {
        if ( typeof props.entry.content === 'object' && !Array.isArray(props.entry.content) )
            return;

        setCopiedToClipboard(true);
        await navigator.clipboard.writeText(Array.isArray(props.entry.content) ? props.entry.content.join("\n") : props.entry.content);

        setTimeout(() => setCopiedToClipboard(false), 1000);
    }, []);

    const contentRef = useRef<HTMLSpanElement>(null);

    useEffect(() => {
        if ( !contentRef.current ) return;

        renderMathInElement(contentRef.current, {
            delimiters: [
                { left: '[', right: ']', display: true },
                { left: '$$', right: '$$', display: true },
                { left: '$', right: '$', display: true }
            ],
            output: 'html',
            throwOnError: false
        });

        if ( !(typeof props.entry.content === 'object' && !Array.isArray(props.entry.content)) )
            contentRef.current.innerHTML = mdParser.parse(Array.isArray(props.entry.content) ? props.entry.content.join("\n") : props.entry.content) as string

    }, [ contentRef ]);

    const toggleMessagePlayState = useCallback(() => {
        if ( typeof props.entry.content !== 'string' ) return;

        setPlaying(!playing);

        if ( !audioBlob ) {
            window[ 'ai' ]
                .audio
                .textToSpeech(
                    {
                        input: props.entry.content,
                        voice: Settings.TTS_VOICES[ Settings.get(Settings.ASSISTANT_VOICE_TYPE) ].toLowerCase() as VoiceType,
                        model: 'tts-1', speed: 1.0,
                    }
                )
                .then(audioB64 => {
                    const blob = window[ 'ai' ].audio.ttsBase64ToBlob(audioB64.data);
                    setAudioBlob(blob);
                    playAudio(blob);
                });
            return;
        }

        playAudio(audioBlob);
    }, [ audioBlob, playing ]);

    return (
        <div
            className="relative group shadow-sm flex-row justify-between items-start content-container rounded-md py-2 px-4 my-1 mx-2 hover:brightness-95 dark:hover:brightness-110 transition-all duration-300"
            {...CreateSequence('fadeIn', 300, 10)}>
            <div className="flex flex-col justify-center items-start text-wrap overflow-hidden w-full">
                <div className="flex flex-row justify-between items-center w-full">
                    <span
                        className="font-bold font-sans text-md">{props.entry.role === 'user' ? 'You' : 'Assistant'}</span>
                    <InteractiveIcon icon={copiedToClipboard ? <Icons.Checkmark/> : <Icons.Clipboard/>}
                                     onClick={saveToClipboardCb}
                                     className='opacity-0 group-hover:opacity-100 transition-all'/>
                </div>
                <div className="not-prose text-sm pt-2 pb-2 w-full">
                    <span className="markdown" ref={contentRef}/>
                </div>
                <div
                    className="opacity-0 max-h-0 group-hover:max-h-32 transition-all duration-300 group-hover:opacity-100 delay-500">
                    <AnnotatedIcon annotation={'Play message'}
                                   side='right'
                                   onClick={toggleMessagePlayState}
                                   icon={<Icons.Play/>}
                    />
                </div>
            </div>
        </div>
    )
}

/**
 * The live chat message.
 * This component is used to display a live chat message.
 * @param props the properties of the component.
 * @constructor
 */
export function LiveChatMessage(props: { contentRef: RefObject<HTMLDivElement> }) {

    const { session } = useContext(ChatSessionContext);

    if ( !session.streamedResponseBuffer )
        return null;

    return (
        <div
            className="group flex flex-row justify-between items-start content-container rounded-md py-2 px-4 my-1 mx-2 transition-all"
            {...CreateSequence('fadeIn', 300, 10)}>
            <div className="flex flex-col justify-center items-start overflow-x-scroll">
                        <span
                            className="font-bold font-sans text-md">Assistant</span>
                <div className="not-prose text-sm mt-2 mb-1">
                    <div ref={props.contentRef}/>
                </div>
            </div>
        </div>
    )
}
