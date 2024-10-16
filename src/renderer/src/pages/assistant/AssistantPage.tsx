/**
 * @fileoverview AssistantPage.tsx
 * @author Luca Warmenhoven
 * @date Created on Friday, October 04 - 12:11
 */
import { useEffect, useRef, useState }         from "react";
import { ChatInputField }                      from "./InputField";
import { ChatContext, ChatContextMessageType } from "./Conversation";
import { NavigationHeader }                    from "./NavigationHeader";
import { ChatMessage, LiveChatMessage }        from "./ChatMessage";
import { useAnimationSequence }                from "../../util/AnimationSequence";
import '../../styles/utilities.css'

/**
 * The assistant page.
 * This page is used to interact with the assistant.
 * Here, the user can input text, voice, or files to interact with the assistant.
 */
export function AssistantPage() {

    const [ messages, setMessages ]                   = useState<(ChatContextMessageType)[]>([]);
    const [ historyVisible, setHistoryVisible ]       = useState(false);
    const [ conversationTopic, setConversationTopic ] = useState<string>('New conversation');
    const [ spokenResponse, setSpokenResponse ]       = useState(false);
    const [ topicUUID, setTopicUUID ]                 = useState<string | undefined>(undefined);
    const chatContainerRef                            = useRef<HTMLDivElement>(null);
    const lastMessageRef                              = useRef<HTMLDivElement>(null);
    const [ liveChatActive, setLiveChatActive ]       = useState(false);

    // Scroll down to the bottom of the chat
    // when the chat messages change.
    useEffect(() => {
        if ( !chatContainerRef.current ) return;

        chatContainerRef.current!.lastElementChild?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }, [ messages, chatContainerRef ]);

    useAnimationSequence({ containerRef: chatContainerRef }, [ messages ]);

    return (
        <ChatContext.Provider value={{
            messages, setMessages, conversationTopic, setConversationTopic,
            historyVisible, setHistoryVisible, spokenResponse, setSpokenResponse,
            topicUUID, setTopicUUID, lastMessageRef, setLiveChatActive
        }}>
            <div className="flex flex-col relative justify-start items-center grow">
                <NavigationHeader/>
                <div
                    className="grow relative flex flex-col w-[80%] mx-auto my-auto items-stretch overflow-hidden justify-start">
                    <div
                        ref={chatContainerRef}
                        className="absolute left-0 top-0 h-full w-full flex flex-col justify-start items-stretch grow shrink overflow-x-hidden no-scrollbar">
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

