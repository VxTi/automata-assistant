/**
 * @fileoverview AssistantPage.tsx
 * @author Luca Warmenhoven
 * @date Created on Friday, October 04 - 12:11
 */
import { ReactNode, useContext, useEffect, useRef, useState } from "react";
import { useAnimationSequence }                               from "../../util/AnimationSequence";
import { AnnotatedIcon }                                      from "../../components/AnnotatedIcon";
import { ApplicationContext }                                 from "../../contexts/ApplicationContext";
import { Icons }                                              from "../../components/Icons";
import { ScrollableContainer }                                from "../../components/ScrollableContainer";
import { ChatMessage, LiveChatMessage }                       from "../../pages/assistant/ChatMessage";
import { ChatInputField }                                     from "../../pages/assistant/InputField";
import { ChatContext }                                        from "../../contexts/ChatContext";
import { Message }                                            from "llm";
import '../../styles/utilities.css'

/**
 * The assistant page.
 * This page is used to interact with the assistant.
 * Here, the user can input text, voice, or files to interact with the assistant.
 */
export function AssistantPage(props: {
    messages?: Message[],
    conversationTopic?: string,
    topicUUID?: string
}) {

    const [ messages, setMessages ]                   = useState<Message[]>(props.messages ?? []);
    const [ conversationTopic, setConversationTopic ] = useState<string>(props.conversationTopic ?? 'New conversation');
    const [ spokenResponse, setSpokenResponse ]       = useState(false);
    const [ topicUUID, setTopicUUID ]                 = useState<string | undefined>(props.topicUUID);
    const chatContainerRef                            = useRef<HTMLDivElement>(null);
    const lastMessageRef                              = useRef<HTMLDivElement>(null);
    const [ liveChatActive, setLiveChatActive ]       = useState(false);
    const { setHeaderConfig }                         = useContext(ApplicationContext);

    // Scroll down to the bottom of the chat
    // when the chat messages change.
    useEffect(() => {
        if ( !chatContainerRef.current ) return;

        chatContainerRef.current!.lastElementChild?.scrollIntoView({ behavior: 'smooth' });
    }, [ messages, chatContainerRef ]);

    useAnimationSequence({ containerRef: chatContainerRef }, [ messages ]);

    useEffect(() => {
        setHeaderConfig(() => {
            return {
                leftHeaderContent: messages.length > 0 ? (
                    <AnnotatedIcon
                        icon={<Icons.PencilSquare/>}
                        annotation="New topic" side='right' onClick={() => {
                        setConversationTopic('New conversation');
                        setMessages(() => []);
                    }}/>) : undefined,
                pageTitle:
                conversationTopic,
                rightHeaderContent:
                    <AnnotatedIcon
                        icon={!spokenResponse ? <Icons.SpeakerCross/> : <Icons.Speaker/>}
                        annotation={(spokenResponse ? 'Disable' : 'Enable') + " sound"}
                        side='left'
                        onClick={() => {
                            setSpokenResponse( !spokenResponse);
                        }}/>
            }
        });
    }, [ messages, spokenResponse, conversationTopic ]);

    return (
        <ChatContext.Provider value={{
            messages, setMessages, conversationTopic, setConversationTopic,
            spokenResponse, setSpokenResponse,
            topicUUID, setTopicUUID, lastMessageRef, setLiveChatActive
        }}>
            <div className="flex flex-col relative justify-start items-center h-full w-full max-w-screen-md">
                {messages.length === 0 && !liveChatActive ?
                 <div className="flex flex-row justify-center content-end gap-2 my-auto grow flex-wrap">
                     <ExampleCard>Write me a poem</ExampleCard>
                     <ExampleCard>What's the weather?</ExampleCard>
                     <ExampleCard>Send an email...</ExampleCard>
                 </div> :
                 <ScrollableContainer elementRef={chatContainerRef} size='lg'>
                     {messages.map((entry, index) =>
                                       <ChatMessage key={index} entry={entry}/>)}
                     <LiveChatMessage contentRef={lastMessageRef} active={liveChatActive}/>
                 </ScrollableContainer>}
                <ChatInputField/>
            </div>
        </ChatContext.Provider>
    )
}

function ExampleCard(props: { children: ReactNode }) {
    return (
        <div
            className={`content-container hoverable flex-col border-solid border-[1px] basis-48 transition-colors duration-300 justify-start items-center gap-4 px-2 text-sm py-1 bg rounded-3xl`}>
            {props.children}
        </div>
    )
}

