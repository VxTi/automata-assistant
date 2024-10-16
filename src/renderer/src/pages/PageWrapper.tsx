/**
 * @fileoverview PageWrapper.tsx
 * @author Luca Warmenhoven
 * @date Created on Wednesday, October 16 - 11:17
 */
import { ReactNode, useContext, useState } from "react";
import { ApplicationContext }              from "../util/ApplicationContext";
import { AutomationsListPage }             from "./automations/AutomationsListPage";
import { AssistantPage }                   from "./assistant/AssistantPage";
import { LiveAssistantPage }               from "./live-assistant/LiveAssistantPage";

export function PageWrapper() {
    const [ sidebarExpanded, setSidebarExpanded ] = useState(false);
    const { content }                             = useContext(ApplicationContext);

    return (
        <div className="flex relative w-screen h-screen flex-col justify-start bg-yellow-50">
            <div className="flex w-full min-h-7 shrink-0 justify-center items-center" style={{
                WebkitUserSelect: 'none',
                /** @ts-ignore */
                WebkitAppRegion: 'drag',
            }}/>
            <div className="flex flex-col justify-start items-stretch w-full h-full">
                <div className="relative flex flex-row justify-start items-stretch h-full">
                    {sidebarExpanded &&
                        <div
                            className={`absolute left-0 top-0 p-3 z-50 transition-colors duration-500 text-black`}>
                            <svg fill="none" strokeWidth="1.5" stroke="currentColor" viewBox="0 0 24 24"
                                 className="w-9 h-9 hover:bg-gray-200 p-1 duration-300 cursor-pointer transition-colors rounded-full"
                                 onClick={() => setSidebarExpanded( !sidebarExpanded)}
                                 xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round"
                                      d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12"></path>
                            </svg>
                        </div>
                    }
                    <div
                        className={`flex flex-col left-0 top-0 h-full bg-black absolute md:relative transition-all duration-500 justify-start items-stretch grow ${sidebarExpanded ? 'max-w-0' +
                            ' overflow-hidden p-0' : 'max-w-[300px] z-20'}`}>
                        <div className="ml-auto p-3 text-white">
                            <svg fill="none" strokeWidth="1.5" stroke="currentColor" viewBox="0 0 24 24"
                                 className="w-9 h-9 p-1 rounded-full hover:bg-gray-800 transition-colors duration-300 cursor-pointer"
                                 onClick={() => setSidebarExpanded( !sidebarExpanded)}
                                 xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12"></path>
                            </svg>
                        </div>
                        <MenuItem title="Assistant" content={<AssistantPage/>}/>
                        <MenuItem title="Live Chat" content={<LiveAssistantPage/>}/>
                        <MenuItem title="Automations" content={<AutomationsListPage/>}/>
                    </div>
                    {content}

                </div>
            </div>
        </div>
    )
}

function MenuItem(props: { title: string, content: ReactNode }) {
    const { setContent } = useContext(ApplicationContext);

    return (
        <div
            className="py-1 px-6 rounded-lg m-1 text-white hover:bg-gray-600 transition-colors duration-300 hover:cursor-pointer flex text-nowrap justify-center select-none items-center"
            onClick={() => setContent(props.content)}>
            <span>{props.title}</span>
        </div>
    )
}
