/**
 * @fileoverview PagesConfig.tsx
 * @author Luca Warmenhoven
 * @date Created on Thursday, October 17 - 17:00
 */
import { ReactNode }               from "react";
import { AssistantPage }           from "./assistant/AssistantPage";
import { LiveAssistantPage }       from "./LiveAssistantPage";
import { AutomationsListPage }     from "./automations/AutomationsListPage";
import { ConversationHistoryPage } from "./ConversationHistoryPage";
import { ImageLibraryPage } from "./ImageLibraryPage";
import { Icons }            from "../components/Icons";
import { SettingsPage }     from "./SettingsPage";

export interface Page {
    title: string,
    hidden?: boolean,
    icon: ReactNode,
    pageComponent: ReactNode,
}

export const PagesConfig: Page[] = [
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
        title: 'Files & Images',
        pageComponent: <ImageLibraryPage/>,
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
        pageComponent: <SettingsPage/>,
        icon: <Icons.User />,
        hidden: true
    }
]
