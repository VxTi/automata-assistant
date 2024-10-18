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
import { ApplicationContext }                      from "../../util/ApplicationContext";

import '../../styles/utilities.css'
import { Message }                                 from "../../../../backend/ai/ChatCompletionDefinitions";

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
                                        path="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
                                        annotation="New topic" side='right' onClick={() => {
                                        setConversationTopic('New conversation');
                                        setMessages(() => []);
                                    }}/>) : undefined,
                                pageTitle:
                                conversationTopic,
                                rightHeaderContent:
                                    <AnnotatedIcon
                                        path={!spokenResponse ? "M17.25 9.75 19.5 12m0 0 2.25 2.25M19.5 12l2.25-2.25M19.5 12l-2.25" +
                                            " 2.25m-10.5-6 4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z" :
                                              "M19.114 5.636a9 9 0 0 1 0 12.728M16.463 8.288a5.25 5.25 0 0 1 0 7.424M6.75" +
                                                  " 8.25l4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 " +
                                                  "0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z"
                                        }
                                        annotation={(spokenResponse ? 'Disable ' : 'Enable ') + " sound"} side="left"
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
                <div
                    className="grow relative flex flex-col w-[80%] mx-auto my-auto items-stretch overflow-hidden justify-start max-w-screen-md">
                    <div
                        ref={chatContainerRef}
                        className="absolute left-0 top-0 h-full w-full flex flex-col justify-start items-stretch grow shrink overflow-x-hidden no-scrollbar">
                        {messages.length === 0 && !liveChatActive &&
                            <div className="justify-self-center mx-auto">
                                <div className="text-2xl font-bold text-gray-500">Start a conversation</div>
                                <div className="text-lg text-gray-400">Ask me anything</div>

                            </div>}
                        {messages.map((entry, index) =>
                                          <ChatMessage key={index} entry={entry}/>)}
                        <LiveChatMessage contentRef={lastMessageRef} active={liveChatActive}/>
                    </div>
                </div>
                <ChatInputField/>
            </div>
        </ChatContext.Provider>
    )
}

