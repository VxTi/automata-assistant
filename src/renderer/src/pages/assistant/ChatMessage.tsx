/**
 * @fileoverview ChatMessage.tsx
 * @author Luca Warmenhoven
 * @date Created on Saturday, October 05 - 01:45
 */
import { RefObject, useCallback, useEffect, useRef, useState } from "react";
import { CreateSequence }                                      from "../../util/AnimationSequence";

import { Icons }   from "../../components/Icons";
import { Message } from "../../../../backend/ai/ChatCompletionDefinitions";
import renderMathInElement from "katex/contrib/auto-render";
import { mdParser }        from "./Conversation";
import '../../styles/markdown.css'
import 'katex/dist/katex.min.css'
/**
 * The chat message.
 * This component is used to display a chat message.
 * @param props the properties of the component.
 * @constructor
 */
export function ChatMessage(props: { entry: Message }) {

    const [ copiedToClipboard, setCopiedToClipboard ] = useState(false);

    const saveToClipboardCb = useCallback(async () => {
        if ( typeof props.entry.content === 'object' && !Array.isArray(props.entry.content) )
            return;

        setCopiedToClipboard(true);
        await navigator.clipboard.writeText(Array.isArray(props.entry.content) ? props.entry.content.join("\n") : props.entry.content);

        setTimeout(() => setCopiedToClipboard(false), 1000);
    }, []);

    const contentRef = useRef<HTMLSpanElement>(null);

    useEffect(() => {
        if ( !contentRef.current ) return;

        renderMathInElement(contentRef.current, {
            delimiters: [
                { left: '[', right: ']', display: true },
                { left: '$$', right: '$$', display: true },
                { left: '$', right: '$', display: true }
            ],
            output: 'html',
            throwOnError: false
        });

        if ( !(typeof props.entry.content === 'object' && !Array.isArray(props.entry.content)) )
            contentRef.current.innerHTML = mdParser.parse(Array.isArray(props.entry.content) ? props.entry.content.join("\n") : props.entry.content) as string


    }, [ contentRef ]);

    return (
        <div
            className="group shadow-sm flex-row justify-between items-start content-container rounded-md py-2 px-4 m-1"
            {...CreateSequence('fadeIn', 300, 10)}>
            <div className="flex flex-col justify-center items-start text-wrap overflow-hidden">
                        <span
                            className="font-bold font-sans text-md">{props.entry.role === 'user' ? 'You' : 'Assistant'}</span>
                <div className="not-prose text-sm mt-2 mb-1 w-full">
                    <span className="markdown" ref={contentRef}/>
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
            className="group flex flex-row justify-between items-start content-container rounded-md py-2 px-4 my-1 transition-all"
            {...CreateSequence('fadeIn', 300, 10)}>
            <div className="flex flex-col justify-center items-start overflow-x-scroll">
                        <span
                            className="font-bold font-sans text-md">Assistant</span>
                <div className="not-prose text-sm mt-2 mb-1">
                    <div ref={props.contentRef}/>
                </div>
            </div>
        </div>
    )
}
