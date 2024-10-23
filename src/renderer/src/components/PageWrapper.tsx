/**
 * @fileoverview PageWrapper.tsx
 * @author Luca Warmenhoven
 * @date Created on Wednesday, October 16 - 11:17
 */
import { useContext }         from "react";
import { ApplicationContext } from "../contexts/ApplicationContext";
import { PageHeader }         from "./PageHeader";
import { Sidebar }            from "./Sidebar";
import { WindowDraggableArea } from "@renderer/components/DraggableWindowArea";

/**
 * Wrapper for the page.
 * This is the main component that contains the content of the page,
 * the window header (for macOS) and the sidebar.
 * @constructor
 */
export function PageWrapper() {

    const { headerConfig, content } = useContext(ApplicationContext);

    return (
        <div className="flex relative grow flex-col justify-start overflow-scroll">
            <WindowDraggableArea/>
            <div className="flex flex-row justify-start items-stretch grow">
                <Sidebar/>
                <div className="flex flex-col justify-start items-center grow overflow-scroll">
                    <PageHeader config={headerConfig}/>
                    {content}
                </div>
            </div>
        </div>
    )
}

