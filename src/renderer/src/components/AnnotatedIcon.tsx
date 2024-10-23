/**
 * @fileoverview AnnotatedIcon.tsx
 * @author Luca Warmenhoven
 * @date Created on Saturday, October 05 - 12:50
 */

import { ReactNode } from "react";

/**
 * AnnotatedIcon component
 * This component is used to display an icon with an annotation on the side when hovered
 */
export function AnnotatedIcon(props: {
    icon: ReactNode,
    annotation: string,
    className?: string;
    side: 'left' | 'right',
    onClick: (event?: any) => void,
}) {
    return (
        <div
            onClick={(event) => props.onClick(event)}
            className={`group hover:cursor-pointer transition-colors m-1 duration-300 rounded-full border-transparent hover:bg-gray-200 dark:hover:bg-gray-900 hover-special-border border-solid border-[1px] flex items-center justify-start ${props.side === 'right' ? 'flex-row-reverse' : 'flex-row'} ${props.className ?? ''}`}>
        <span
            className="sm:group-hover:max-w-[150px] select-none text-xs text-nowrap sm:group-hover:px-1 group-hover:py-0.5 sm:group-hover:opacity-100 opacity-0 rounded-xl max-w-[0px] transition-all duration-300 ease-in-out overflow-hidden sm:group-hover:mx-0.5">
            {props.annotation}
        </span>
            <div
                className={'w-7 h-7 p-0.5 shrink-0 rounded-full transition-colors duration-300'}>
                {props.icon}
            </div>
        </div>
    )
}
