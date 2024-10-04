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
import { ConversationHistoryWrapper }          from "./ConversationTopicHistory";
import '../../styles/animations.css'

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
                <ConversationHistoryWrapper historyShown={historyVisible} setHistoryShown={setHistoryVisible}/>
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
    return (
        messages.map((entry, index) => {
            return entry.representation ? entry.representation : (
                <div key={index}
                     className="flex flex-row justify-start items-start bg-gray-700 rounded-md py-2 px-4 my-2">
                    <div className="flex flex-col justify-center items-start">
                        <span
                            className="text-white font-bold font-sans text-md">{entry.message.role === 'user' ? 'You' : 'Assistant'}</span>
                        <div className="text-white text-sm my-2">
                            <span>{entry.message.content}</span>
                        </div>
                    </div>
                </div>
            );
        })
    )
}

