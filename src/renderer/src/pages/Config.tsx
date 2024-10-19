/**
 * @fileoverview Config.tsx
 * @author Luca Warmenhoven
 * @date Created on Thursday, October 17 - 17:00
 */
import { ReactNode }               from "react";
import { AssistantPage }           from "./assistant/AssistantPage";
import { LiveAssistantPage }       from "./LiveAssistantPage";
import { AutomationsListPage }     from "./automations/AutomationsListPage";
import { ConversationHistoryPage } from "./ConversationHistoryPage";
import { FilesAndImagesPage }      from "./FilesAndImagesPage";
import { Icons }                   from "../components/Icons";
import { SettingsPage }     from "./SettingsPage";
import { AccountPage }             from "./AccountPage";

export interface Page {
    title: string,
    hidden?: boolean,
    icon: ReactNode,
    pageComponent: ReactNode,
}

const Config: Page[] = [
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

const ConfigMap = new Map(Config.map((entry => {
    return [entry.title.toLowerCase().replaceAll(' ', ''), entry];
})));

export { ConfigMap, Config };
