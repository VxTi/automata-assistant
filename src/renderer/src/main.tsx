import { createRoot }                 from 'react-dom/client'
import { ApplicationContextProvider } from "./contexts/ApplicationContext";
import { AutomationsContextProvider } from "./pages/automations/Automations";
import { WindowContentWrapper }       from "./components/WindowContentWrapper";
import { Settings }                   from "@renderer/util/Settings";
import { ChatContextProvider }        from "@renderer/contexts/ChatContext";
import './styles/styles.css'
import './util/Audio'
import { IntroductionPage }           from "@renderer/pages/IntroductionPage";
import { Service }                    from "@renderer/util/external_services/Services";
import { InternetQueryService }       from "@renderer/util/external_services/InternetQueryService";
import { EmailService }               from "@renderer/util/external_services/EmailService";
import { ImageGenerationService }     from "@renderer/util/external_services/ImageGenerationService";

createRoot(document.getElementById('root')!).render(<ApplicationWrapper/>);

function ApplicationWrapper() {

    if ( !Settings.get(Settings.AGREED_TO_EULA) )
        return <IntroductionPage/>

    return (
        <ChatContextProvider>
            <ApplicationContextProvider>
                <AutomationsContextProvider>
                    <WindowContentWrapper/>
                </AutomationsContextProvider>
            </ApplicationContextProvider>
        </ChatContextProvider>
    )
}

window.addEventListener('DOMContentLoaded', () => {
    document.body.dataset.theme = Settings.get(Settings.THEME);
    Service.register(new InternetQueryService());
    Service.register(new EmailService());
    Service.register(new ImageGenerationService());
})
