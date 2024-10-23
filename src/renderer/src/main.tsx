import { createRoot }                 from 'react-dom/client'
import { ApplicationContextProvider } from "./contexts/ApplicationContext";
import { AutomationsContextProvider } from "./pages/automations/Automations";
import { PageWrapper }                from "./components/PageWrapper";
import { Settings }                   from "@renderer/util/Settings";
import { ChatContextProvider }        from "@renderer/contexts/ChatContext";
import './styles/styles.css'
import './util/Audio'

createRoot(document.getElementById('root')!).render(
    <ChatContextProvider>
        <ApplicationContextProvider>
            <AutomationsContextProvider>
                <PageWrapper/>
            </AutomationsContextProvider>
        </ApplicationContextProvider>
    </ChatContextProvider>
);

window.addEventListener('DOMContentLoaded', () => {
    document.body.dataset.theme = Settings.get(Settings.THEME)
})
