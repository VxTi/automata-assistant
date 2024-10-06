/**
 * @fileoverview AutomationPageWrapper.tsx
 * @author Luca Warmenhoven
 * @date Created on Saturday, October 05 - 13:57
 */
import { Automation, AutomationRegistry }  from "./Automations";
import { useContext, useEffect, useState } from "react";
import { ApplicationContext }              from "../../util/ApplicationContext";
import { AutomationsListPage } from "./AutomationsListPage";
import { AnnotatedIcon }       from "../../components/AnnotatedIcon";

/**
 * The automation page wrapper.
 * This component is used to wrap the automation page.
 * It is used to display the automation page, and its contents.
 * @param props the properties of the component.
 */
export function AutomationPageWrapper(props: { automation: Automation }) {
    const { setContent }        = useContext(ApplicationContext);
    const [ active, setActive ] = useState(props.automation.enabled);

    useEffect(() => {
        AutomationRegistry.get(props.automation.id)!.enabled = active;
    }, [ active ]);

    return (
        <div className="flex flex-col justify-start items-stretch w-full mx-auto max-w-screen-md">
            <div className="grid grid-cols-3 items-center m-4">
                <div className="flex items-center justify-start">
                    <AnnotatedIcon path="M15.75 19.5 8.25 12l7.5-7.5"
                                   annotation="Back to automations" side='right'
                                   onClick={() => setContent(<AutomationsListPage/>)}/>
                </div>
                <h1 className="text-white text-center text-2xl font-sans select-none">{props.automation.name}</h1>
                <div className="flex items-center justify-end">
                    <AnnotatedIcon
                        path={active ? "M5.636 5.636a9 9 0 1 0 12.728 0M12 3v9" : "M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z"}
                        annotation={(active ? 'Disable' : 'Enable') + ' automation'}
                        side='left'
                        onClick={() => setActive( !active)}/>
                </div>
            </div>
            {props.automation.targetPage}
        </div>
    )
}