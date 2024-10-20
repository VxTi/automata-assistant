/**
 * @fileoverview ConversationHistoryPage.tsx
 * @author Luca Warmenhoven
 * @date Created on Wednesday, October 16 - 12:08
 */
import { useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { ChatContext }                                                   from "./assistant/Conversation";
import { FadeIn, useAnimationSequence }                                  from "../util/AnimationSequence";
import { AnnotatedIcon }                                                 from "../components/AnnotatedIcon";
import { ConversationTopic }                                             from "../../../backend/ai/ChatCompletion";
import {
    Message
}                                                                        from "../../../backend/ai/ChatCompletionDefinitions";
import { AssistantPage }                                                 from "./assistant/AssistantPage";
import { ApplicationContext }                                            from "../contexts/ApplicationContext";
import { Icons }               from "../components/Icons";
import {
    FilterSelection
}                              from "../components/interactive/FilterSelection";
import { ScrollableContainer } from "../components/ScrollableContainer";
import { debounce }                                                      from "@renderer/util/Debounce";
import { SearchBar }                                                     from "@renderer/components/SearchBar";

export function ConversationHistoryPage() {

    const [ visibleTopics, setVisibleTopics ]           = useState<ConversationTopic[]>([]);
    const [ conversationTopics, setConversationTopics ] = useState<ConversationTopic[]>([]);

    const { setHeaderConfig } = useContext(ApplicationContext);

    const inputRef     = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useAnimationSequence({ containerRef: containerRef }, [ conversationTopics ]);

    /**
     * Load the conversation topics from the main process.
     */
    useEffect(() => {

        // Update header title
        setHeaderConfig(() => {
            return {
                pageTitle: 'Conversation History'
            }
        });

        // Acquire the conversation topics from the main process
        // and filter out any faulty topics.
        window[ 'conversations' ]
            .list()
            .then((topics: ConversationTopic[]) => {
                const orderedTopics = topics.sort((a, b) => b.date - a.date);
                setConversationTopics(orderedTopics);
                setVisibleTopics(orderedTopics);
            });
    }, []);

    /**
     * Filter the conversation topics based on the input value.
     * This function is debounced to prevent unnecessary filtering,
     * which makes it just a slight bit more efficient.
     */
    useEffect(() => {
        if ( !inputRef.current ) return;
        const input = inputRef.current;

        const handleKeydown = (event: KeyboardEvent) => {
            switch ( event.key ) {
                case 'Enter':
                    (document.querySelector('.conversation-topic:focus') as (HTMLElement | null))?.click();
                    break;
                case 'ArrowDown':
                    ((document.activeElement?.nextElementSibling as (HTMLElement | null)) ?? (
                        document.querySelector('.conversation-topic') as HTMLElement
                    )).focus();
                    break;
                case 'ArrowUp':
                    ((document.activeElement?.previousElementSibling as (HTMLElement | null)) ?? (
                        document.querySelector('.conversation-topic:last-of-type') as HTMLElement
                    )).focus();
                    break;
                case 'Escape':
                    (document.activeElement as (HTMLElement | null))?.blur();
                    break;
                default: // Prevent default behavior
                    return;
            }
            event.preventDefault();
            event.stopPropagation();
        }

        const handleInput = debounce(() => {
            const value = input.value.toLowerCase().trim();

            setVisibleTopics(
                value.length === 0 ?
                conversationTopics :
                conversationTopics
                    .filter(topic =>
                                topic.topic.toLowerCase().includes(value) ||
                                topic.messages.some((message: Message) =>
                                                        typeof message.content !== 'object' &&
                                                        (Array.isArray(message.content) ?
                                                         message.content.join(", ") : message.content!)
                                                            .toLowerCase()
                                                            .includes(value))
                    ));
        }, 300);

        window.addEventListener('keydown', handleKeydown);

        input.addEventListener('input', handleInput);
        return () => {
            input?.removeEventListener('input', handleInput);
            window.removeEventListener('keydown', handleKeydown);
        }
    }, [ conversationTopics ]);

    return (
        <div
            className={`transition-all duration-500 flex z-20 flex-col justify-start items-center max-w-screen-lg w-full grow`}>
            <div className="flex flex-row justify-start items-center w-[80%] mx-auto sticky top-0 z-30">
                <FilterSelection options={[
                    'All', 'Today', 'Yesterday', 'This week', 'This month', 'This year'
                ]}/>
                <SearchBar placeholder={'Search conversation topics'} elementRef={inputRef}/>
            </div>
            <ScrollableContainer blurEdges elementRef={containerRef} size='lg'>
                {conversationTopics.length === 0 ?
                 <span className="text-black text-center mt-5 text-md">No previous conversations found.</span> :
                 <div
                     className="flex flex-col justify-start z-30 items-stretch w-full py-14">
                     {
                         visibleTopics
                             .map((entry, index) =>
                                      <Topic key={index} topic={entry} index={index}/>)
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
            tabIndex={props.index + 1}
            className={`conversation-topic flex content-container hoverable transition-all duration-200 hover:cursor-pointer hover:border-blue-500 focus:border-blue-500 outline-none text-sm flex-row rounded mx-auto w-[80%] overflow-hidden justify-between items-center ${deleted ? 'max-h-0 overflow-hidden text-transparent p-0 m-0 border-0' : 'max-h-32 my-1 p-2 border-[1px]'}`}
            onClick={() => {
                if ( topicUUID === entry.uuid )
                    return;

                setContent(<AssistantPage conversationTopic={entry.topic} topicUUID={entry.uuid}
                                          messages={entry.messages}/>);
            }}
            {...FadeIn(1000, 20)}>
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

