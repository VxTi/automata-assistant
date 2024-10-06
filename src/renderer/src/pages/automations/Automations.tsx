/**
 * @fileoverview Automation.ts
 * @author Luca Warmenhoven
 * @date Created on Saturday, October 05 - 13:57
 */

/**
 * The automation interface.
 * This interface is used to define the structure of an automation.
 * An automation is a feature that can be enabled or disabled, and has a target page.
 */
export interface Automation {
    id: string,
    name: string,
    description: string,
    icon: JSX.Element,
    targetPage: JSX.Element,
    enabled?: boolean,
    settings?: any,
}

export const Automations: Automation[] = [
    {
        id: 'calendar',
        name: 'Calendar',
        description: 'Automate your calendar, and schedule events.',
        icon: <svg fill="currentColor" viewBox="0 0 24 24" className="w-full h-full"
                   xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path clipRule="evenodd" fillRule="evenodd"
                  d="M6.75 2.25A.75.75 0 0 1 7.5 3v1.5h9V3A.75.75 0 0 1 18 3v1.5h.75a3 3 0 0 1 3 3v11.25a3 3 0 0 1-3 3H5.25a3 3 0 0 1-3-3V7.5a3 3 0 0 1 3-3H6V3a.75.75 0 0 1 .75-.75Zm13.5 9a1.5 1.5 0 0 0-1.5-1.5H5.25a1.5 1.5 0 0 0-1.5 1.5v7.5a1.5 1.5 0 0 0 1.5 1.5h13.5a1.5 1.5 0 0 0 1.5-1.5v-7.5Z"></path>
        </svg>,
        targetPage: <></>,
        enabled: true,
    },
    {
        id: 'email',
        name: 'Email',
        description: 'Automate your email, and send emails.',
        targetPage: <></>,
        icon: (
            <svg fill="currentColor" viewBox="0 0 24 24"
                 xmlns="http://www.w3.org/2000/svg" className="w-full h-full"
                 aria-hidden="true">
                <path
                    d="M4.913 2.658c2.075-.27 4.19-.408 6.337-.408 2.147 0 4.262.139 6.337.408 1.922.25 3.291 1.861 3.405 3.727a4.403 4.403 0 0 0-1.032-.211 50.89 50.89 0 0 0-8.42 0c-2.358.196-4.04 2.19-4.04 4.434v4.286a4.47 4.47 0 0 0 2.433 3.984L7.28 21.53A.75.75 0 0 1 6 21v-4.03a48.527 48.527 0 0 1-1.087-.128C2.905 16.58 1.5 14.833 1.5 12.862V6.638c0-1.97 1.405-3.718 3.413-3.979Z"></path>
                <path
                    d="M15.75 7.5c-1.376 0-2.739.057-4.086.169C10.124 7.797 9 9.103 9 10.609v4.285c0 1.507 1.128 2.814 2.67 2.94 1.243.102 2.5.157 3.768.165l2.782 2.781a.75.75 0 0 0 1.28-.53v-2.39l.33-.026c1.542-.125 2.67-1.433 2.67-2.94v-4.286c0-1.505-1.125-2.811-2.664-2.94A49.392 49.392 0 0 0 15.75 7.5Z"></path>
            </svg>
        )
    },
    {
        id: 'messages',
        name: 'Messages',
        targetPage: <></>,
        description: 'Automate your messages, and send messages.',
        icon: (
            <svg fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="w-full h-full"
                 aria-hidden="true">
                <path
                    d="M1.5 8.67v8.58a3 3 0 0 0 3 3h15a3 3 0 0 0 3-3V8.67l-8.928 5.493a3 3 0 0 1-3.144 0L1.5 8.67Z"></path>
                <path
                    d="M22.5 6.908V6.75a3 3 0 0 0-3-3h-15a3 3 0 0 0-3 3v.158l9.714 5.978a1.5 1.5 0 0 0 1.572 0L22.5 6.908Z"></path>
            </svg>
        )
    },
    {
        id: 'weather',
        name: 'Weather',
        targetPage: <></>,
        description: 'Automate your weather, and get weather updates.',
        icon: (
            <svg data-slot="icon" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"
                 aria-hidden="true">
                <path
                    d="M12 2.25a.75.75 0 0 1 .75.75v2.25a.75.75 0 0 1-1.5 0V3a.75.75 0 0 1 .75-.75ZM7.5 12a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM18.894 6.166a.75.75 0 0 0-1.06-1.06l-1.591 1.59a.75.75 0 1 0 1.06 1.061l1.591-1.59ZM21.75 12a.75.75 0 0 1-.75.75h-2.25a.75.75 0 0 1 0-1.5H21a.75.75 0 0 1 .75.75ZM17.834 18.894a.75.75 0 0 0 1.06-1.06l-1.59-1.591a.75.75 0 1 0-1.061 1.06l1.59 1.591ZM12 18a.75.75 0 0 1 .75.75V21a.75.75 0 0 1-1.5 0v-2.25A.75.75 0 0 1 12 18ZM7.758 17.303a.75.75 0 0 0-1.061-1.06l-1.591 1.59a.75.75 0 0 0 1.06 1.061l1.591-1.59ZM6 12a.75.75 0 0 1-.75.75H3a.75.75 0 0 1 0-1.5h2.25A.75.75 0 0 1 6 12ZM6.697 7.757a.75.75 0 0 0 1.06-1.06l-1.59-1.591a.75.75 0 0 0-1.061 1.06l1.59 1.591Z"></path>
            </svg>
        )
    }
];

export const AutomationRegistry: Map<string, Automation> = new Map<string, Automation>(
    Automations.map(automation => [ automation.id, automation ]));