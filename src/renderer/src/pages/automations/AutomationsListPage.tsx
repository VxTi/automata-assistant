/**
 * @fileoverview AutomationsListPage.tsx
 * @author Luca Warmenhoven
 * @date Created on Friday, October 04 - 12:14
 */
import { BaseStyles }         from "../../util/BaseStyles";
import { HomePage }           from "../HomePage";
import { ApplicationContext } from "../../util/ApplicationContext";
import { useContext }         from "react";
import { AutomationCard }     from "./AutomationCard";
import { Automations }        from "./Automations";

export function AutomationsListPage() {
    const { setContent } = useContext(ApplicationContext);
    return (
        <div className="mx-auto max-w-screen-md w-full flex flex-col justify-start">
            <div className="grid grid-cols-3 m-4 items-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5}
                     className={BaseStyles.ICON}
                     onClick={() => setContent(<HomePage/>)}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5"/>
                </svg>
                <h1 className="text-white text-center text-2xl font-sans">Automations</h1>
            </div>
            <p className="text-white text-md text-center">
                Automations will be available in a future update.
            </p>
            <div className="grid grid-cols-3 gap-4 m-4">
                { Automations.map(automation => (
                    <AutomationCard key={automation.id} {...automation}/> ))}
            </div>
        </div>
    )
}