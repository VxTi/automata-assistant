/**
 * @fileoverview WindowContentWrapper.tsx
 * @author Luca Warmenhoven
 * @date Created on Wednesday, October 16 - 11:17
 */
import { useContext, useRef }    from "react";
import { ApplicationContext }    from "../contexts/ApplicationContext";
import { PageHeader }            from "./PageHeader";
import { Sidebar }               from "./Sidebar";
import { WindowDraggableHeader } from "@renderer/components/WindowDraggableHeader";
import { useAnimationSequence }  from "@renderer/util/AnimationSequence";

/**
 * Wrapper for the page.
 * This is the main component that contains the content of the page,
 * the window header (for macOS) and the sidebar.
 * @constructor
 */
export function WindowContentWrapper() {

    const { headerConfig, content } = useContext(ApplicationContext);

    const containerRef = useRef<HTMLDivElement>(null);
    useAnimationSequence({ containerRef }, [ content ])

    return (
        <div className="flex relative grow flex-col justify-start overflow-scroll">
            <WindowDraggableHeader/>
            <div className="flex flex-row justify-start items-stretch grow">
                <Sidebar/>
                <div className="flex flex-col justify-start items-center grow overflow-scroll" ref={containerRef}>
                    <PageHeader config={headerConfig}/>
                    {content}
                </div>
            </div>
        </div>
    )
}

