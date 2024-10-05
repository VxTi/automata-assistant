/**
 * @fileoverview AutomationPageWrapper.tsx
 * @author Luca Warmenhoven
 * @date Created on Saturday, October 05 - 13:57
 */
import { Automation }          from "./Automations";
import { useContext }          from "react";
import { ApplicationContext }  from "../../util/ApplicationContext";
import { AutomationsListPage } from "./AutomationsListPage";
import { AnnotatedIcon }       from "../assistant/AnnotatedIcon";

/**
 * The automation page wrapper.
 * This component is used to wrap the automation page.
 * It is used to display the automation page, and its contents.
 * @param props the properties of the component.
 */
export function AutomationPageWrapper(props: { automation: Automation }) {
    const { setContent } = useContext(ApplicationContext);

    return (
        <div className="flex flex-col justify-start items-stretch w-full mx-auto max-w-screen-md">
            <div className="grid grid-cols-3 items-center m-4 w-full">
                <div className="flex items-center justify-start">
                <AnnotatedIcon path="M15.75 19.5 8.25 12l7.5-7.5"
                               annotation="Back to automations" side='right'
                               onClick={() => setContent(<AutomationsListPage/>)}/>
                </div>
                <h1 className="text-white text-center text-2xl font-sans">{props.automation.name}</h1>
            </div>
            {props.automation.targetPage}
        </div>
    )
}