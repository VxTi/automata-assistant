/**
 * @fileoverview ChatMessage.tsx
 * @author Luca Warmenhoven
 * @date Created on Saturday, October 05 - 01:45
 */
import { mdParser }                                  from "./Conversation";
import { RefObject, useCallback, useMemo, useState } from "react";
import { CreateSequence }                            from "../../util/AnimationSequence";

import '../../styles/markdown.css'
import { Icons }                                     from "../../components/cosmetic/Icons";
import { Message }                                   from "../../../../backend/ai/ChatCompletionDefinitions";

/**
 * The chat message.
 * This component is used to display a chat message.
 * @param props the properties of the component.
 * @constructor
 */
export function ChatMessage(props: { entry: Message }) {

    const [ copiedToClipboard, setCopiedToClipboard ] = useState(false);

    const saveToClipboardCb = useCallback(async () => {
        setCopiedToClipboard(true);
        await navigator.clipboard.writeText(
            Array.isArray(props.entry.content) ?
            props.entry.content.join("\n") : props.entry.content);
        setTimeout(() => setCopiedToClipboard(false), 1000);
    }, []);

    const htmlContent = useMemo(() => {
        return mdParser.parse(
            Array.isArray(
                props.entry.content) ?
            props.entry.content.join('\n') :
            props.entry.content
        );
    }, [ props.entry ]);

    return (
        <div
            className="group flex flex-row justify-between items-start border-gray-200 bg-[#fbfafd] border-[1px] border-solid rounded-md py-2 px-4 my-1 w-full"
            {...CreateSequence('fadeIn', 300, 10)}>
            <div className="flex flex-col justify-center items-start text-wrap overflow-hidden">
                        <span
                            className="text-black font-bold font-sans text-md">{props.entry.role === 'user' ? 'You' : 'Assistant'}</span>
                <div className="not-prose text-black text-sm mt-2 mb-1 w-full">
                    <span className="markdown" dangerouslySetInnerHTML={{ __html: htmlContent }}/>
                </div>
            </div>
            <div onClick={saveToClipboardCb}
                 className="stroke-black fill-none rounded-full hover:cursor-pointer hover:bg-gray-200 duration-300 transition-colors">
                {copiedToClipboard ? <Icons.Checkmark/> : <Icons.Clipboard/>}
            </div>
        </div>
    )
}

/**
 * The live chat message.
 * This component is used to display a live chat message.
 * @param props the properties of the component.
 * @constructor
 */
export function LiveChatMessage(props: { contentRef: RefObject<HTMLDivElement>, active: boolean }) {
    if ( !props.active ) return null;

    return (
        <div
            className="group flex flex-row justify-between items-start bg-gray-300 rounded-md py-2 px-4 my-1 transition-all"
            {...CreateSequence('fadeIn', 300, 10)}>
            <div className="flex flex-col justify-center items-start overflow-x-scroll">
                        <span
                            className="text-black font-bold font-sans text-md">Assistant</span>
                <div className="not-prose text-black text-sm mt-2 mb-1">
                    <div ref={props.contentRef}/>
                </div>
            </div>
        </div>
    )
}
