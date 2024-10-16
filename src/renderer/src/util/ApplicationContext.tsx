/**
 * @fileoverview ApplicationContext.tsx
 * @author Luca Warmenhoven
 * @date Created on Friday, October 04 - 12:05
 */
import { createContext, ReactNode, useState } from "react";
import { AssistantPage }                      from "../pages/assistant/AssistantPage";

export const ApplicationContext = createContext<{
    content: ReactNode,
    setContent: (content: ReactNode) => void
}>({
       content: <AssistantPage/>,
       setContent: () => {
       }
   });

/**
 * This component is used to provide the ApplicationContext to the application
 * @param children The children of the component
 */
export function ApplicationContextProvider({ children }: { children: ReactNode }) {
    const [ content, setContent ] = useState<ReactNode>(<AssistantPage/>);
    return (
        <ApplicationContext.Provider value={{ content, setContent }}>
            {children}
        </ApplicationContext.Provider>
    )
}
