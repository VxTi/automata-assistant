import { createRoot }                 from 'react-dom/client'
import { ApplicationContextProvider } from "./util/ApplicationContext";
import './styles/styles.css'
import { AutomationsContextProvider } from "./pages/automations/Automations";
import { PageWrapper }                from "./pages/PageWrapper";
import './util/Audio'

createRoot(document.getElementById('root')!).render(
    <ApplicationContextProvider>
        <AutomationsContextProvider>
            <PageWrapper/>
        </AutomationsContextProvider>
    </ApplicationContextProvider>
);



