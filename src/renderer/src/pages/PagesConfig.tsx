/**
 * @fileoverview PagesConfig.tsx
 * @author Luca Warmenhoven
 * @date Created on Thursday, October 17 - 17:00
 */
import { ReactNode } from "react";
import { AssistantPage }       from "./assistant/AssistantPage";
import { LiveAssistantPage }   from "./LiveAssistantPage";
import { AutomationsListPage } from "./automations/AutomationsListPage";
import { ConversationHistory } from "./ConversationHistory";
import { ImageLibraryPage }    from "./ImageLibraryPage";

export interface Page {
    title: string,
    visible?: boolean,
    pageComponent: ReactNode
};

export const PagesConfig: Page[] = [
    {
        title: 'Assistant',
        pageComponent: <AssistantPage />
    },
    {
        title: 'Live Chat',
        pageComponent: <LiveAssistantPage />
    },
    {
        title: 'Automations',
        pageComponent: <AutomationsListPage />
    },
    {
        title: 'Conversation History',
        pageComponent: <ConversationHistory />
    },
    {
        title: 'Browse Images',
        pageComponent: <ImageLibraryPage />
    }
]
