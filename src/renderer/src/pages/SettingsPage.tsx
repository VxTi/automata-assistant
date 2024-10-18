/**
 * @fileoverview SettingsPage.tsx
 * @author Luca Warmenhoven
 * @date Created on Friday, October 18 - 09:16
 */
import { useContext, useEffect } from "react";
import { ApplicationContext } from "../contexts/ApplicationContext";
import { Switch }             from "../components/Switch";
import { ScrollableContainer }   from "../components/ScrollableContainer";

export function SettingsPage() {

    const { setHeaderConfig } = useContext(ApplicationContext);

    useEffect(() => {
        setHeaderConfig(() => {
            return {
                pageTitle: 'Settings',
            };
        })
    }, []);

    return (
        <ScrollableContainer className="max-w-screen-sm gap-4 p-4">
            <OptionalSetting title="Personalized messages"
                             description="Allow the assistant to generate a personal profile to create more accurate and personalized responses."
                             enabled={false}
                             onChange={(newState) => {
                                 console.log('Personalized messages:', newState);
                             }}
            />
            <OptionalSetting title="Automatically save images"
                             description="Automatically save images that are sent to you to your device."
                             enabled={true}
                             onChange={(newState) => {
                                 console.log('Automatically save images:', newState);
                             }}
            />
            <OptionalSetting title="Automatically save conversations"
                                description="Automatically save conversations to your device."
                                enabled={true}
                                onChange={(newState) => {
                                    console.log('Automatically save conversations:', newState);
                                }}
            />
            <hr className="border-gray-600 my-3"/>
            <OptionalSetting title="Dark mode"
                             description="Enable dark mode for the application."
                             enabled={true}
                             onChange={(newState) => {
                                 document.body.style.transition = 'all 0.3s';
                                 document.body.dataset.theme    = newState ? 'dark' : 'light';
                                 setTimeout(() => {
                                     document.body.style.transition = '';
                                 }, 300);
                             }}
            />
        </ScrollableContainer>
    );
}

/**
 * Optional setting component.
 * @constructor
 */
function OptionalSetting(props: {
    title: string,
    description: string,
    enabled: boolean,
    onChange: (newState: boolean) => void
}) {
    return (
        <div className="flex flex-row w-full justify-between items-center gap-5">
            <div className="flex flex-col gap-1">
                <span aria-label={props.description}>{props.title}</span>
                <span className="text-gray-400 text-sm">{props.description}</span>
            </div>
            <Switch onStateChange={props.onChange} checked={props.enabled}/>
        </div>
    )
}
