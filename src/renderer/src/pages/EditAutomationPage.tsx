/**
 * @fileoverview EditAutomationPage.tsx
 * @author Luca Warmenhoven
 * @date Created on Sunday, October 06 - 12:31
 */
import { AnnotatedIcon }                  from "../components/AnnotatedIcon";
import { ApplicationContext }             from "../contexts/ApplicationContext";
import { useContext, useEffect }          from "react";
import { AutomationsListPage }            from "./automations/AutomationsListPage";
import { Automation, AutomationsContext } from "./automations/Automations";
import { AutomationPageWrapper }          from "./automations/AutomationPageWrapper";
import { Icons }  from "../components/Icons";
import { Button } from "../components/interactive/Button";

/**
 * The edit automation page.
 * This page is used to edit an automation.
 * This is also the page where new automations can be created.
 * @param props The properties for the edit automation page
 */
export function EditAutomationPage(props: { automation?: Automation }) {
    const { setContent, setHeaderConfig } = useContext(ApplicationContext);
    const { automations }                 = useContext(AutomationsContext);

    useEffect(() => {
        setHeaderConfig(() => {
            return {
                leftHeaderContent: (
                    <AnnotatedIcon icon={<Icons.LeftArrow/>}
                                   annotation={"Back to " + (props.automation?.name ?? 'automations')}
                                   side='right'
                                   onClick={() => setContent(props.automation ?
                                                                      <AutomationPageWrapper
                                                                          automation={props.automation}/> :
                                                                      <AutomationsListPage/>)}/>
                ),
                pageTitle: 'Edit automation' + (props.automation ? ' for \'' + props.automation.name + '\'' : ''),
            }
        })
    }, [ props.automation ]);

    return (
        <div className="mx-auto max-w-screen-md w-full flex flex-col justify-start">
            <div className="flex flex-col justify-start items-stretch max-w-screen-sm mx-auto">
                <div className="flex flex-row justify-center mb-5 items-center text-lg">
                    <span>Name of automation: </span>
                    <input type="text"
                           className="ml-2 px-2 border-b-[1px] border-solid border-black focus:outline-none bg-transparent"
                           placeholder="Automation name" defaultValue={props.automation?.name ?? `My automation #${automations.length + 1}`}/>
                </div>

                <div className="content-container flex flex-col justify-start items-start relative w-max p-4 rounded-lg">
                    <span
                        className="text-sm mb-4">Detailed description of the automation:</span>
                    <textarea rows={4} cols={60}
                              className="bg-gray-200 dark:bg-gray-800 text-sm p-2 rounded-lg resize-none"/>
                    <div className="absolute left-1/2 top-full">
                        <div
                            className="rounded-full w-0 h-0 border-8 border-solid border-gray-800"></div>
                    </div>
                </div>
                <Button className='mt-5'>Save</Button>
            </div>
        </div>
    )
}
