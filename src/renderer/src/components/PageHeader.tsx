/**
 * @fileoverview PageHeader.tsx
 * @author Luca Warmenhoven
 * @date Created on Thursday, October 17 - 16:40
 */
import { ApplicationContext, PageHeaderConfig } from "../contexts/ApplicationContext";
import { Icons }                                from "@renderer/components/Icons";
import { useContext }                           from "react";
import { AnnotatedIcon }                        from "@renderer/components/AnnotatedIcon";

/**
 * The page header component.
 * @param props
 * @constructor
 */
export function PageHeader(props: { config: PageHeaderConfig }) {

    const { sidebarExpanded, setSidebarExpanded } = useContext(ApplicationContext);

    return (
        <div
            className={`header-grid backdrop-blur-md items-center w-full max-w-screen-md text-lg mt-4 pb-3 px-4 ${props.config.className ?? ''}`}>
            <div className="flex flex-row items-center justify-start">
                <div
                    className={`h-full sm:hidden ${sidebarExpanded ? 'hidden' : ''}`}>
                    <AnnotatedIcon icon={<Icons.TwoBars/>}
                                   annotation='Open menu'
                                   side='right'
                                   onClick={() => setSidebarExpanded(true)}/>

                </div>
                {props.config.leftHeaderContent}
            </div>
            <h1 className="text-center text-lg mx-2 sm:text-xl">{props.config.pageTitle}</h1>
            <div className="flex flex-row items-center justify-end">
                {props.config.rightHeaderContent}
            </div>
        </div>
    )
}
