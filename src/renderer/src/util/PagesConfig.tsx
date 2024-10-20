/**
 * @fileoverview PagesConfig.tsx
 * @author Luca Warmenhoven
 * @date Created on Thursday, October 17 - 17:00
 */
import { ReactNode }               from "react";
import { AssistantPage }           from "../pages/assistant/AssistantPage";
import { LiveAssistantPage }       from "../pages/LiveAssistantPage";
import { AutomationsListPage }     from "../pages/automations/AutomationsListPage";
import { ConversationHistoryPage } from "../pages/ConversationHistoryPage";
import { FilesAndImagesPage }      from "../pages/FilesAndImagesPage";
import { Icons }                   from "../components/Icons";
import { SettingsPage }            from "../pages/SettingsPage";
import { AccountPage }             from "../pages/AccountPage";

export interface Page {
    title: string,
    hidden?: boolean,
    icon: ReactNode,
    pageComponent: ReactNode,
}

const PagesConfig: Page[] = [
    {
        title: 'Assistant',
        pageComponent: <AssistantPage/>,
        icon: <Icons.ChatBubbles/>
    },
    {
        title: 'Live Chat',
        pageComponent: <LiveAssistantPage/>,
        icon: <Icons.Signal/>
    },
    {
        title: 'Automations',
        pageComponent: <AutomationsListPage/>,
        icon: <Icons.WrenchScrew/>
    },
    {
        title: 'Conversation History',
        pageComponent: <ConversationHistoryPage/>,
        icon: <Icons.BookOpen/>
    },
    {
        title: 'Files and Images',
        pageComponent: <FilesAndImagesPage/>,
        icon: <Icons.FolderOpen/>
    },
    {
        title: 'Settings',
        pageComponent: <SettingsPage/>,
        icon: <Icons.Gear/>,
        hidden: true
    },
    {
        title: 'Account',
        pageComponent: <AccountPage/>,
        icon: <Icons.User />,
        hidden: true
    }
];

const ConfigMap = new Map(PagesConfig.map((entry => {
    return [entry.title.toLowerCase().replaceAll(' ', ''), entry];
})));

export { ConfigMap, PagesConfig };
