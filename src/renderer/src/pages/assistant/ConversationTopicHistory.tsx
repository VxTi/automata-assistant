/**
 * @fileoverview ConversationTopicHistory.tsx
 * @author Luca Warmenhoven
 * @date Created on Friday, October 04 - 18:38
 */
import { useContext, useEffect, useRef, useState } from "react";
import { ChatContext, ConversationTopic }          from "./Conversation";
import { CreateSequence, useAnimationSequence }    from "../../util/AnimationSequence";
import { BaseStyles }                              from "../../util/BaseStyles";

/**
 * The conversation history wrapper.
 * This component is used to display the conversation history,
 * and allows the user to select a conversation topic to view.
 * @param props the properties of the component.
 */
export function ConversationHistoryContainer() {
    const [ conversationTopics, setConversationTopics ] = useState<ConversationTopic[]>([]);
    const {
              setMessages, historyVisible, setConversationTopic, setHistoryVisible
          }                                             = useContext(ChatContext);

    const containerRef = useRef<HTMLDivElement>(null);
    useAnimationSequence({ containerRef: containerRef, intervalType: 'absolute' },
                         [ conversationTopics, historyVisible ]);

    // Load the conversation topics.
    useEffect(() => {
        // @ts-ignore
        window.api.getTopicHistory()
              .then((topics: ConversationTopic[]) => {
                  let finalizedTopics = topics;
                  // Fix faulty topic history.
                  if ( topics.some(topic => !('topic' in topic || 'date' in topic || 'messages' in topic)) ) {
                      finalizedTopics = topics.filter(topic => {
                          return 'topic' in topic && 'date' in topic && 'messages' in topic;
                      });
                      // @ts-ignore
                      window.api.saveTopicHistory(fixed)
                  }
                  setConversationTopics(finalizedTopics);
              });
    }, []);

    return (
        <div
            className={`absolute transition-all duration-300 flex z-20 flex-col transition-all justify-start items-stretch w-full h-full left-0 top-0 backdrop-blur-md 
            ${historyVisible ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'}`}>
            <div className="flex flex-col justify-start items-stretch">
                <div className="flex justify-end items-center m-4">
                    <svg fill="none" strokeWidth="1.5" stroke="currentColor" viewBox="0 0 24 24"
                         onClick={() => setHistoryVisible( !historyVisible)}
                         className={`ml-auto my-2 ${BaseStyles.ICON}`}
                         xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12"></path>
                    </svg>
                </div>
                <div className="grow overflow-scroll flex flex-col justify-start items-stretch" ref={containerRef}>
                    {conversationTopics.map((entry, index) => (
                        <div key={index}
                             className="flex flex-col my-1 p-3 rounded bg-gray-800 mx-auto w-[80%] hover:bg-gray-700 hover:cursor-pointer duration-200 transition-colors justify-start items-stretch"
                             onClick={() => {
                                 setConversationTopic(entry.topic);
                                 setHistoryVisible(false);
                                 setMessages(entry.messages.map(messageEntry => {
                                     return { message: messageEntry };
                                 }))
                             }}
                             {...CreateSequence('fadeIn', 700, 500 + 30 * index)}>
                            <span className="text-white text-sm font-sans">{entry.topic}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}