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
            className={`group hover:cursor-pointer transition-colors mx-1 duration-300 rounded-full border-transparent hover:bg-gray-200 dark:hover:bg-gray-900 hover:border-blue-500 border-solid border-[1px] flex items-center justify-start ${props.side === 'right' ? 'flex-row-reverse' : 'flex-row'} ${props.className ?? ''}`}>
        <span
            className="group-hover:max-w-[150px] select-none text-sm text-nowrap group-hover:px-2 group-hover:py-1 group-hover:opacity-100 opacity-0 rounded-xl max-w-[0px] transition-all duration-300 ease-in-out overflow-hidden group-hover:mx-0.5">
            {props.annotation}
        </span>
            <div
                className={'w-8 h-8 p-1 shrink-0 rounded-full transition-colors duration-300'}>
                {props.icon}
            </div>
        </div>
    )
}
