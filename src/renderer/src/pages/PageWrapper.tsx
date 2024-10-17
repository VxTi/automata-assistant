/**
 * @fileoverview PageWrapper.tsx
 * @author Luca Warmenhoven
 * @date Created on Wednesday, October 16 - 11:17
 */
import { useContext }         from "react";
import { ApplicationContext } from "../util/ApplicationContext";
import { PageHeader }         from "../components/PageHeader";

/**
 * Draggable area for the window.
 */
const WindowDraggableArea = () => (
    <div className="absolute left-0 top-0 flex w-full min-h-7 shrink-0 justify-center items-center" style={{
        WebkitUserSelect: 'none',
        /** @ts-ignore */
        WebkitAppRegion: 'drag',
    }}/>
);

/**
 * Wrapper for the page.
 * @constructor
 */
export function PageWrapper() {

    const { headerConfig, content } = useContext(ApplicationContext);

    return (
        <div className="flex relative w-screen h-screen flex-col justify-start bg-white">
            <WindowDraggableArea/>
            <PageHeader config={headerConfig}/>
            <div className="flex flex-col justify-start items-stretch grow overflow-y-scroll">
                {content}
            </div>
        </div>
    )
}

