/**
 * @fileoverview ChatMessage.tsx
 * @author Luca Warmenhoven
 * @date Created on Saturday, October 05 - 01:45
 */
import { CompletionMessage } from "../../util/Model";

/**
 * The chat message.
 * This component is used to display a chat message.
 * @param props the properties of the component.
 * @constructor
 */
export function ChatMessage(props: { message: CompletionMessage }) {
    return (
        <div className="flex flex-row justify-start items-start bg-gray-800 rounded-md py-2 px-4 my-1">
            <div className="flex flex-col justify-center items-start">
                        <span
                            className="text-white font-bold font-sans text-md">{props.message.role === 'user' ? 'You' : 'Assistant'}</span>
                <div className="text-white font-helvetica-neue text-sm mt-2 mb-1">
                    <span>{props.message.content}</span>
                </div>
            </div>
        </div>
    )
}