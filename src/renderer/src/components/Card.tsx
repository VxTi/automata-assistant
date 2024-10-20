/**
 * @fileoverview Card.tsx
 * @author Luca Warmenhoven
 * @date Created on Saturday, October 19 - 18:10
 */
import { BasicElementProps } from "../util/BasicElementProps";

/**
 * A card component.
 * This component is used to display a card.
 * @param props the properties of the component.
 */
export function Card(props: BasicElementProps) {
    return (
        <div className={`content-container m-1 p-2 flex-col justify-start items-center rounded-lg ${props.className}`}>
            {props.children}
        </div>
    )
}
