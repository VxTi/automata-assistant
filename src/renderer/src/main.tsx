import { StrictMode, useContext }                         from 'react'
import { createRoot }                                     from 'react-dom/client'
import { ApplicationContext, ApplicationContextProvider } from "./util/ApplicationContext";
import './styles/styles.css'
import { AutomationsContextProvider }                     from "./pages/automations/Automations";

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <ApplicationContextProvider>
            <AutomationsContextProvider>
                <Application/>
            </AutomationsContextProvider>
        </ApplicationContextProvider>
    </StrictMode>,
)

function Application() {
    const { content } = useContext(ApplicationContext);
    return (
        <div className="flex relative w-screen h-screen flex-col justify-start bg-gray-950">
            <div className="flex w-full min-h-7 shrink-0 justify-center items-center" style={{
                WebkitUserSelect: 'none',
                /** @ts-ignore */
                WebkitAppRegion: 'drag',
            }}/>
            {content}
        </div>
    )
}

