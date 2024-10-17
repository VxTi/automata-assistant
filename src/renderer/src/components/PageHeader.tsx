/**
 * @fileoverview PageHeader.tsx
 * @author Luca Warmenhoven
 * @date Created on Thursday, October 17 - 16:40
 */
import { ApplicationContext, PageHeaderConfig } from "../util/ApplicationContext";
import { useContext }                           from "react";
import { Sidebar }                              from "./Sidebar";

/**
 * The page header component.
 * @param props
 * @constructor
 */
export function PageHeader(props: { config: PageHeaderConfig }) {
    const { sidebarExpanded, setSidebarExpanded } = useContext(ApplicationContext);
    return (
        <div
            className={`header-grid text-black items-center text-xl sm:text-2xl mx-4 mt-8 mb-4 ${props.config.className! ?? ''}`}>
            <Sidebar/>

            <div className="flex flex-row items-center justify-start">
                <div
                    className={`p-3 z-50 transition-colors duration-500 text-black ${sidebarExpanded ? 'opacity-0 pointer-events-none' : ''}`}>
                    <svg fill="none" strokeWidth="1.5" stroke="currentColor" viewBox="0 0 24 24"
                         className="w-9 h-9 hover:bg-gray-200 p-1 duration-300 cursor-pointer transition-colors rounded-full"
                         onClick={() => setSidebarExpanded( !sidebarExpanded)}
                         xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round"
                              d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12"></path>
                    </svg>
                </div>
                {props.config.leftHeaderContent}
            </div>
            <h1 className="text-center">{props.config.pageTitle}</h1>
            <div className="flex flex-row items-center justify-end">
                {props.config.rightHeaderContent}
            </div>
        </div>
    )
}
