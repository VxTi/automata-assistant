/**
 * @fileoverview Sidebar.tsx
 * @author Luca Warmenhoven
 * @date Created on Thursday, October 17 - 20:09
 */
import { useContext, useEffect, useRef } from "react";
import { ApplicationContext }            from "../util/ApplicationContext";
import { Icons, IconStyles }             from "./cosmetic/Icons";
import { PagesConfig }                   from "../pages/PagesConfig";
import { SidebarMenuItem }               from "./SidebarMenuItem";
import { AnnotatedIcon }                 from "./AnnotatedIcon";

export function Sidebar() {
    const {
              sidebarExpanded, setSidebarExpanded,
          } = useContext(ApplicationContext);

    const sidebarRef = useRef<HTMLDivElement>(null);

    /**
     * Handle the click outside the sidebar.
     * This will close the sidebar if it is open.
     */
    useEffect(() => {
        if ( !sidebarRef.current ) return;

        const handleMouseMove = (event: MouseEvent) => {
            const boundingBox = sidebarRef.current!.getBoundingClientRect();
            setSidebarExpanded(
                event.clientX - 10 < boundingBox.right
            );
        }

        window.addEventListener('mousemove', handleMouseMove);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
        }
    }, [ sidebarRef, sidebarExpanded ]);

    return (
        <div
            ref={sidebarRef}
            className={
                `flex flex-col left-0 top-0 h-full shrink-0 bg-[#f8f8ff] rounded-lg border-[1px] border-solid border-gray-400 absolute w-96 transition-all duration-500 justify-start items-stretch grow z-50 overflow-hidden ${!sidebarExpanded ? 'max-w-0 p-0' : 'max-w-[300px]'}`}>
            <div className={`ml-auto p-3 mt-8`}>
                <Icons.Cross
                    className={IconStyles.LIGHT}
                    onClick={() => setSidebarExpanded( !sidebarExpanded)}/>
            </div>

            {PagesConfig.map((page, i) =>
                                 <SidebarMenuItem page={page} key={i}/>)}

            <div className="mt-auto mr-auto text-white m-1">
                <AnnotatedIcon path={[
                    'M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z',
                    'M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z'
                ]} annotation="Settings" side='right'
                               onClick={() => setSidebarExpanded( !sidebarExpanded)}/>
            </div>
        </div>
    )
}
