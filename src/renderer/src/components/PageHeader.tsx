/**
 * @fileoverview PageHeader.tsx
 * @author Luca Warmenhoven
 * @date Created on Thursday, October 17 - 16:40
 */
import { ApplicationContext, PageHeaderConfig } from "../util/ApplicationContext";
import { useContext }                           from "react";
import { Sidebar }                              from "./Sidebar";
import { Icons }                                from "./cosmetic/Icons";

/**
 * The page header component.
 * @param props
 * @constructor
 */
export function PageHeader(props: { config: PageHeaderConfig }) {
    const { sidebarExpanded, setSidebarExpanded } = useContext(ApplicationContext);
    return (
        <div
            className={`header-grid text-black items-center text-lg mx-6 mt-8 mb-4 ${props.config.className! ?? ''}`}>
            <Sidebar/>

                <div
                    className={`z-50 absolute left-0 top-0 h-full bg-gray-50 bg-opacity-20 hover:bg-gray-100 transition-colors duration-300 flex flex-col justify-center text-black ${sidebarExpanded ? 'opacity-0 pointer-events-none' : ''}`}>
                    <Icons.RightArrow
                        className="w-6 h-6 fill-none stroke-black duration-300 transition-colors rounded-full"
                        onClick={() => setSidebarExpanded(!sidebarExpanded)}/>

                </div>
            <div className="flex flex-row items-center justify-start">
                {props.config.leftHeaderContent}
            </div>
            <h1 className="text-center text-xl">{props.config.pageTitle}</h1>
            <div className="flex flex-row items-center justify-end">
                {props.config.rightHeaderContent}
            </div>
        </div>
    )
}
