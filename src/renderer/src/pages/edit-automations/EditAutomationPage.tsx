/**
 * @fileoverview EditAutomationPage.tsx
 * @author Luca Warmenhoven
 * @date Created on Sunday, October 06 - 12:31
 */
import { AnnotatedIcon }         from "../../components/AnnotatedIcon";
import { ApplicationContext }    from "../../util/ApplicationContext";
import { useContext }            from "react";
import { AutomationsListPage }   from "../automations/AutomationsListPage";
import { Automation }            from "../automations/Automations";
import { AutomationPageWrapper } from "../automations/AutomationPageWrapper";

/**
 * The edit automation page.
 * This page is used to edit an automation.
 * This is also the page where new automations can be created.
 * @param props The properties for the edit automation page
 */
export function EditAutomationPage(props: { automation?: Automation }) {
    const { setContent } = useContext(ApplicationContext);
    return (
        <div className="mx-auto max-w-screen-md w-full flex flex-col justify-start">
            <div className="header-grid mb-6">
                <div className="flex items-center justify-start">
                    <AnnotatedIcon path="M15.75 19.5 8.25 12l7.5-7.5"
                                   annotation={"Back to " + (props.automation?.name ?? 'automations')} side='right'
                                   onClick={() => setContent(props.automation ?
                                                             <AutomationPageWrapper automation={props.automation}/> :
                                                             <AutomationsListPage/>)}/>
                </div>
                <h1 className="text-black text-center text-2xl">
                    Edit automation{props.automation ? ' for \'' + props.automation.name + '\'' : ''}
                </h1>
            </div>
            <div className="flex flex-col justify-start items-stretch max-w-screen-sm mx-auto">
                <div className="flex flex-col justify-start items-start relative w-max p-4 rounded-lg bg-gray-800">
                    <span
                        className="text-white text-sm mb-4">Detailed description of automation</span>
                    <textarea rows={4} cols={60}
                              className="bg-gray-700 text-white text-sm p-2 rounded-lg resize-none"/>
                    <div className="absolute left-1/2 bottom-full">
                        <div
                            className="w-0 h-0 border-4 border-solid border-gray-800 border-t-0 border-l-2 border-r-2"></div>
                    </div>
                </div>
                <button
                    className="mt-5 px-4 py-2 text-white hover:cursor-pointer transition-colors duration-300 hover:bg-indigo-600 rounded-full bg-indigo-500">
                    New action
                </button>
            </div>
        </div>
    )
}
