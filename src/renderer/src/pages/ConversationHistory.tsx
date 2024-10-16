/**
 * @fileoverview ConversationHistory.tsx
 * @author Luca Warmenhoven
 * @date Created on Wednesday, October 16 - 12:08
 */
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { ChatContext }                                          from "./assistant/Conversation";
import { CreateSequence, useAnimationSequence }                 from "../util/AnimationSequence";
import { AnnotatedIcon }                                        from "../components/AnnotatedIcon";
import { ConversationTopic }                                    from "../../../backend/ai/ChatCompletion";
import { Message }                                              from "../../../backend/ai/ChatCompletionDefinitions";

export function ConversationHistory() {
    const [ conversationTopics, setConversationTopics ]
              = useState<(ConversationTopic & { hidden: boolean })[]>([]);

    const inputRef     = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    useAnimationSequence({ containerRef: containerRef, intervalType: 'absolute' },
                         [ conversationTopics ]);

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

        // Acquire the conversation topics from the main process
        // and filter out any faulty topics.
        window[ 'conversations' ]
            .list()
            .then((topics: ConversationTopic[]) =>
                      setConversationTopics(
                          topics
                              .map(topic => {
                                  return { ...topic, hidden: false };
                              })
                              .sort((a, b) =>
                                        b.date - a.date)));
    }, []);

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
                                  topic.messages.some((message: Message) =>
                                                          (Array.isArray(message.content) ? message.content.join(", ") : message.content!).toLowerCase()
                                                                                                                                          .includes(value)
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
            className={`transition-all duration-500 flex z-20 flex-col justify-start items-stretch w-full h-full`}>
            <div className="flex flex-row justify-center items-start w-full">
                <div className="flex flex-col justify-start grow items-stretch max-w-screen-md">
                    <h3 className="text-black text-center text-2xl mt-5">Conversation history</h3>
                    <div className="header-grid">
                        <div
                            className="bg-gray-200 col-start-2 col-end-3 flex items-center justify-start overflow-hidden text-black grow py-2 px-3 rounded-xl mx-2">
                            <svg fill="none" strokeWidth={1.5} stroke="currentColor" viewBox="0 0 24 24"
                                 className="w-6 h-6 mr-2"
                                 xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round"
                                      d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"></path>
                            </svg>
                            <input type="text" placeholder="Search conversation topics" ref={inputRef}
                                   className="bg-transparent col-start-2 placeholder:text-gray-400 col-end-3 focus:outline-none mx-1 px-1 text-black grow rounded-xl"/>
                        </div>
                    </div>
                    <div
                        className="grow relative overflow-scroll flex flex-col justify-start items-stretch min-h-[80vh]"
                        ref={containerRef}>
                        {conversationTopics.length === 0 ?
                         <span className="text-black text-center mt-5 text-md">No previous conversations found.</span> :
                         <div
                             className="flex flex-col justify-start z-30 items-stretch overflow-y-scroll left-0 top-0 w-full mt-4 absolute">
                             {conversationTopics
                                 .map((entry, index) =>
                                          ( !entry.hidden && <Topic key={index} topic={entry} index={index}/>))
                             }
                         </div>
                        }
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
function Topic(props: { topic: ConversationTopic, index: number }) {
    const {
              setConversationTopic, setMessages, setTopicUUID, topicUUID
          }                       = useContext(ChatContext);
    const { topic: entry }        = props;
    const [ deleted, setDeleted ] = useState(false);

    // Removes a conversation topic from the conversation directory,
    // and forces an update to refresh the conversation history.
    const deleteTopic = useCallback(async (event: Event) => {
        event.stopPropagation();
        await window[ 'conversations' ].delete(entry.uuid);
        setDeleted(true);
    }, []);

    // Load the conversation topic into the chat context.
    const loadTopic       = useCallback(() => {
        // If the topic is already loaded, do not reload it.
        if ( topicUUID === entry.uuid )
            return;
        setConversationTopic(entry.topic);
        setTopicUUID(entry.uuid);
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
            className={`flex flex-row rounded bg-black mx-auto w-[80%] overflow-hidden border-solid border-gray-800 hover:bg-gray-900 hover:cursor-pointer duration-200 transition-all justify-between items-center ${deleted ? 'max-h-0 overflow-hidden text-transparent p-0 m-0 border-0' : 'max-h-32 my-1 p-2 border-[1px]'}`}
            onClick={loadTopic}
            {...CreateSequence('fadeIn', 700, 30 * props.index)}>
            <span className="text-white text-sm font-sans">{entry.topic}</span>
            <div className="flex flex-row justify-end items-center">
                <span className="text-sm text-white">{topicDateString}</span>
                <AnnotatedIcon
                    className="opacity-20 hover:opacity-100 duration-200 transition-opacity"
                    path="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                    annotation="Delete topic" side='left' onClick={(e) => deleteTopic(e)}/>
            </div>
        </div>
    )
}

