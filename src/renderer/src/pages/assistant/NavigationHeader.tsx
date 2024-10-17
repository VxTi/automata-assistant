/**
 * @fileoverview InteractionHeader.tsx
 * @author Luca Warmenhoven
 * @date Created on Friday, October 04 - 19:50
 */
import { useContext }    from "react";
import { ChatContext }   from "./Conversation";
import { AnnotatedIcon } from "../../components/AnnotatedIcon";

/**
 * The navigation header.
 * This header contains navigation buttons for the assistant page.
 */
export function NavigationHeader() {
    const {
              messages, setMessages,
              spokenResponse, setSpokenResponse,
              conversationTopic, setConversationTopic
          } = useContext(ChatContext);
    return (
        <div className="grid grid-cols-5 items-center mt-4 mb-1 mx-4 text-white max-w-screen-md w-full">
            <div className="flex flex-row items-center text-black">
                {messages.length > 0 && (

                    <AnnotatedIcon
                        path="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
                        annotation="New topic" side='right' onClick={() => {
                        setConversationTopic('New conversation');
                        setMessages(() => []);
                    }}/>
                )}
            </div>
            <h1 className="text-black text-2xl col-start-2 col-end-5 text-center">
                {conversationTopic}
            </h1>
            <div className="flex flex-row items-center justify-end">
                <AnnotatedIcon
                    path={!spokenResponse ? "M17.25 9.75 19.5 12m0 0 2.25 2.25M19.5 12l2.25-2.25M19.5 12l-2.25" +
                        " 2.25m-10.5-6 4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z" :
                          "M19.114 5.636a9 9 0 0 1 0 12.728M16.463 8.288a5.25 5.25 0 0 1 0 7.424M6.75" +
                              " 8.25l4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 " +
                              "0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z"
                    }
                    annotation={(spokenResponse ? 'Disable ' : 'Enable ') + " sound"} side="left" onClick={() => {
                    setSpokenResponse( !spokenResponse);
                }}/>
            </div>
        </div>
    )
}
