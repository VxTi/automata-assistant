/**
 * @fileoverview AssistantPage.tsx
 * @author Luca Warmenhoven
 * @date Created on Friday, October 04 - 12:11
 */
import { useContext, useState }                from "react";
import { HomePage }                            from "../HomePage";
import { ApplicationContext }                  from "../../util/ApplicationContext";
import { BaseStyles }                          from "../../util/BaseStyles";
import { InteractiveField }                    from "./InteractionField";
import { ChatContext, ChatContextMessageType } from "./Conversation";
import '../../styles/animations.css'
import { ConversationTopicHistory }            from "./ConversationTopicHistory";

/**
 * The assistant page.
 * This page is used to interact with the assistant.
 * Here, the user can input text, voice, or files to interact with the assistant.
 */
export function AssistantPage() {

    const [ chatMessages, setChatMessages ]     = useState<(ChatContextMessageType)[]>([]);
    const [ historyVisible, setHistoryVisible ] = useState(false);
    const { setContent }                        = useContext(ApplicationContext);

    return (
        <ChatContext.Provider value={{ messages: chatMessages, setMessages: setChatMessages, }}>
            <div className="flex flex-col relative justify-start items-stretch grow max-w-screen-md w-full mx-auto">
                <div
                    className={`absolute flex flex-col transition-all justify-start items-stretch w-full h-full left-0 top-0 backdrop-blur-md ${!historyVisible ? 'hidden' +
                        ' pointer-events-none' : ''}`}>
                    {historyVisible && (
                        <div className="flex flex-col justify-start items-stretch">
                            <div className="flex justify-end items-center m-4">
                                <svg fill="none" strokeWidth="1.5" stroke="currentColor" viewBox="0 0 24 24"
                                     onClick={() => setHistoryVisible( !historyVisible)}
                                     className={`ml-auto my-2 ${BaseStyles.ICON}`}
                                     xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12"></path>
                                </svg>
                            </div>
                            <ConversationTopicHistory/>
                        </div>
                    )}
                </div>
                <div className="flex justify-between items-center m-4 text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5}
                         className={BaseStyles.ICON}
                         onClick={() => setContent(<HomePage/>)}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5"/>
                    </svg>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5}
                         onClick={() => setHistoryVisible( !historyVisible)}
                         className={BaseStyles.ICON}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16m-7 6h7"/>
                    </svg>
                </div>
                <div className="grow flex flex-col items-stretch justify-startoverflow-y-scroll overflow-x-hidden">
                    <div className="flex flex-col justify-start items-stretch my-auto w-[80%] mx-auto">
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
    console.log(messages)
    return (
        messages.map((entry, index) => {
            return entry.representation ? entry.representation : (
                <div key={index}
                     className="flex flex-row justify-start items-start bg-gray-700 rounded-md py-2 px-4 my-2">
                    <div className="flex flex-col justify-center items-start">
                        <div className="text-white text-xs">{entry.message.content}</div>
                    </div>
                </div>
            );
        })
    )
}

