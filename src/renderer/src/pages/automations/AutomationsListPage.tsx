/**
 * @fileoverview AutomationsListPage.tsx
 * @author Luca Warmenhoven
 * @date Created on Friday, October 04 - 12:14
 */
import { useAnimationSequence }          from "../../util/AnimationSequence";
import { useContext, useEffect, useRef } from "react";
import { ApplicationContext }            from "../../contexts/ApplicationContext";
import { AutomationsContext }            from "./Automations";
import { AutomationCard }     from "./AutomationCard";
import { AnnotatedIcon }      from "../../components/AnnotatedIcon";
import { EditAutomationPage } from "../EditAutomationPage";
import { Icons }              from "../../components/Icons";

/**
 * The automations list page.
 * @constructor
 */
export function AutomationsListPage() {
    const { setContent, setHeaderConfig } = useContext(ApplicationContext);
    const { automations }                 = useContext(AutomationsContext);
    const containerRef                    = useRef<HTMLDivElement>(null);

    useAnimationSequence({ containerRef }, [ automations ]);

    useEffect(() => {
        setHeaderConfig(() => {
            return {
                pageTitle: 'Automations',
                rightHeaderContent: (
                    <>
                        <span className="text-sm">
                            {automations.reduce((acc, prev) => acc + (prev.enabled ? 1 : 0), 0)} active
                        </span>
                        <AnnotatedIcon
                            icon={<Icons.Plus/>}
                            annotation='New automation'
                            side='left'
                            onClick={() => setContent(<EditAutomationPage/>)}/>
                    </>
                )
            }
        });
    }, [ automations ]);

    return (
        <div className="mx-auto max-w-screen-md w-full flex flex-col justify-start">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 m-4" ref={containerRef}>
                {automations.map((automation, i) => (
                    <AutomationCard key={i} index={i} {...automation}/>))}
            </div>
        </div>
    )
}
