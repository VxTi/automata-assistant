import { StrictMode, useContext }                         from 'react'
import { createRoot }                                     from 'react-dom/client'
import { ApplicationContext, ApplicationContextProvider } from "./util/ApplicationContext";
import './styles/styles.css'

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <ApplicationContextProvider>
            <Application/>
        </ApplicationContextProvider>
    </StrictMode>,
)

function Application() {
    const { content } = useContext(ApplicationContext);
    return (
        <div className="flex w-screen h-screen flex-col justify-start bg-gray-900">
            {content}
        </div>
    )
}

