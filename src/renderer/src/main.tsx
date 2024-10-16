import { StrictMode }                 from 'react'
import { createRoot }                 from 'react-dom/client'
import { ApplicationContextProvider } from "./util/ApplicationContext";
import './styles/styles.css'
import { AutomationsContextProvider } from "./pages/automations/Automations";
import { PageWrapper }                from "./pages/PageWrapper";

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <ApplicationContextProvider>
            <AutomationsContextProvider>
                <PageWrapper/>
            </AutomationsContextProvider>
        </ApplicationContextProvider>
    </StrictMode>
)


