/**
 * @fileoverview NewAutomationPage.tsx
 * @author Luca Warmenhoven
 * @date Created on Sunday, October 06 - 12:31
 */
import { AnnotatedIcon }       from "../../components/AnnotatedIcon";
import { ApplicationContext }  from "../../util/ApplicationContext";
import { useContext }          from "react";
import { AutomationsListPage } from "../automations/AutomationsListPage";
import { ActionState }         from "./ActionState";

export function NewAutomationPage() {
    const { setContent } = useContext(ApplicationContext);
    return (
        <div className="mx-auto max-w-screen-md w-full flex flex-col justify-start">
            <div className="grid grid-cols-3 m-4 items-center">
                <div className="flex items-center justify-start">
                    <AnnotatedIcon path="M15.75 19.5 8.25 12l7.5-7.5"
                                   annotation="Back to automations" side='right'
                                   onClick={() => setContent(<AutomationsListPage/>)}/>
                </div>
                <h1 className="text-white text-center text-2xl font-helvetica-neue">New automation</h1>
            </div>
            <div className="flex flex-col justify-start items-stretch max-w-screen-sm mx-auto">
                <button
                    className="mt-2 mb-5 px-4 py-2 text-white hover:cursor-pointer transition-colors duration-300 hover:bg-indigo-600 rounded-full font-helvetica-neue bg-indigo-500">New
                    action
                </button>
                <ActionState title='Automation Description' type='when' options={[ 'input' ]}/>
            </div>
        </div>
    )
}