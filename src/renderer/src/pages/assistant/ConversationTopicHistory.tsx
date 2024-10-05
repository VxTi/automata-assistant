/**
 * @fileoverview ConversationTopicHistory.tsx
 * @author Luca Warmenhoven
 * @date Created on Friday, October 04 - 18:38
 */
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { ChatContext, ConversationTopic }                       from "./Conversation";
import { CreateSequence, useAnimationSequence }                 from "../../util/AnimationSequence";
import { BaseStyles }                                           from "../../util/BaseStyles";

/**
 * The conversation history wrapper.
 * This component is used to display the conversation history,
 * and allows the user to select a conversation topic to view.
 * @param props the properties of the component.
 */
export function ConversationHistoryContainer() {
    const [ conversationTopics, setConversationTopics ]
              = useState<ConversationTopic[]>([]);
    const {
              setMessages, historyVisible,
              setConversationTopic, setHistoryVisible
          }   = useContext(ChatContext);

    const inputRef     = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    useAnimationSequence({ containerRef: containerRef, intervalType: 'absolute' },
                         [ conversationTopics, historyVisible ]);

    /**
     * Debounce function for filtering the conversation topics.
     */
    const debounce = useCallback((func: Function, delay: number) => {
        let timeout: NodeJS.Timeout;
        return function (...args: any[]) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func(...args), delay);
        };
    }, []);

    /**
     * Load the conversation topics from the main process.
     */
    useEffect(() => {
        if ( !historyVisible )
            return;

        (window['api'] as any).getTopicHistory()
              .then((topics: ConversationTopic[]) => {
                  let finalizedTopics = topics;
                  // Fix faulty topic history.
                  if ( topics.some(topic => !('topic' in topic || 'date' in topic || 'messages' in topic)) ) {
                      finalizedTopics = topics.filter(topic => {
                          return 'topic' in topic && 'date' in topic && 'messages' in topic;
                      });

                      (window['api'] as any).saveTopicHistory(finalizedTopics);
                  }
                  setConversationTopics(finalizedTopics);
              });
    }, [ historyVisible ]);

    /**
     * Filter the conversation topics based on the input value.
     * This function is debounced to prevent unnecessary filtering,
     * which makes it just a slight bit more efficient.
     */
    useEffect(() => {
        if ( !inputRef.current )
            return;
        const initialTopics = conversationTopics;
        const input         = inputRef.current;

        const handleInput = debounce(() => {
            const value = input.value.toLowerCase().trim();
            if ( value === '' ) {
                setConversationTopics(initialTopics);
                return;
            }
            const filteredTopics = initialTopics.filter(topic => {
                return topic.topic.toLowerCase().includes(value) || topic.messages.some(message => {
                    return message.content.toLowerCase().includes(value);
                })
            });
            setConversationTopics(filteredTopics);
        }, 300);

        input.addEventListener('input', handleInput);
        return () => {
            input.removeEventListener('input', handleInput);
        }
    }, []);

    return (
        <div
            className={`absolute transition-all duration-300 flex z-20 flex-col transition-all justify-start items-stretch w-full h-full left-0 top-0 backdrop-blur-md 
            ${historyVisible ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'}`}>
            <div className="flex flex-col justify-start items-stretch">
                <div className="header-grid">
                    <div
                        className="bg-gray-800 col-start-2 col-end-3 flex items-center justify-start overflow-hidden text-white grow p-2 rounded-xl mx-4">
                        <svg fill="none" strokeWidth={1.5} stroke="currentColor" viewBox="0 0 24 24"
                             className="w-6 h-6 mr-2"
                             xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round"
                                  d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"></path>
                        </svg>
                        <input type="text" placeholder="Search conversation topics"
                               ref={inputRef}
                               className="bg-gray-800 col-start-2 col-end-3 focus:outline-none mx-1 px-1 text-white grow rounded-xl"/>
                    </div>
                    <svg fill="none" strokeWidth="1.5" stroke="currentColor" viewBox="0 0 24 24"
                         onClick={() => setHistoryVisible( !historyVisible)}
                         className={`my-2 ${BaseStyles.ICON}`}
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
                                 setMessages((_) => entry.messages.map(messageEntry => {
                                     return { message: messageEntry };
                                 }))
                             }}
                             {...CreateSequence('fadeIn', 700, 100 + 30 * index)}>
                            <span className="text-white text-sm font-sans">{entry.topic}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}