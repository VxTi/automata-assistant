/**
 * @fileoverview AssistantPage.tsx
 * @author Luca Warmenhoven
 * @date Created on Friday, October 04 - 12:11
 */
import { useEffect, useRef, useState }         from "react";
import { ChatInputField }                      from "./InputField";
import { ChatContext, ChatContextMessageType } from "./Conversation";
import { ConversationHistoryContainer }        from "./ConversationTopicHistory";
import { NavigationHeader }                    from "./NavigationHeader";
import '../../styles/animations.css'
import { ChatMessage }                         from "./ChatMessage";
import { useAnimationSequence }                from "../../util/AnimationSequence";

/**
 * The assistant page.
 * This page is used to interact with the assistant.
 * Here, the user can input text, voice, or files to interact with the assistant.
 */
export function AssistantPage() {

    const [ chatMessages, setChatMessages ]             = useState<(ChatContextMessageType)[]>([]);
    const [ historyVisible, setHistoryVisible ]         = useState(false);
    const [ conversationTopics, setConversationTopics ] = useState<string>('New conversation');
    const [ spokenResponse, setSpokenResponse ]         = useState(false);

    const chatContainerRef = useRef<HTMLDivElement>(null);

    // Scroll down to the bottom of the chat
    // when the chat messages change.
    useEffect(() => {
        if ( !chatContainerRef.current ) return;

        chatContainerRef.current!.lastElementChild?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }, [ chatMessages, chatContainerRef ]);

    useAnimationSequence({ containerRef: chatContainerRef }, [ chatMessages ]);

    return (
        <ChatContext.Provider value={{
            messages: chatMessages, setMessages: setChatMessages,
            conversationTopic: conversationTopics, setConversationTopic: setConversationTopics,
            historyVisible: historyVisible, setHistoryVisible: setHistoryVisible,
            spokenResponse: spokenResponse, setSpokenResponse: setSpokenResponse
        }}>
            <ConversationHistoryContainer/>
            <div className="flex flex-col relative justify-start items-stretch grow max-w-screen-md w-full mx-auto">
                <NavigationHeader/>
                <div
                    className="grow relative flex flex-col w-[80%] mx-auto my-auto items-stretch overflow-hidden justify-start">
                    <div
                        ref={chatContainerRef}
                        className="absolute left-0 top-0 h-full w-full flex flex-col justify-start items-stretch grow shrink overflow-x-hidden no-scrollbar">
                        {chatMessages.map((entry, index) =>
                                              <ChatMessage key={index} entry={entry}/>)}
                    </div>
                </div>
                <ChatInputField/>
            </div>
        </ChatContext.Provider>
    )
}

