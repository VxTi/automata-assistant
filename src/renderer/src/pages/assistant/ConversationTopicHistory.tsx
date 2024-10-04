/**
 * @fileoverview ConversationTopicHistory.tsx
 * @author Luca Warmenhoven
 * @date Created on Friday, October 04 - 18:38
 */
import { useContext, useEffect, useRef, useState } from "react";
import { ChatContext, ConversationTopic }          from "./Conversation";
import { CreateSequence, useAnimationSequence }    from "../../util/AnimationSequence";

/**
 * The chat history.
 * This history is used to display the chat messages.
 */
export function ConversationTopicHistory() {
    const [ conversationTopics, setConversationTopics ] = useState<ConversationTopic[]>([]);
    const { setMessages }                               = useContext(ChatContext);

    const containerRef = useRef<HTMLDivElement>(null);
    useAnimationSequence({ containerRef: containerRef, intervalType: 'absolute' }, [ conversationTopics ]);

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
        <div className="grow overflow-scroll flex flex-col justify-start items-stretch" ref={containerRef}>
            {conversationTopics.map((entry, index) => (
                <div key={index}
                     className="flex flex-col my-1 p-3 rounded bg-gray-800 mx-auto w-[80%] hover:bg-gray-700 hover:cursor-pointer duration-500 transition-colors justify-start items-stretch"
                     onClick={() =>
                         setMessages(entry.messages.map(messageEntry => {
                             return { message: messageEntry };
                         }))}
                     {...CreateSequence('fadeIn', 500, 20 * index)}
                >
                    <span className="text-white text-sm font-sans">
                    {entry.topic}
                    </span>
                </div>
            ))}
        </div>
    )
}