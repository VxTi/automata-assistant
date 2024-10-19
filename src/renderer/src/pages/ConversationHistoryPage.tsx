/**
 * @fileoverview ConversationHistoryPage.tsx
 * @author Luca Warmenhoven
 * @date Created on Wednesday, October 16 - 12:08
 */
import { useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { ChatContext }                                                   from "./assistant/Conversation";
import { CreateSequence, useAnimationSequence } from "../util/AnimationSequence";
import { AnnotatedIcon }                        from "../components/AnnotatedIcon";
import { ConversationTopic }                    from "../../../backend/ai/ChatCompletion";
import {
    Message
}                                                                        from "../../../backend/ai/ChatCompletionDefinitions";
import { AssistantPage }                                                 from "./assistant/AssistantPage";
import { ApplicationContext }                                            from "../contexts/ApplicationContext";
import { Icons }               from "../components/Icons";
import { DropdownSelectable }  from "../components/DropdownSelectable";
import { ScrollableContainer } from "../components/ScrollableContainer";

export function ConversationHistoryPage() {
    const [ conversationTopics, setConversationTopics ]
              = useState<(ConversationTopic & { hidden: boolean })[]>([]);

    const { setHeaderConfig } = useContext(ApplicationContext);

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

        setHeaderConfig(() => {
            return {
                pageTitle: 'Conversation History'
            }
        });

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
                                                          typeof message.content !== 'object' &&
                                                          (Array.isArray(message.content) ? message.content.join(", ") : message.content!)
                                                              .toLowerCase()
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
            className={`transition-all duration-500 flex z-20 flex-col justify-start items-center max-w-screen-lg w-full grow`}>
            <div className="flex flex-row justify-start items-center w-[80%] mx-auto">
                <DropdownSelectable options={[
                    'All', 'Today', 'Yesterday', 'This week', 'This month', 'This year'
                ]}/>
                <div
                    className="content-container grow apply-stroke sticky top-0 col-start-2 z-50 col-end-3 flex items-center justify-start overflow-hidden py-2 px-3 rounded-lg ">
                    <Icons.MagnifyingGlass className="w-6 h-6 mr-2 fill-none"/>
                    <input type="text" placeholder="Search conversation topics" ref={inputRef}
                           className="bg-transparent col-start-2 placeholder:text-gray-500 col-end-3 focus:outline-none mx-1 px-1 grow rounded-xl"/>
                </div>
            </div>
            <ScrollableContainer blurEdges elementRef={containerRef} size='lg'>
                {conversationTopics.length === 0 ?
                 <span className="text-black text-center mt-5 text-md">No previous conversations found.</span> :
                 <div
                     className="flex flex-col justify-start z-30 items-stretch w-full py-14">
                     {
                         conversationTopics
                             .map((entry, index) =>
                                      ( !entry.hidden && <Topic key={index} topic={entry} index={index}/>))
                     }
                 </div>
                }
            </ScrollableContainer>
        </div>
    )
}

/**
 * The conversation topic component.
 * This component is used to display a conversation topic.
 * @param props the properties of the component.
 */
function Topic(props: { topic: ConversationTopic, index: number }) {
    const { topicUUID }           = useContext(ChatContext);
    const { setContent }          = useContext(ApplicationContext);
    const { topic: entry }        = props;
    const [ deleted, setDeleted ] = useState(false);

    // Removes a conversation topic from the conversation directory,
    // and forces an update to refresh the conversation history.
    const deleteTopic = useCallback(async (event: Event) => {
        event.stopPropagation();
        await window[ 'conversations' ].delete(entry.uuid);
        setDeleted(true);
    }, []);

    const topicDateString = useMemo(() => {
        const date = new Date(entry.date);
        return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()} ${date.getHours()}:${date.getUTCMinutes() < 10 ? '0' + date.getUTCMinutes() : date.getUTCMinutes()}`;
    }, [ entry.date ]);

    return (
        <div
            className={`flex bg-[#fafbfd] dark:bg-[#1b1b1f] border-[rgba(0,0,0,0.2)] border-[#3c3f44] border-solid hover:bg-gray-200 dark:hover:bg-gray-900 transition-colors duration-200 hover:cursor-pointer hover:border-blue-500 text-sm flex-row rounded mx-auto w-[80%] overflow-hidden justify-between items-center ${deleted ? 'max-h-0 overflow-hidden text-transparent p-0 m-0 border-0' : 'max-h-32 my-1 p-2 border-[1px]'}`}
            onClick={() => {
                if ( topicUUID === entry.uuid )
                    return;

                setContent(<AssistantPage conversationTopic={entry.topic} topicUUID={entry.uuid}
                                          messages={entry.messages}/>);
            }}
            {...CreateSequence('fadeIn', 700, 30 * props.index)}>
            <span className="font-sans">{entry.topic}</span>
            <div className="flex flex-row justify-end items-center">
                <span>{topicDateString}</span>
                <AnnotatedIcon
                    icon={<Icons.TrashBin/>}
                    annotation="Delete topic"
                    side='left'
                    onClick={(e) => deleteTopic(e)}/>
            </div>
        </div>
    )
}

