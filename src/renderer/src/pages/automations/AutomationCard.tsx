/**
 * @fileoverview AutomationCard.tsx
 * @author Luca Warmenhoven
 * @date Created on Saturday, October 05 - 13:36
 */

import { ApplicationContext } from "../../util/ApplicationContext";
import { useContext } from "react";
import { Automation } from "./Automations";
import { AutomationPageWrapper } from "./AutomationPageWrapper";

/**
 * The automation card.
 * This component is used to display an automation card.
 * @param props the properties of the component.
 */
export function AutomationCard(props: Automation)
{
    const { setContent } = useContext(ApplicationContext);
    return (
        <div
            className="group relative text-white flex m-1 p-2 flex-col justify-start items-center rounded-lg bg-gray-800"
            onClick={() => setContent(<AutomationPageWrapper automation={props} />)}>
            <div className="w-16 h-16 flex">{props.icon}</div>
            <p className="text-white text-md">{props.name}</p>
            <span
                className="absolute opacity-0 w-full h-full left-0 top-0 p-3 backdrop-blur-md backdrop-brightness-50 group-hover:cursor-pointer transition-all duration-500 group-hover:opacity-100 text-white text-sm">
                {props.description}
            </span>
        </div>
    )
}