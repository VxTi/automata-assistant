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
        <div className={`flex flex-row bg-gray-200 items-stretch justify-start w-24 h-12 rounded-full border-[1px] border-solid border-gray-300 ${props.className ?? ''}`}
             onClick={() => {
                 setActive( !active);
                 props.onStateChange?.call(null, !active);
             }}>
            <div className="bg-blue-600 rounded-full m-1 aspect-square"
            style={{
                transition: 'transform 0.3s',
                transform: `translateX(${active ? '100%' : '0%'})`
            }}></div>
        </div>
    )
}
