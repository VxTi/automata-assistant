/**
 * @fileoverview Button.tsx
 * @author Luca Warmenhoven
 * @date Created on Saturday, October 19 - 17:51
 */
import { ReactNode, RefObject } from "react";

export interface ButtonProps {
    className?: string;
    onClick?: () => void;
    ref?: RefObject<HTMLButtonElement>;
    children?: ReactNode;
    text?: string;
}

/**
 * A button component.
 * This component is used to display a button.
 * @param props the properties of the component.
 */
export function Button(props: ButtonProps) {
    return (
        <button
            ref={props.ref}
            onClick={props.onClick}
            className={`rounded-lg px-3 py-1 my-2 mx-1 content-container justify-center hoverable transition-colors duration-200 cursor-pointer hover:border-blue-500 ${props.className ?? ''}`}>
            {props.children}
            {props.text}
        </button>
    )
}
