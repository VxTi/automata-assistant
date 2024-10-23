/**
 * @fileoverview Sidebar.tsx
 * @author Luca Warmenhoven
 * @date Created on Thursday, October 17 - 20:09
 */
import { useContext }         from "react";
import { ApplicationContext } from "../contexts/ApplicationContext";
import { Icons }              from "./Icons";
import { PagesConfig }        from "../util/PagesConfig";
import { SidebarMenuItem }    from "./SidebarMenuItem";
import { AnnotatedIcon }      from "./AnnotatedIcon";
import { SettingsPage }       from "../pages/SettingsPage";
import { AccountPage }        from "../pages/AccountPage";

export function Sidebar() {
    const {
              sidebarExpanded, setSidebarExpanded,
              setContent
          } = useContext(ApplicationContext);

    return (
        <div
            className={
                `flex flex-col shrink-0 sm:m-4 sm:rounded-2xl content-container w-96 transition-all duration-500 justify-start items-stretch grow z-50 overflow-hidden md:bg-opacity-100 border-r-solid border-r-[1px] absolute sm:relative left-0 top-0 h-full sm:h-auto ${!sidebarExpanded ? 'max-w-0' : 'max-w-[300px]'} md:max-w-[300px]`}>

            <AnnotatedIcon icon={<Icons.Cross/>}
                           annotation='Close menu'
                           side='left'
                           onClick={() => setSidebarExpanded(false)}
                           className={`sm:hidden ml-auto mt-8 mb-2`}/>

            <div className='sm:mt-16 flex flex-col justify-start items-stretch'>
                <div className="text-center">
                    <span
                        className="text-xl w-auto font-bold font-sk-modernist uppercase bg-gradient-to-r from-gray-800 via-blue-950 to-gray-800 dark:from-gray-300 dark:via-blue-100 dark:to-gray-300 bg-center bg-clip-text text-transparent">Automata</span>
                </div>

                <hr className="mt-3 mb-6 bg-gradient-to-r from-transparent via-blue-500 to-transparent h-[1px] border-none"/>
                {PagesConfig.map((page, i) =>
                                     !page.hidden && <SidebarMenuItem page={page} key={i}/>)}
            </div>

            <div className="flex flex-row justify-between items-center my-2 mx-2 mt-auto">
                <AnnotatedIcon
                    icon={<Icons.Gear/>}
                    annotation='Settings'
                    side='right'
                    onClick={() => setContent(<SettingsPage/>)}/>
                <AnnotatedIcon
                    icon={<Icons.User/>}
                    annotation='Account'
                    side='left'
                    onClick={() => setContent(<AccountPage/>)}/>

            </div>
        </div>
    )
}
