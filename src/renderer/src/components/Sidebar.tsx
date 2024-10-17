/**
 * @fileoverview Sidebar.tsx
 * @author Luca Warmenhoven
 * @date Created on Thursday, October 17 - 20:09
 */
import { useContext }         from "react";
import { ApplicationContext } from "../util/ApplicationContext";
import { Icons, IconStyles }  from "./cosmetic/Icons";
import { PagesConfig }     from "../pages/PagesConfig";
import { SidebarMenuItem } from "./SidebarMenuItem";

export function Sidebar() {
    const {
              sidebarExpanded, setSidebarExpanded,
          } = useContext(ApplicationContext);

    return (
        <div
            className={
                `flex flex-col left-0 top-0 h-full shrink-0 bg-[#f8f8ff] rounded-lg border-[1px] border-solid border-gray-400 absolute w-96 transition-all duration-500 justify-start items-stretch grow ${!sidebarExpanded ? 'max-w-0 overflow-hidden p-0' : 'max-w-[300px] z-50'}`}>
            <div className="ml-auto p-3 mt-8">
                <Icons.Cross
                    className={IconStyles.LIGHT}
                    onClick={() => setSidebarExpanded( !sidebarExpanded)}/>
            </div>

            {PagesConfig.map((page, i) =>
                                 <SidebarMenuItem page={page} key={i}/>)}

            <div className="mt-auto text-white m-1">
                <Icons.Gear onClick={() => setSidebarExpanded( !sidebarExpanded)}
                            className={IconStyles.LIGHT}/>
            </div>
        </div>
    )
}
