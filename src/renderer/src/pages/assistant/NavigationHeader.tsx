/**
 * @fileoverview InteractionHeader.tsx
 * @author Luca Warmenhoven
 * @date Created on Friday, October 04 - 19:50
 */
import { BaseStyles }         from "../../util/BaseStyles";
import { HomePage }           from "../HomePage";
import { useContext }         from "react";
import { ApplicationContext } from "../../util/ApplicationContext";
import { ChatContext }        from "./Conversation";

/**
 * The navigation header.
 * This header contains navigation buttons for the assistant page.
 */
export function NavigationHeader() {
    const { setContent } = useContext(ApplicationContext);
    const {
              historyVisible, setHistoryVisible,
              messages, setMessages,
              conversationTopic, setConversationTopic
          }              = useContext(ChatContext);
    return (
        <div className="grid grid-cols-3 items-center mt-4 mb-1 mx-4 text-white">
            <div className="flex flex-row items-center">
                <AnnotatedIcon path="M15.75 19.5 8.25 12l7.5-7.5"
                               annotation="Home" side='right' onClick={() => setContent(<HomePage/>)}
                />
                {messages.length > 0 && (

                    <AnnotatedIcon
                        path="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
                        annotation="New topic" side='right' onClick={() => {
                        setHistoryVisible(false);
                        setConversationTopic('New conversation');
                        setMessages([]);
                    }}/>
                )}
            </div>
            <h1 className="text-white text-lg font-helvetica-neue text-center">
                {conversationTopic}
            </h1>
            <div className="flex flex-row items-center justify-end">
                <AnnotatedIcon path="M4 6h16M4 12h16m-7 6h7" annotation="History" side='left'
                               onClick={() => setHistoryVisible( !historyVisible)}/>
            </div>
        </div>
    )
}

/**
 * The annotated icon.
 * This icon contains an annotation that will be displayed when hovered.
 * @param props The properties for the annotated icon
 */
function AnnotatedIcon(props: { path: string, annotation: string, side: 'left' | 'right', onClick: () => void }) {
    return (
        <div
            className={`group flex items-center justify-start ${props.side === 'right' ? 'flex-row-reverse' : 'flex-row'}`}>
        <span
            className="group-hover:max-w-[120px] text-nowrap group-hover:px-2 group-hover:py-1 group-hover:opacity-100 opacity-0 bg-stone-950 rounded-xl max-w-[0px] transition-all duration-500 ease-in-out overflow-hidden">
            {props.annotation}
        </span>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5}
                 onClick={props.onClick}
                 className={BaseStyles.ICON}>
                <path strokeLinecap="round" strokeLinejoin="round" d={props.path}/>
            </svg>
        </div>
    )
}