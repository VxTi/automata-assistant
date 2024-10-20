/**
 * @fileoverview ApplicationContext.tsx
 * @author Luca Warmenhoven
 * @date Created on Friday, October 04 - 12:05
 */
import { createContext, ReactNode, useCallback, useState } from "react";
import { AssistantPage }                                   from "../pages/assistant/AssistantPage";

export interface PageHeaderConfig {
    leftHeaderContent?: ReactNode | null;
    rightHeaderContent?: ReactNode | null;
    pageTitle?: string | null;
    className?: string
}

export const ApplicationContext = createContext<{
    content: ReactNode,
    setContent: (content: ReactNode) => void,
    sidebarExpanded: boolean,
    setSidebarExpanded: (state: boolean) => void,
    headerConfig: PageHeaderConfig,
    setHeaderConfig: (updateFn: () => PageHeaderConfig) => void
}>({
       content: <AssistantPage/>,
       setContent: () => void 0,
       sidebarExpanded: true,
       setSidebarExpanded: () => void 0,
       setHeaderConfig: (_: () => PageHeaderConfig) => void 0,
       headerConfig: {}
   });

/**
 * This component is used to provide the ApplicationContext to the application
 * @param children The children of the component
 */
export function ApplicationContextProvider({ children }: { children: ReactNode }) {
    const [ content, setContent ]                 = useState<ReactNode>(<AssistantPage/>);
    const [ sidebarExpanded, setSidebarExpanded ] = useState<boolean>(true);
    const [ headerConfig, setHeaderConfig ]       = useState<PageHeaderConfig>({});

    const updateHeaderConfigCallback = useCallback((updateFn: () => PageHeaderConfig) => {
        setHeaderConfig(() => updateFn());
    }, [ headerConfig ]);

    return (
        <ApplicationContext.Provider value={{
            content, setContent, sidebarExpanded, setSidebarExpanded,
            setHeaderConfig: updateHeaderConfigCallback,
            headerConfig
        }}>
            {children}
        </ApplicationContext.Provider>
    )
}
