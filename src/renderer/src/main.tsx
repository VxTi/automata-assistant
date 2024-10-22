import { createRoot }                 from 'react-dom/client'
import { ApplicationContextProvider } from "./contexts/ApplicationContext";
import './styles/styles.css'
import { AutomationsContextProvider } from "./pages/automations/Automations";
import { PageWrapper }                from "./components/PageWrapper";
import './util/Audio'
import { Settings }                   from "@renderer/util/Settings";

createRoot(document.getElementById('root')!).render(
    <ApplicationContextProvider>
        <AutomationsContextProvider>
            <PageWrapper/>
        </AutomationsContextProvider>
    </ApplicationContextProvider>
);

window.addEventListener('DOMContentLoaded', () => {
    document.body.dataset.theme = Settings.get(Settings.THEME)
})
