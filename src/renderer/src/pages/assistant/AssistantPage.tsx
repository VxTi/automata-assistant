/**
 * @fileoverview AssistantPage.tsx
 * @author Luca Warmenhoven
 * @date Created on Friday, October 04 - 12:11
 */
import { useContext, useState }                from "react";
import { InteractiveField }                    from "./InteractionField";
import { ChatContext, ChatContextMessageType } from "./Conversation";
import { ConversationHistoryContainer }        from "./ConversationTopicHistory";
import { NavigationHeader }                    from "./NavigationHeader";
import '../../styles/animations.css'

/**
 * The assistant page.
 * This page is used to interact with the assistant.
 * Here, the user can input text, voice, or files to interact with the assistant.
 */
export function AssistantPage() {

    const [ chatMessages, setChatMessages ]     = useState<(ChatContextMessageType)[]>([]);
    const [ historyVisible, setHistoryVisible ] = useState(false);
    const [ conversationTopics, setConversationTopics ] = useState<string>('New conversation');

    return (
        <ChatContext.Provider value={{
            messages: chatMessages, setMessages: setChatMessages,
            conversationTopic: conversationTopics, setConversationTopic: setConversationTopics,
            historyVisible: historyVisible, setHistoryVisible: setHistoryVisible
        }}>
            <div className="flex flex-col relative justify-start items-stretch grow max-w-screen-md w-full mx-auto">
                <ConversationHistoryContainer />
                <NavigationHeader/>
                <div
                    className="grow relative flex flex-col w-[80%] mx-auto my-auto items-stretch overflow-hidden justify-start">
                    <div
                        className="absolute left-0 top-0 h-full w-full flex flex-col justify-start items-stretch grow shrink overflow-x-hidden no-scrollbar">
                        <ChatHistory/>
                    </div>
                </div>
                <InteractiveField/>
            </div>
        </ChatContext.Provider>
    )
}

/**
 * The chat history.
 * This history is used to display the chat messages.
 */
function ChatHistory() {
    const { messages } = useContext(ChatContext);

    return messages.map((entry, index) => {
        return entry.representation ? entry.representation : (
            <div key={index}
                 className="flex flex-row justify-start items-start bg-gray-800 rounded-md py-2 px-4 my-1">
                <div className="flex flex-col justify-center items-start">
                        <span
                            className="text-white font-bold font-sans text-md">{entry.message.role === 'user' ? 'You' : 'Assistant'}</span>
                    <div className="text-white font-helvetica-neue text-sm mt-2 mb-1">
                        <span>{entry.message.content}</span>
                    </div>
                </div>
            </div>
        );
    });
}

