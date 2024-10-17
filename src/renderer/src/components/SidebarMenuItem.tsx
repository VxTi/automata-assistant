import { Page }               from "../pages/PagesConfig";
import { useContext }         from "react";
import { ApplicationContext } from "../util/ApplicationContext";

/**
 * @fileoverview SidebarMenuItem.tsx
 * @author Luca Warmenhoven
 * @date Created on Thursday, October 17 - 20:09
 */
/**
 * Menu item referring to a page.
 */
export function SidebarMenuItem(props: { page: Page }) {
    const { setContent } = useContext(ApplicationContext);

    return (
        <div
            className="py-1 px-6 rounded-lg m-1 text-black hover:bg-gray-200 transition-colors duration-300 hover:cursor-pointer flex text-nowrap justify-start select-none items-center"
            onClick={() => setContent(props.page.pageComponent)}>
            <div className="w-7 h-7 p-1 shrink-0 stroke-black fill-none stroke-[1.5px] mr-2">{props.page.icon}</div>
            <span className="text-sm">{props.page.title}</span>
        </div>
    )
}
