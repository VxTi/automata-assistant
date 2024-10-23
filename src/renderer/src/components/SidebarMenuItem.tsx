import { Page }       from "../util/PagesConfig";
import { useContext } from "react";
import { ApplicationContext } from "../contexts/ApplicationContext";

/**
 * @fileoverview SidebarMenuItem.tsx
 * @author Luca Warmenhoven
 * @date Created on Thursday, October 17 - 20:09
 */
/**
 * Menu item referring to a page.
 */
export function SidebarMenuItem(props: { page: Page }) {
    const { setContent, setSidebarExpanded } = useContext(ApplicationContext);

    return (
        <div
            className="py-1 px-6 rounded-md mx-1 my-0.5 content-container hoverable transition-colors duration-200 flex text-nowrap justify-start select-none items-center"
            onClick={() => {
                setContent(props.page.pageComponent);
                setSidebarExpanded(false);
            }}>
            <div className="w-7 h-7 p-1 shrink-0 fill-none apply-stroke stroke-[1.5px] mr-2">{props.page.icon}</div>
            <span className="text-sm">{props.page.title}</span>
        </div>
    )
}
