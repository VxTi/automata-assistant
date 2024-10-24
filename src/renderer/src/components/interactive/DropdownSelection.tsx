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

    const mainContainerRef   = useRef<HTMLDivElement>(null);
    const valuesContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if ( !valuesContainerRef.current || !mainContainerRef.current ) return;

        if ( expanded && valuesContainerRef.current!.style.transform === '' ) {
            const dimensions               = valuesContainerRef.current.getBoundingClientRect();
            let [ transformX, transformY ] = [ 0, 0 ];

            if ( dimensions.bottom > window.innerHeight - 20 ) {
                transformY = (window.innerHeight - dimensions.bottom) - 30;
            }

            if ( dimensions.right > window.innerWidth - 20 ) {
                transformX = (window.innerWidth - dimensions.right) - 30;
            }

            valuesContainerRef.current.style.transform = `translate(${transformX}px, ${transformY}px)`;
        }
        const handleClick = (e: MouseEvent) => {
            if ( !valuesContainerRef.current ) return;

            if ( !e.composedPath().includes(valuesContainerRef.current) &&
                !e.composedPath().includes(valuesContainerRef.current.parentElement!) ) {
                setExpanded(false);
            }
        }

        window.addEventListener('click', handleClick);

        return () => {
            window.removeEventListener('click', handleClick);
        }

    }, [ valuesContainerRef, expanded ])

    return (
        <div
            ref={mainContainerRef}
            onClick={() => setExpanded( !expanded)}
            className="relative mx-1 cursor-pointer content-container hoverable transition-colors duration-300 rounded-lg h-full fill-none group flex flex-row items-center pr-2 w-fit">
            <div className="w-8 h-8 p-1 mr-1">
                <Icons.ChevronUpDown/>
            </div>
            <span className="select-none">{props.options[ selectedIdx ]}</span>
            <div
                className={`absolute left-0 overflow-visible no-scrollbar rounded-lg top-0 transition-all duration-300 content-container p-1 flex flex-col justify-start items-stretch max-h-64 overflow-y-scroll ${!expanded ? 'hidden' : ''}`}
                ref={valuesContainerRef}>
                <div className="relative flex flex-col justify-start items-stretch w-max z-40">
                {
                    props.options.map((option, i) => (
                        <div key={i}
                             className={`z-40 flex flex-row text-nowrap hover:bg-gray-200 dark:hover:bg-gray-800 cursor-pointer transition-colors duration-200 justify-start items-center rounded-md px-5 py-1 my-0.5 border-[1px] border-solid ${selectedIdx === i ? 'bg-gray-200 dark:bg-gray-800 border-blue-500' : 'border-transparent'}`}
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
            </div>
        </div>
    )
}
