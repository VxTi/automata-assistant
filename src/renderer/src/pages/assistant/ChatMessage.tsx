/**
 * @fileoverview ChatMessage.tsx
 * @author Luca Warmenhoven
 * @date Created on Saturday, October 05 - 01:45
 */
import { ChatContextMessageType } from "./Conversation";
import { BaseStyles }             from "../../util/BaseStyles";
import { useCallback, useState }  from "react";
import { CreateSequence }         from "../../util/AnimationSequence";

/**
 * The chat message.
 * This component is used to display a chat message.
 * @param props the properties of the component.
 * @constructor
 */
export function ChatMessage(props: { entry: ChatContextMessageType }) {

    const [ copiedToClipboard, setCopiedToClipboard ] = useState(false);

    const handleClick = useCallback(async () => {
        setCopiedToClipboard(true);
        await navigator.clipboard.writeText(props.entry.message.content);
        setTimeout(() => setCopiedToClipboard(false), 1000);
    }, []);

    return (
        <div className="group flex flex-row justify-between items-start bg-gray-800 rounded-md py-2 px-4 my-1"
             {...CreateSequence('fadeIn', 300, 10)}>
            <div className="flex flex-col justify-center items-start">
                        <span
                            className="text-white font-bold font-sans text-md">{props.entry.message.role === 'user' ? 'You' : 'Assistant'}</span>
                <div className="text-white font-helvetica-neue text-sm mt-2 mb-1">
                    <span>{props.entry.message.content}</span>
                </div>
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5}
                 onClick={handleClick}
                 className={BaseStyles.ICON + ' opacity-0 group-hover:opacity-100 transition-all duration-300'}>
                <path strokeLinecap="round" strokeLinejoin="round"
                      className="transition-all duration-300"
                      d={ copiedToClipboard ? "m4.5 12.75 6 6 9-13.5" : "M8.25 7.5V6.108c0-1.135.845-2.098 1.976-2.192.373-.03.748-.057" +
                          " 1.123-.08M15.75" +
                          " 18H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08M15.75 18.75v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5A3.375 3.375 0 0 0 6.375 7.5H5.25m11.9-3.664A2.251 2.251 0 0 0 15 2.25h-1.5a2.251 2.251 0 0 0-2.15 1.586m5.8 0c.065.21.1.433.1.664v.75h-6V4.5c0-.231.035-.454.1-.664M6.75 7.5H4.875c-.621 0-1.125.504-1.125 1.125v12c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V16.5a9 9 0 0 0-9-9Z"}/>
            </svg>
        </div>
    )
}