/**
 * @fileoverview AssistantPage.tsx
 * @author Luca Warmenhoven
 * @date Created on Friday, October 04 - 12:11
 */
import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { FadeIn, useAnimationSequence }                     from "../../util/AnimationSequence";
import { AnnotatedIcon }                                    from "../../components/AnnotatedIcon";
import { ApplicationContext }                               from "../../contexts/ApplicationContext";
import { Icons }                                            from "../../components/Icons";
import { ScrollableContainer }                              from "../../components/ScrollableContainer";
import { ChatMessage, LiveChatMessage }                     from "../../pages/assistant/ChatMessage";
import { ChatInputField }                                   from "./ChatInputField";
import { ChatSessionContext }                               from "../../contexts/ChatContext";
import { Settings }                                         from "@renderer/util/Settings";
import { VoiceType }                                        from "tts";
import { playAudio }                                        from "@renderer/util/Audio";
import { Service }                                          from "@renderer/util/external_services/Services";
import '../../styles/utilities.css';

/**
 * The assistant page.
 * This page is used to interact with the assistant.
 * Here, the user can input text, voice, or files to interact with the assistant.
 */
export function AssistantPage() {

    const { session, verbose, setVerbose } = useContext(ChatSessionContext);

    const chatContainerRef    = useRef<HTMLDivElement>(null);
    const lastMessageRef      = useRef<HTMLDivElement>(null);
    const { setHeaderConfig } = useContext(ApplicationContext);

    const [ requiredUpdate, forceUpdate ] = useState<number>(0);

    const enableAudioElement = useMemo(() => {
        const audio   = document.createElement('audio');
        audio.src     = '/src/resources/audio/pop-sound.mp3';
        audio.onerror = () => console.error('Failed to load audio');
        return audio;
    }, []);


    // Scroll down to the bottom of the chat
    // when the chat messages change.
    useEffect(() => {

        session
            .onChunk(() => {
                if ( !lastMessageRef.current ) {
                    forceUpdate((prev) => prev + 1);
                    return;
                }

                lastMessageRef.current.innerHTML = session.streamedResponseBuffer;
                lastMessageRef.current.scrollIntoView({ behavior: 'smooth' });
            })
            .onChunkEnd(async () => {

                forceUpdate((prev) => prev + 1);

                if ( !verbose )
                    return;

                const { data } = await window[ 'ai' ].audio.textToSpeech(
                    {
                        input: session.streamedResponseBuffer,
                        model: 'tts-1',
                        voice: (Settings.TTS_VOICES[ parseInt(window.localStorage.getItem('voiceIndex') ?? '0') ] ?? 'nova') as VoiceType
                    });

                const arrayBuffer = Uint8Array.from(atob(data), c => c.charCodeAt(0)).buffer;
                const blob        = new Blob([ arrayBuffer ], { type: 'audio/mpeg' });
                playAudio(blob);
            })
            .onMessage(() => {
                forceUpdate((prev) => prev + 1);

                if ( session.messages.length > 1) {
                    window[ 'conversations' ].save(
                        {
                            topic: session.topic,
                            uuid: session.uuid,
                            messages: session.messages,
                            date: Date.now()
                        });
                }

                if ( lastMessageRef.current ) {
                    lastMessageRef.current.innerHTML = session.streamedResponseBuffer;
                    lastMessageRef.current.scrollIntoView({ behavior: 'smooth' });
                }
            })
            .onToolCall(tool => Service.invoke(tool.name, { ...tool.arguments, session }))

        chatContainerRef.current?.lastElementChild?.scrollIntoView({ behavior: 'smooth' });
    }, [ chatContainerRef, lastMessageRef, requiredUpdate, session ]);

    useAnimationSequence({ containerRef: chatContainerRef }, [ requiredUpdate ]);

    useEffect(() => {
        setHeaderConfig(() => {
            return {
                leftHeaderContent: session.messages.length > 0 ? (
                    <AnnotatedIcon
                        icon={<Icons.PencilSquare/>}
                        annotation="New topic" side='right' onClick={() => {
                        session.reset();
                        forceUpdate((prev) => prev + 1);

                    }}/>) : undefined,
                pageTitle: session.topic,
                rightHeaderContent:
                    <AnnotatedIcon
                        icon={!verbose ? <Icons.SpeakerCross/> : <Icons.Speaker/>}
                        annotation={(verbose ? 'Disable' : 'Enable') + " sound"}
                        side='left'
                        onClick={() => {
                            (enableAudioElement.cloneNode(true) as HTMLAudioElement).play();
                            setVerbose( !verbose)
                        }}/>
            }
        });
    }, [ requiredUpdate, verbose, session ]);

    return (
        <div className="flex flex-col relative justify-start items-center h-full w-full max-w-screen-md">
            {session.messages.length === 0 && !session.streaming ?
             (
                 <div className="flex flex-row justify-center content-end gap-2 my-auto grow flex-wrap">
                     <ExampleQuestion q="Write me a poem"/>
                     <ExampleQuestion q="Send a message..."/>
                     <ExampleQuestion q="Send an email..."/>
                     <ExampleQuestion q="Latest news"/>
                 </div>
             ) :
             (
                 <ScrollableContainer elementRef={chatContainerRef} size='lg'>
                     {session.messages.map((entry, index) =>
                                               <ChatMessage key={index} entry={entry}/>)}
                     <LiveChatMessage contentRef={lastMessageRef}/>
                 </ScrollableContainer>
             )}
            <ChatInputField/>
        </div>
    )
}

function ExampleQuestion(props: { q: string }) {
    const { session } = useContext(ChatSessionContext);
    return (
        <div
            {...FadeIn(700, 70)}
            onClick={() => session.complete({ content: props.q, role: 'user' })}
            className={`content-container hoverable flex-col border-solid border-[1px] basis-48 transition-colors duration-300 justify-start items-center gap-4 px-2 text-sm py-1 bg rounded-3xl`}>
            {props.q}
        </div>
    )
}

