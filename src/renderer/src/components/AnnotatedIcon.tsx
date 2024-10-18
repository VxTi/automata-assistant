/**
 * @fileoverview AnnotatedIcon.tsx
 * @author Luca Warmenhoven
 * @date Created on Saturday, October 05 - 12:50
 */

import { ReactNode } from "react";

/**
 * The annotated icon.
 * This icon contains an annotation that will be displayed when hovered.
 * @param props The properties for the annotated icon
 */
export function AnnotatedIcon(props: {
    path: string | string[],
    annotation: string,
    side: 'left' | 'right',
    onClick: (event?: any) => void,
    className?: string
}) {
    return (
        <div
            onClick={(event) => props.onClick(event)}
            className={`group hover:cursor-pointer flex items-center justify-start ${props.side === 'right' ? 'flex-row-reverse' : 'flex-row'} ${props.className ?? ''}`}>
        <span
            className="group-hover:max-w-[150px] select-none text-sm text-nowrap group-hover:px-2 group-hover:py-1 group-hover:opacity-100 opacity-0 bg-gray-200 rounded-xl max-w-[0px] transition-all duration-500 ease-in-out overflow-hidden group-hover:mx-0.5">
            {props.annotation}
        </span>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5}
                 className={'w-8 h-8 my-2 mx-1 p-1 shrink-0 rounded-full group-hover:bg-gray-200 dark:group-hover:bg-gray-700' +
                     ' transition-colors duration-300'}>
                {Array.isArray(props.path) ?
                 props.path.map((path, i) =>
                                    <path key={i} strokeLinecap="round" strokeLinejoin="round" d={path}/>) :
                 <path strokeLinecap="round" strokeLinejoin="round" d={props.path}/>}
            </svg>
        </div>
    )
}

export function TemporaryAnnotatedIcon(props: {
    icon: ReactNode,
    annotation: string,
    className?: string;
    side: 'left' | 'right',
    onClick: (event?: any) => void,
}) {
    return (
        <div
            onClick={(event) => props.onClick(event)}
            className={`group hover:cursor-pointer flex items-center justify-start ${props.side === 'right' ? 'flex-row-reverse' : 'flex-row'} ${props.className ?? ''}`}>
        <span
            className="group-hover:max-w-[150px] select-none text-sm text-nowrap group-hover:px-2 group-hover:py-1 group-hover:opacity-100 opacity-0 bg-gray-200 dark:bg-gray-800 rounded-xl max-w-[0px] transition-all duration-500 ease-in-out overflow-hidden group-hover:mx-0.5">
            {props.annotation}
        </span>
            <div
                className={'w-8 h-8 my-2 mx-1 p-1 shrink-0 rounded-full group-hover:bg-gray-200 dark:group-hover:bg-gray-700' +
                    ' transition-colors duration-300'}>
                {props.icon}
            </div>
        </div>
    )
}
