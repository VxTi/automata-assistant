/**
 * @fileoverview DropdownSelectable.tsx
 * @author Luca Warmenhoven
 * @date Created on Thursday, October 17 - 23:17
 */
import { useState } from "react";
import { Icons }    from "../Icons";

export function DropdownSelectable(props: { options: string[], onClick?: (value: string, index: number) => void }) {

    const [ selectedIdx, setSelectedIdx ] = useState<number>(0);

    return (
        <div
            className="relative p-1.5 mx-1 content-container rounded-lg aspect-square h-full stroke-black fill-none group">
            <Icons.ChevronUpDown/>
            <div
                className="absolute rounded-lg z-[100] top-full left-0 opacity-0 pointer-events-none group-hover:bg-white dark:group-hover:bg-[#1b1b1f] group-hover:shadow-lg group-hover:pointer-events-auto group-hover:opacity-100 transition-all duration-300 content-container p-1 flex flex-col justify-start items-stretch">
                {
                    props.options.map((option, i) => (
                        <div key={i}
                             className={`flex flex-row text-nowrap hover:bg-gray-200 dark:hover:bg-gray-800 cursor-pointer transition-colors duration-200 justify-start items-center rounded-md px-5 py-1 my-0.5 border-[1px] border-solid ${selectedIdx === i ? 'bg-gray-200 dark:bg-gray-800 border-blue-500' : 'border-transparent'}`}
                             onClick={() => {
                                 props.onClick?.call(null, option, i);
                                 setSelectedIdx(i);
                             }}>
                            <span
                                className="select-none">{option}</span>
                        </div>
                    ))
                }
            </div>
        </div>
    )
}
