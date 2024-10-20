/**
 * @fileoverview BasicElementProps.ts
 * @author Luca Warmenhoven
 * @date Created on Saturday, October 19 - 18:10
 */
import { CSSProperties, ReactNode, RefObject } from "react";

export interface BasicElementProps {
    onClick?: () => void;
    className?: string;
    style?: CSSProperties;
    children?: ReactNode;
    id?: string;
    ref?: RefObject<any>;
}
