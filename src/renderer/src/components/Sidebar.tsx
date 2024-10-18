/**
 * @fileoverview Sidebar.tsx
 * @author Luca Warmenhoven
 * @date Created on Thursday, October 17 - 20:09
 */
import { useContext }             from "react";
import { ApplicationContext }     from "../util/ApplicationContext";
import { Icons }                  from "./cosmetic/Icons";
import { PagesConfig }            from "../pages/PagesConfig";
import { SidebarMenuItem }        from "./SidebarMenuItem";
import { TemporaryAnnotatedIcon } from "./AnnotatedIcon";
import { SettingsPage }           from "../pages/SettingsPage";

export function Sidebar() {
    const {
              sidebarExpanded, setSidebarExpanded,
              setContent
          } = useContext(ApplicationContext);

    return (
        <div
            className={
                `flex flex-col rounded-tl-lg rounded-bl-lg h-full shrink-0 dark:bg-[#1b1b1f] border-r-[1px] border-r-solid border-r-[#3c3f44] bg-opacity-0 w-96 transition-all duration-500 justify-start items-stretch group grow z-50 overflow-hidden max-w-[16px] hover:max-w-[300px] md:max-w-[300px] hover:bg-opacity-100 md:bg-opacity-100 hover:border-r-solid md:border-r-[1px] hover:border-r-[1px]`}>
            <div
                className={`z-50 absolute left-0 top-0 h-full bg-opacity-20 flex flex-col justify-center text-black group-hover:opacity-0 md:opacity-0 transition-all duration-500`}>
                <Icons.RightArrow
                    className="w-6 h-6 fill-none stroke-black duration-300 transition-colors rounded-full"
                    onClick={() => setSidebarExpanded( !sidebarExpanded)}/>

            </div>
            <div className='mt-16 flex flex-col justify-start items-stretch'>
                {PagesConfig.map((page, i) =>
                                     !page.hidden && <SidebarMenuItem page={page} key={i}/>)}
            </div>

            <div className="mt-auto mr-auto text-white m-1">
                <TemporaryAnnotatedIcon
                    icon={<Icons.Gear/>}
                    annotation='Settings'
                    side='right'
                    onClick={() => setContent(<SettingsPage/>)}/>

            </div>
        </div>
    )
}
