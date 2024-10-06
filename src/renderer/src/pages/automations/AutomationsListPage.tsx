/**
 * @fileoverview AutomationsListPage.tsx
 * @author Luca Warmenhoven
 * @date Created on Friday, October 04 - 12:14
 */
import { useAnimationSequence } from "../../util/AnimationSequence";
import { useContext, useRef }   from "react";
import { ApplicationContext }   from "../../util/ApplicationContext";
import { AutomationsContext }   from "./Automations";
import { AutomationCard }       from "./AutomationCard";
import { AnnotatedIcon }        from "../../components/AnnotatedIcon";
import { HomePage }           from "../HomePage";
import { EditAutomationPage } from "../edit-automations/EditAutomationPage";

/**
 * The automations list page.
 * @constructor
 */
export function AutomationsListPage() {
    const { setContent }  = useContext(ApplicationContext);
    const { automations } = useContext(AutomationsContext);
    const containerRef    = useRef<HTMLDivElement>(null);

    useAnimationSequence({ containerRef }, [ automations ]);

    return (
        <div className="mx-auto max-w-screen-md w-full flex flex-col justify-start">
            <div className="grid grid-cols-3 m-4 items-center">
                <div className="flex items-center justify-start">
                    <AnnotatedIcon path="M15.75 19.5 8.25 12l7.5-7.5"
                                   annotation="Back to menu" side='right'
                                   onClick={() => setContent(<HomePage/>)}/>
                </div>
                <h1 className="text-white text-center text-2xl font-helvetica-neue">Automations</h1>
                <div className="flex flex-row justify-end items-center">
                    <div>

                    <span className="text-white text-md font-helvetica-neue text-right mr-2">
                        {automations.reduce((acc, prev) => acc + (prev.enabled ? 1 : 0), 0)} active
                    </span>
                    </div>
                    <AnnotatedIcon path="M12 4.5v15m7.5-7.5h-15"
                                      annotation="New automation" side='left'
                                      onClick={() => setContent(<EditAutomationPage/>)}/>
                </div>
            </div>
            <div className="grid grid-cols-3 gap-4 m-4" ref={containerRef}>
                {automations.map(automation => (
                    <AutomationCard key={automation.id} {...automation}/>))}
            </div>
        </div>
    )
}