/**
 * @fileoverview Switch.tsx
 * @author Luca Warmenhoven
 * @date Created on Friday, October 18 - 12:43
 */
import { RefObject, useState } from "react";

export function Switch(props: {
    ref?: RefObject<HTMLDivElement>,
    className?: string,
    onStateChange?: (newState: boolean) => void
}) {

    const [ active, setActive ] = useState<boolean>(false);

    return (
        <div className={`flex flex-row bg-[#1b1b1f] items-stretch p-1 justify-start w-16 h-8 rounded-full duration-300 transition-colors hover:cursor-pointer border-[1px] border-solid border-gray-600 hover:border-blue-600 ${props.className ?? ''}`}
             onClick={() => {
                 setActive( !active);
                 props.onStateChange?.call(null, !active);
             }}>
            <div className="bg-blue-600 rounded-full aspect-square"
            style={{
                transition: 'transform 0.3s',
                transform: `translateX(${active ? '125%' : '0%'})`
            }}></div>
        </div>
    )
}
