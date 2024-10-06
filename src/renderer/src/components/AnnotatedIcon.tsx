/**
 * @fileoverview AnnotatedIcon.tsx
 * @author Luca Warmenhoven
 * @date Created on Saturday, October 05 - 12:50
 */

import { BaseStyles } from "../util/BaseStyles";

/**
 * The annotated icon.
 * This icon contains an annotation that will be displayed when hovered.
 * @param props The properties for the annotated icon
 */
export function AnnotatedIcon(props: {
    path: string,
    annotation: string,
    side: 'left' | 'right',
    onClick: (event?: any) => void,
    className?: string
}) {
    return (
        <div
            onClick={(event) => props.onClick(event)}
            className={`group flex items-center justify-start ${props.side === 'right' ? 'flex-row-reverse' : 'flex-row'} ${props.className ?? ''}`}>
        <span
            className="group-hover:max-w-[150px] text-white select-none text-sm text-nowrap group-hover:px-2 group-hover:py-1 group-hover:opacity-100 opacity-0 bg-stone-950 rounded-xl max-w-[0px] transition-all duration-500 ease-in-out overflow-hidden">
            {props.annotation}
        </span>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5}
                 className={BaseStyles.ICON_NO_HOVER + ' group-hover:bg-gray-600 transition-colors duration-300'}>
                <path strokeLinecap="round" strokeLinejoin="round" d={props.path}/>
            </svg>
        </div>
    )
}