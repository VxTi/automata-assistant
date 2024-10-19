/**
 * @fileoverview AssistantPage.tsx
 * @author Luca Warmenhoven
 * @date Created on Friday, October 04 - 12:11
 */
import { useContext, useEffect, useRef, useState } from "react";
import { ChatInputField }                          from "./InputField";
import { ChatContext }                             from "./Conversation";
import { ChatMessage, LiveChatMessage }            from "./ChatMessage";
import { useAnimationSequence }                    from "../../util/AnimationSequence";
import { AnnotatedIcon }                           from "../../components/AnnotatedIcon";
import { ApplicationContext }                      from "../../contexts/ApplicationContext";

import '../../styles/utilities.css'
import { Message }                                 from "../../../../backend/ai/ChatCompletionDefinitions";
import { Icons }                                   from "../../components/Icons";
import { ScrollableContainer }                     from "../../components/ScrollableContainer";

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

        chatContainerRef.current!.lastElementChild?.scrollIntoView({ behavior: 'smooth', block: 'end' });
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
                        }
        );
    }, [ messages, spokenResponse, conversationTopic ]);

    return (
        <ChatContext.Provider value={{
            messages, setMessages, conversationTopic, setConversationTopic,
            spokenResponse, setSpokenResponse,
            topicUUID, setTopicUUID, lastMessageRef, setLiveChatActive
        }}>
            <div className="flex flex-col relative justify-start items-center grow">
                <ScrollableContainer elementRef={chatContainerRef} size='lg'>
                    {messages.length === 0 && !liveChatActive &&
                        <div className="justify-self-center mx-auto">

                        </div>}
                    {messages.map((entry, index) =>
                                      <ChatMessage key={index} entry={entry}/>)}
                    <LiveChatMessage contentRef={lastMessageRef} active={liveChatActive}/>
                </ScrollableContainer>
                <ChatInputField/>
            </div>
        </ChatContext.Provider>
    )
}

