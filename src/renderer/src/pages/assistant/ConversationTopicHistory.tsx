/**
 * @fileoverview ConversationTopicHistory.tsx
 * @author Luca Warmenhoven
 * @date Created on Friday, October 04 - 18:38
 */
import { Dispatch, SetStateAction, useCallback, useContext, useEffect, useRef, useState } from "react";
import {
    CreateSequence,
    useAnimationSequence
}                                                                                         from "../../util/AnimationSequence";
import { BaseStyles }                                                                     from "../../util/BaseStyles";
import {
    AnnotatedIcon
}                                                                                         from "../../components/AnnotatedIcon";
import {
    CompletionMessage,
    ConversationTopic
}                                                                                         from "../../../../../declarations";
import { ChatContext }                                                                    from "./Conversation";

/**
 * The conversation history wrapper.
 * This component is used to display the conversation history,
 * and allows the user to select a conversation topic to view.
 * @param props the properties of the component.
 */
export function ConversationHistoryContainer() {
    const [ conversationTopics, setConversationTopics ]
              = useState<(ConversationTopic & { hidden: boolean })[]>([]);
    const {
              historyVisible, setHistoryVisible
          }   = useContext(ChatContext);

    const [ _, forceUpdate ] = useState(0);
    const inputRef           = useRef<HTMLInputElement>(null);
    const containerRef       = useRef<HTMLDivElement>(null);
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

        // Acquire the conversation topics from the main process
        // and filter out any faulty topics.
        (window[ 'api' ] as any)
            .conversations.list()
            .then((topics: ConversationTopic[]) => setConversationTopics(topics.map(topic => {
                return { ...topic, hidden: false };
            })));
    }, [ historyVisible ]);

    /**
     * Filter the conversation topics based on the input value.
     * This function is debounced to prevent unnecessary filtering,
     * which makes it just a slight bit more efficient.
     */
    useEffect(() => {
        if ( !inputRef.current )
            return;
        const input = inputRef.current;

        const handleInput = debounce(() => {
            const value = input.value.toLowerCase().trim();

            const updatedTopics =
                      value.length === 0 ?
                      (conversationTopics.map(topic => {
                          return { ...topic, hidden: false };
                      })) :
                      (conversationTopics.map(topic => {
                          return {
                              ...topic,
                              hidden: !(topic.topic.toLowerCase().includes(value) ||
                                  topic.messages.some((message: CompletionMessage) =>
                                                          message.content.toLowerCase().includes(value)
                                  ))
                          };
                      }));
            setConversationTopics(updatedTopics);
        }, 300);

        input.addEventListener('input', handleInput);
        return () => {
            input.removeEventListener('input', handleInput);
        }
    }, [ conversationTopics ]);

    return (
        <div
            className={`absolute transition-all duration-500 flex z-20 flex-col justify-start items-stretch w-full h-full left-0 top-0 backdrop-blur-md backdrop-brightness-50 ${historyVisible ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'}`}>
            <div className="flex flex-row justify-center items-start w-full">
                <div className="flex flex-col justify-start grow items-stretch max-w-screen-md">
                    <h3 className="text-white text-center text-2xl font-helvetica-neue mt-5">Conversation history</h3>
                    <div className="header-grid">
                        <div
                            className="bg-gray-800 col-start-2 col-end-3 flex items-center justify-start overflow-hidden text-white grow p-2 rounded-xl mx-4">
                            <svg fill="none" strokeWidth={1.5} stroke="currentColor" viewBox="0 0 24 24"
                                 className="w-6 h-6 mr-2"
                                 xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round"
                                      d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"></path>
                            </svg>
                            <input type="text" placeholder="Search conversation topics" ref={inputRef}
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
                        {conversationTopics.length === 0 ?
                         <span className="text-white text-center mt-5 text-md font-helvetica-neue">No previous conversations found.</span> :
                         conversationTopics.sort((a, b) => b.date - a.date)
                                           .map(
                                               (entry, index) =>
                                                   ( !entry.hidden && <Topic key={index} topic={entry} index={index}
                                                                             forceUpdate={forceUpdate}/>))}
                    </div>
                </div>
            </div>
        </div>
    )
}

/**
 * The conversation topic component.
 * This component is used to display a conversation topic.
 * @param props the properties of the component.
 */
function Topic(props: { topic: ConversationTopic, index: number, forceUpdate: Dispatch<SetStateAction<any>> }) {
    const {
              setConversationTopic, setMessages,
              setHistoryVisible, setTopicUUID,
              topicUUID
          }                = useContext(ChatContext);
    const { topic: entry } = props;

    // Removes a conversation topic from the conversation directory,
    // and forces an update to refresh the conversation history.
    const deleteTopic = useCallback(async (event: Event) => {
        event.stopPropagation();
        await (window[ 'api' ] as any).conversations.delete(entry.uuid);
        props.forceUpdate(Math.random());
    }, []);

    // Load the conversation topic into the chat context.
    const loadTopic       = useCallback(() => {
        // If the topic is already loaded, do not reload it.
        if ( topicUUID === entry.uuid )
            return;
        setConversationTopic(entry.topic);
        setTopicUUID(entry.uuid);
        setHistoryVisible(false);
        setMessages((_) => entry.messages.map(messageEntry => {
            return { message: messageEntry };
        }))
    }, []);
    const topicDateString = (() => {
        const date = new Date(entry.date);
        return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()} ${date.getHours()}:${date.getUTCMinutes() < 10 ? '0' + date.getUTCMinutes() : date.getUTCMinutes()}`;
    })();

    return (
        <div
            className="flex flex-row my-1 p-2 rounded bg-gray-800 mx-auto w-[80%] hover:bg-gray-700 hover:cursor-pointer duration-200 transition-colors justify-between items-center"
            onClick={loadTopic}
            {...CreateSequence('fadeIn', 700, 30 * props.index)}>
            <span className="text-white text-sm font-sans">{entry.topic}</span>
            <div className="flex flex-row justify-end items-center">
                <span className="text-sm text-white font-helvetica-neue">{topicDateString}</span>
                <AnnotatedIcon
                    className="opacity-20 hover:opacity-100 duration-200 transition-opacity"
                    path="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                    annotation="Delete topic" side='left' onClick={(e) => deleteTopic(e)}/>
            </div>
        </div>
    )
}
