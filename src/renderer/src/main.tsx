import { createRoot }                 from 'react-dom/client'
import { ApplicationContextProvider } from "./contexts/ApplicationContext";
import './styles/styles.css'
import { AutomationsContextProvider } from "./pages/automations/Automations";
import { PageWrapper }                from "./components/PageWrapper";
import './util/Audio'

createRoot(document.getElementById('root')!).render(
    <ApplicationContextProvider>
        <AutomationsContextProvider>
            <PageWrapper/>
        </AutomationsContextProvider>
    </ApplicationContextProvider>
);

window.addEventListener('DOMContentLoaded', () => {
    document.body.dataset.theme = window.localStorage.getItem('theme') || 'dark';
})
