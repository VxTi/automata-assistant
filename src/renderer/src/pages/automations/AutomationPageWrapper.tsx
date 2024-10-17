/**
 * @fileoverview AutomationPageWrapper.tsx
 * @author Luca Warmenhoven
 * @date Created on Saturday, October 05 - 13:57
 */
import { Automation, AutomationRegistry }  from "./Automations";
import { useContext, useEffect, useState } from "react";
import { ApplicationContext }              from "../../util/ApplicationContext";
import { AutomationsListPage }             from "./AutomationsListPage";
import { AnnotatedIcon }                   from "../../components/AnnotatedIcon";
import { EditAutomationPage }              from "../edit-automations/EditAutomationPage";

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
                <h1 className="text-black text-center text-2xl font-sans select-none">{props.automation.name}</h1>
                <div className="flex items-center justify-end">
                    <AnnotatedIcon path={[
                        'M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z',
                        'M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z'
                    ]} annotation="Edit automation" side='left'
                                   onClick={() => setContent(<EditAutomationPage automation={props.automation}/>)}/>
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
