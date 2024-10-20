/**
 * @fileoverview SettingsPage.tsx
 * @author Luca Warmenhoven
 * @date Created on Friday, October 18 - 09:16
 */
import { useContext, useEffect, useRef } from "react";
import { ApplicationContext }            from "../contexts/ApplicationContext";
import { ScrollableContainer }           from "../components/ScrollableContainer";
import { FadeIn, useAnimationSequence }  from "../util/AnimationSequence";
import { HLine }                         from "../components/HLine";
import { BooleanSetting }                from "../components/interactive/BooleanSetting";

export function SettingsPage() {

    const { setHeaderConfig } = useContext(ApplicationContext);
    const containerRef        = useRef<HTMLDivElement>(null);
    useAnimationSequence({ containerRef });

    useEffect(() => {
        setHeaderConfig(() => {
            return {
                pageTitle: 'Settings',
            };
        })
    }, []);

    return (
        <ScrollableContainer className="gap-4 p-4" size='sm' elementRef={containerRef}>
            <BooleanSetting title="Personalized messages"
                            description="Allow the assistant to generate a personal profile to create more accurate and personalized responses."
                            props={FadeIn()}
                            enabled={Boolean(window.localStorage.getItem('personalizedMessages') ?? 'true')}
                            onChange={(newState) => window.localStorage.setItem('personalizedMessages', newState.toString())}
            />
            <BooleanSetting title="Automatically save images"
                            description="Automatically save images that are sent to you to your device."
                            props={FadeIn()}
                            enabled={Boolean(window.localStorage.getItem('saveImages') ?? 'true')}
                            onChange={(newState) => window.localStorage.setItem('saveImages', newState.toString())}
            />
            <BooleanSetting title="Automatically save conversations"
                            description="Automatically save conversations to your device."
                            props={FadeIn()}
                            enabled={Boolean(window.localStorage.getItem('saveConversations') ?? 'true')}
                            onChange={(newState) => window.localStorage.setItem('saveConversations', newState.toString())}
            />
            <HLine props={FadeIn()}/>
            <BooleanSetting title="Dark mode"
                            description="Enable dark mode for the application."
                            props={FadeIn()}
                            enabled={window.localStorage.getItem('theme') === 'dark'}
                            onChange={(newState) => {
                                document.body.style.transition = 'all 0.3s';
                                document.body.dataset.theme    = newState ? 'dark' : 'light';
                                window.localStorage.setItem('theme', newState ? 'dark' : 'light');
                                setTimeout(() => {
                                    document.body.style.transition = '';
                                }, 300);
                            }}
            />
            <HLine props={FadeIn()}/>
            <BooleanSetting title='Continuous conversation'
                            description='Whether the live assistant should keep listening after a response. This can be useful for follow-up questions.'
                            props={FadeIn()}
                            enabled={Boolean(window.localStorage.getItem('continuousConversation') ?? 'true')}
                            onChange={(newState) => window.localStorage.setItem('continuousConversation', newState.toString())}/>
        </ScrollableContainer>
    );
}
