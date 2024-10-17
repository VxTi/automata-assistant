/**
 * @fileoverview FilterButton.tsx
 * @author Luca Warmenhoven
 * @date Created on Thursday, October 17 - 23:17
 */
import { useState } from "react";
import { Icons }    from "../cosmetic/Icons";

export interface FilterOption {
    title: string;
    onClick: () => void;
}

export function FilterButton(props: { options: FilterOption[] }) {
    const [ ascending, setAscending ] = useState(false);
    return (
        <div className="relative rounded-lg w-8 h-8 bg-[#fbfafd] border-[1px] border-solid border-gray-100 stroke-black fill-none group"
             onClick={() => setAscending( !ascending)}>
                {ascending ? <Icons.BarsArrowDown/> : <Icons.BarsArrowUp/>}
            <div
                className="absolute rounded-lg z-50 top-full left-0 opacity-0 pointer-events-none group-hover:bg-white group-hover:shadow-lg group-hover:pointer-events-auto group-hover:opacity-100 transition-all duration-300 border-[1px] border-solid border-gray-100 p-2 flex flex-col justify-start items-stretch">
                {
                    props.options.map((option, i) => (
                        <div key={i} className="flex flex-row text-nowrap hover:bg-gray-200 cursor-pointer transition-colors duration-300 justify-start items-center" onClick={option.onClick}>
                            <span>{option.title}</span>
                        </div>
                    ))
                }
            </div>
        </div>
    )
}
