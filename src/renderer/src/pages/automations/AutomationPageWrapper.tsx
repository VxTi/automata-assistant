/**
 * @fileoverview AutomationPageWrapper.tsx
 * @author Luca Warmenhoven
 * @date Created on Saturday, October 05 - 13:57
 */
import { Automation, AutomationRegistry }  from "./Automations";
import { useContext, useEffect, useState } from "react";
import { ApplicationContext }              from "../../util/ApplicationContext";
import { AutomationsListPage }             from "./AutomationsListPage";
import { TemporaryAnnotatedIcon }          from "../../components/AnnotatedIcon";
import { EditAutomationPage }              from "../edit-automations/EditAutomationPage";
import { Icons }                           from "../../components/cosmetic/Icons";

/**
 * The automation page wrapper.
 * This component is used to wrap the automation page.
 * It is used to display the automation page, and its contents.
 * @param props the properties of the component.
 */
export function AutomationPageWrapper(props: { automation: Automation }) {
    const { setContent, setHeaderConfig } = useContext(ApplicationContext);
    const [ active, setActive ]           = useState(props.automation.enabled);

    useEffect(() => {
        AutomationRegistry.get(props.automation.id)!.enabled = active;

        setHeaderConfig(() => {
            return {
                leftHeaderContent: (
                    <TemporaryAnnotatedIcon icon={<Icons.LeftArrow/>}
                                            annotation='Back to automations'
                                            side='right'
                                            onClick={() => setContent(<AutomationsListPage/>)}/>
                ),
                pageTitle: props.automation.name,
                rightHeaderContent: (
                    <>
                        <TemporaryAnnotatedIcon
                            icon={<Icons.Gear/>}
                            annotation='Edit automation'
                            side='left'
                            onClick={() => setContent(<EditAutomationPage automation={props.automation}/>)}/>
                        <TemporaryAnnotatedIcon
                            icon={!active ? <Icons.Disable/> : <Icons.Play/>}
                            annotation={(active ? 'Disable' : 'Enable') + ' automation'}
                            side='left'
                            onClick={() => setActive( !active)}/>
                    </>
                )
            }
        });

    }, [ active ]);

    return (
        <div className="flex flex-col justify-start items-stretch w-full mx-auto max-w-screen-md">
            {props.automation.targetPage}
        </div>
    )
}
