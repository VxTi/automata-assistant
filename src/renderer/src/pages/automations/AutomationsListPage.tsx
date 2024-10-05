/**
 * @fileoverview AutomationsListPage.tsx
 * @author Luca Warmenhoven
 * @date Created on Friday, October 04 - 12:14
 */
import { HomePage }           from "../HomePage";
import { ApplicationContext } from "../../util/ApplicationContext";
import { useContext }         from "react";
import { AutomationCard }     from "./AutomationCard";
import { Automations }        from "./Automations";
import { AnnotatedIcon }      from "../assistant/AnnotatedIcon";

export function AutomationsListPage() {
    const { setContent } = useContext(ApplicationContext);

    return (
        <div className="mx-auto max-w-screen-md w-full flex flex-col justify-start">
            <div className="grid grid-cols-3 m-4 items-center">
                <div className="flex items-center justify-start">
                    <AnnotatedIcon path="M15.75 19.5 8.25 12l7.5-7.5"
                                   annotation="Return to menu" side='right'
                                   onClick={() => setContent(<HomePage/>)}/>
                </div>
                <h1 className="text-white text-center text-2xl font-helvetica-neue">Automations</h1>
                <span className="text-white text-md font-helvetica-neue text-right">
                    {Automations.reduce((acc, prev) => acc + (prev.enabled ? 1 : 0), 0)} active
                </span>
            </div>
            <div className="grid grid-cols-3 gap-4 m-4">
                {Automations.map(automation => (
                    <AutomationCard key={automation.id} {...automation}/>))}
            </div>
        </div>
    )
}