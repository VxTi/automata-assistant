/**
 * @fileoverview FilterButton.tsx
 * @author Luca Warmenhoven
 * @date Created on Thursday, October 17 - 23:17
 */
import { useState } from "react";
import { Icons }    from "./Icons";

export function FilterButton(props: { options: string[], onClick?: (value: string) => void }) {
    const [ ascending, setAscending ]     = useState(false);
    const [ selectedIdx, setSelectedIdx ] = useState<number>(0);

    return (
        <div
            className="relative m-1 content-container rounded-lg aspect-square w-8 stroke-black fill-none group active:ring-2 active:ring-blue-300"
            onClick={() => setAscending( !ascending)}>
            <Icons.ChevronUpDown />
            <div
                className="absolute rounded-lg z-[100] top-full left-0 opacity-0 pointer-events-none group-hover:bg-white dark:group-hover:bg-[#161b22] group-hover:shadow-lg group-hover:pointer-events-auto group-hover:opacity-100 transition-all duration-300 content-container p-1 flex flex-col justify-start items-stretch">
                {
                    props.options.map((option, i) => (
                        <div key={i}
                             className={`flex flex-row text-nowrap hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer transition-colors duration-200 justify-start items-center rounded-sm px-5 py-1 ${selectedIdx === i ? 'bg-gray-200 dark:bg-gray-700' : ''}`}
                             onClick={() => {
                                 props.onClick?.call(null, option);
                                 setSelectedIdx(i);
                             }}>
                            <span>{option}{ selectedIdx === i ? (ascending ? ' (ascending)' : ' (descending)') : ''}</span>
                        </div>
                    ))
                }
            </div>
        </div>
    )
}
