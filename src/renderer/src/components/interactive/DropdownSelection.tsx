/**
 * @fileoverview DropdownSelection.tsx
 * @author Luca Warmenhoven
 * @date Created on Sunday, October 20 - 17:07
 */
import { useEffect, useRef, useState } from "react";
import { Icons }                       from "@renderer/components/Icons";


export function DropdownSelection(props: {
    options: string[],
    currentValue: number,
    onChange?: (value: string, index: number) => void
}) {
    const [ selectedIdx, setSelectedIdx ] = useState<number>(props.currentValue ?? 0);
    const [ expanded, setExpanded ]       = useState<boolean>(false);

    const valuesContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!valuesContainerRef.current) return;

        const dimensions = valuesContainerRef.current.getBoundingClientRect();

        if (dimensions.bottom > window.innerHeight) {
            valuesContainerRef.current.style.transform = `translateY(-${dimensions.height}px)`;
        }

        if (dimensions.right > window.innerWidth - 10) {
            valuesContainerRef.current.style.transform = `translateX(-${dimensions.width}px)`;
        }

        const handleClick = (e: MouseEvent) => {
            if (!valuesContainerRef.current) return;

            if (!e.composedPath().includes(valuesContainerRef.current)) {
                setExpanded(false);
            }
        }

        window.addEventListener('click', handleClick);

        return () => {
            window.removeEventListener('click', handleClick);
        }

    }, [ valuesContainerRef])

    return (
        <div className="relative" ref={valuesContainerRef}>
            <div
                className={`absolute rounded-lg top-0 left-0 transition-all duration-300 content-container p-1 flex flex-col justify-start items-stretch max-h-64 overflow-y-scroll ${!expanded ? 'hidden' : 'z-[120]'}`}>
                {
                    props.options.map((option, i) => (
                        <div key={i}
                             className={`flex flex-row text-nowrap hover:bg-gray-200 dark:hover:bg-gray-800 cursor-pointer transition-colors duration-200 justify-start items-center rounded-md px-5 py-1 my-0.5 border-[1px] border-solid ${selectedIdx === i ? 'bg-gray-200 dark:bg-gray-800 border-blue-500' : 'border-transparent'}`}
                             onClick={() => {
                                 props.onChange?.call(null, option, i);
                                 setSelectedIdx(i);
                                 setExpanded(false);
                             }}>
                            <span
                                className="select-none">{option}</span>
                        </div>
                    ))
                }
            </div>
            <div
                onClick={() => setExpanded( !expanded)}
                className="relative mx-1 cursor-pointer z-auto content-container rounded-lg h-full stroke-black fill-none group flex flex-row items-center pr-2">
                <div className="w-8 h-8 p-1 mr-1">
                    <Icons.ChevronUpDown/>
                </div>
                <span className="select-none">{props.options[ selectedIdx ]}</span>
            </div>
        </div>

    )
}
