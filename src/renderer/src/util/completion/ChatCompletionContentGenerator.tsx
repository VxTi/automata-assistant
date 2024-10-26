/**
 * @fileoverview ChatCompletionContentGenerator.tsx
 * @author Luca Warmenhoven
 * @date Created on Wednesday, October 23 - 12:41
 */
import { ReactNode, useCallback, useEffect, useRef, useState } from "react";
import { ChatCompletionSession }                               from "@renderer/util/completion/ChatCompletionSession";
import {
    ComposedMessageFragment,
    ExecutableFragment,
    FileFragment,
    ImageFragment,
    TextFragment
} from "@renderer/util/completion/ChatCompletionMessageFragments";
import renderMathInElement                                     from "katex/contrib/auto-render";
import { mdParser }                                            from "@renderer/contexts/ChatSessionContext";
import { Settings }                                            from "@renderer/util/Settings";
import { VoiceType }                                           from "tts";
import { playAudio }                                           from "@renderer/util/Audio";
import { CreateSequence }                                      from "@renderer/util/AnimationSequence";
import { Icons, InteractiveIcon }                              from "@renderer/components/Icons";
import { AnnotatedIcon }                                       from "@renderer/components/AnnotatedIcon";
import { MessageRole }                                         from "llm";

/**
 * The chat completion content generator.
 * This class is used to generate the content for a completion,
 * in React nodes.
 * This will generate JSON nodes that can be rendered in the completion.
 */
export class ChatCompletionContentGenerator {

    /**
     * The chat completion session.
     */
    private _session: ChatCompletionSession;

    /**
     * Create a new chat completion content generator.
     * @param session The chat completion session.
     */
    constructor(session: ChatCompletionSession) {
        this._session = session;
    }

    /**
     * Getter for the generated React nodes for the completion.
     * @return The generated React nodes.
     */
    public get content(): ReactNode[] {
        return this._session.fragments.map((composedFragment, i) => {
            return (
                <ComposedFragmentComponent key={i} fragment={composedFragment}/>
            )
        })
    }
}

function ComposedFragmentComponent(props: { fragment: ComposedMessageFragment}) {
    return (
        <div
             className="flex shadow-sm flex-col justify-start items-start content-container rounded-md py-2 px-4 my-1 mx-2 hover:brightness-95 dark:hover:brightness-110 transition-all duration-300">
            {props.fragment.fragments.map((fragment, j) => {

                switch ( fragment.type ) {
                    case "file-list":
                        return (<FileListComponent key={j} files={fragment.files}/>);
                    case 'text':
                        return (<TextFragmentComponent key={j} message={fragment} role={props.fragment.role}/>);
                    case "image":
                        return (<ImageFragmentComponent key={j} message={fragment}/>);
                    case 'executable':
                        return (<ExecutableFragmentComponent key={j} message={fragment}/>);
                }
                return null;
            })}
        </div>
    )
}

/**
 * The executable fragment component.
 * This component is used to display an executable fragment
 * @param props The fragment properties.
 * @constructor
 */
function ExecutableFragmentComponent(props: { message: ExecutableFragment }) {
    return (
        <div className="bg-black text-white">{props.message.content}</div>
    )
}

/**
 * The image fragment component.
 * This component is used to display an image fragment.
 * @param props The fragment properties.
 * @constructor
 */
function ImageFragmentComponent(props: { message: ImageFragment }) {
    const [ width, height ] = (props.message.dimensions as string).split('x').map(Number);
    return (
        <img src={props.message.url} alt={props.message.alt} width={width} height={height}/>
    )
}

/**
 * The text fragment component.
 * This component is used to display a text fragment.
 * @param props The fragment properties.
 * @constructor
 */
function TextFragmentComponent(props: { message: TextFragment, role: MessageRole }) {
    const [ playing, setPlaying ]                     = useState(false);
    const [ audioBlob, setAudioBlob ]                 = useState<Blob | null>(null);
    const [ copiedToClipboard, setCopiedToClipboard ] = useState(false);

    const saveToClipboardCb = useCallback(async () => {
        setCopiedToClipboard(true);
        await navigator.clipboard.writeText(props.message.content);

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

        contentRef.current.innerHTML = mdParser.parse(props.message.content) as string

    }, [ contentRef ]);

    const toggleMessagePlayState = useCallback(() => {

        setPlaying(!playing);

        if ( !audioBlob ) {
            window[ 'ai' ]
                .audio
                .textToSpeech(
                    {
                        input: props.message.content,
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
            className="relative group flex-row justify-between items-start flex w-full"
            {...CreateSequence('fadeIn', 300, 10)}>
            <div className="flex flex-col justify-center items-start text-wrap overflow-hidden w-full">
                <div className="flex flex-row justify-between items-center w-full">
                    <span
                        className="font-bold font-sans text-md">{props.role === 'user' ? 'You' : 'Assistant'}</span>
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
 * The file list component.
 * This component is used to display a list of files.
 * @param props The properties of the component.
 * @constructor
 */
function FileListComponent(props: { files: FileFragment[]}) {
    return (
        <div className="flex flex-col">
            {props.files.map((file, i) => {
                return (
                    <div key={i} className="flex flex-row items-center">
                        <span className="text-sm font-bold">{file.name}</span>
                        <span className="text-sm text-gray-400 ml-2">{file.size}</span>
                    </div>
                )
            })}
        </div>
    )
}
