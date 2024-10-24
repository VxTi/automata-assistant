/**
 * @fileoverview SettingsPage.tsx
 * @author Luca Warmenhoven
 * @date Created on Friday, October 18 - 09:16
 */
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { ApplicationContext }                                   from "../contexts/ApplicationContext";
import { ScrollableContainer }                                  from "../components/ScrollableContainer";
import { FadeIn, useAnimationSequence }                         from "../util/AnimationSequence";
import { HLine }                                                from "../components/HLine";
import {
    BooleanSetting
}                                                               from "../components/interactive/settings/BooleanSetting";
import {
    MultiSelectionSetting
}                                                               from "@renderer/components/interactive/settings/MultiSelectionSetting";
import { Icons, InteractiveIcon }                               from "@renderer/components/Icons";
import { playAudio }                                            from "@renderer/util/Audio";
import { Settings }                                             from "@renderer/util/Settings";
import { VoiceType }                                            from "tts";

// The key used to store the voice cache in the window object
const VoiceCacheStorageKey = 'speechSynthesisCache';

export function SettingsPage() {

    const { setHeaderConfig } = useContext(ApplicationContext);
    const containerRef        = useRef<HTMLDivElement>(null);
    useAnimationSequence({ containerRef });

    useEffect(() => {
        setHeaderConfig(() => {
            return { pageTitle: 'Settings' };
        })
    }, []);

    return (
        <ScrollableContainer className="gap-4 p-4" size='sm' elementRef={containerRef}>
            <BooleanSetting title="Personalized messages"
                            description="Allow the assistant to generate a personal profile to create more accurate and personalized responses."
                            props={FadeIn()}
                            enabled={Boolean(Settings.get(Settings.PERSONALIZED_MESSAGES))}
                            onChange={(newState) => Settings.set(Settings.PERSONALIZED_MESSAGES, newState)}
            />
            <BooleanSetting title="Automatically save resources"
                            description="Automatically save files and images that are sent to you to your device."
                            props={FadeIn()}
                            enabled={Boolean(Settings.get(Settings.SAVE_RESOURCES))}
                            onChange={(newState) => Settings.set(Settings.SAVE_RESOURCES, newState)}
            />
            <BooleanSetting title="Automatically save conversations"
                            description="Automatically save conversations to your device."
                            props={FadeIn()}
                            enabled={Boolean(Settings.get(Settings.SAVE_CONVERSATIONS))}
                            onChange={(newState) => Settings.set(Settings.SAVE_CONVERSATIONS, newState)}
            />
            <HLine props={FadeIn()}/>
            <BooleanSetting title="Dark mode"
                            description="Enable dark mode for the application."
                            props={FadeIn()}
                            enabled={Settings.get(Settings.THEME) === 'dark'}
                            onChange={(newState) => {
                                document.body.style.transition = 'all 0.3s';
                                document.body.dataset.theme    = newState ? 'dark' : 'light';
                                Settings.set(Settings.THEME, newState ? 'dark' : 'light')
                                setTimeout(() => {
                                    document.body.style.transition = '';
                                }, 300);
                            }}
            />
            <HLine props={FadeIn()}/>
            <BooleanSetting title='Continuous conversation'
                            description='Whether the live assistant should keep listening after a response. This can be useful for follow-up questions.'
                            props={FadeIn()}
                            enabled={Boolean(Settings.get(Settings.CONTINUOUS_CONVERSATION))}
                            onChange={(newState) => Settings.set(Settings.CONTINUOUS_CONVERSATION, newState)}/>

            <MultiSelectionSetting title='Voice recognition language'
                                   description='The language that the voice recognition system should use.'
                                   onChange={(_, i) => Settings.set(Settings.VOICE_RECOGNITION_LANGUAGE, i)}
                                   currentValue={Number(Settings.get(Settings.VOICE_RECOGNITION_LANGUAGE))}
                                   props={FadeIn()}
                                   options={Settings.LANGUAGES}
            />

            <MultiSelectionVoiceSetting/>
        </ScrollableContainer>
    );
}

/**
 * A custom multi-selection setting for selecting the voice of the assistant.
 * This is a variant of `MultiSelectionSetting` that includes a play button
 * that allows users to preview the voice.
 */
function MultiSelectionVoiceSetting() {
    const [ playing, setPlaying ]             = useState<boolean>(false);
    const [ selectedVoice, setSelectedVoice ] = useState<VoiceType>(Settings.TTS_VOICES[ parseInt(window.localStorage.getItem('voiceIndex') ?? '0') ] as VoiceType);

    useEffect(() => {
        /*
         * If the voice assistant cache isn't available, we'll have to
         * fetch the voice assistant examples and cache them.
         * This cache is stored in the window object on runtime.
         */
        if ( !window[ VoiceCacheStorageKey ] || typeof window[ VoiceCacheStorageKey ] !== 'object' ) {

            window[ VoiceCacheStorageKey ] = {};
            window[ 'ai' ]
                .audio
                .getVoiceAssistantExamples()
                .then(result => {
                    result.data
                          .keys()
                          .forEach(key => {
                              const voiceDataB64   = result.data.get(key)!;
                              const voiceDataBytes = atob(voiceDataB64);
                              const byteArray      = new Uint8Array([ ...voiceDataBytes ].map((_, i) => voiceDataBytes.charCodeAt(i)));

                              window[ VoiceCacheStorageKey ][ key.toLowerCase() ] = new Blob([ byteArray ], { type: 'audio/wav' });
                          });
                });
        }
    }, []);

    const playVoice = useCallback(() => {
        setPlaying( !playing);

        // Doesn't immediately update 'playing' state due to Reacts asynchronous-ness
        if ( !playing ) {
            if ( !window[ VoiceCacheStorageKey ] ) {
                console.error('Voice data not found in cache');
                return;
            }

            const voiceBlob = window[ VoiceCacheStorageKey ][ selectedVoice.toLowerCase() ];

            if ( !voiceBlob ) {
                console.error('Voice not found in cache', voiceBlob, selectedVoice);
                return;
            }

            console.log('Playing voice', selectedVoice);

            window[ VoiceCacheStorageKey ].playing          = playAudio(voiceBlob);
            window[ VoiceCacheStorageKey ].playing!.onended = () => setPlaying(false);
            return;
        }
        window[ 'VoiceCacheStorageKey' ].playing?.stop?.();

    }, [ selectedVoice, playing ]);


    return (
        <MultiSelectionSetting
            title='Assistant Voice'
            description='The voice that the assistant should use.'
            onChange={(voice: string, idx: number) => {
                setSelectedVoice(voice as VoiceType);
                Settings.set(Settings.ASSISTANT_VOICE_TYPE, idx);
                console.log('Selected voice', voice, idx);
            }}
            props={FadeIn()}
            options={Settings.TTS_VOICES}
            currentValue={Number(Settings.get(Settings.ASSISTANT_VOICE_TYPE))}
            extraOption={
                <div className="flex flex-row items-center rounded-lg max-w-max px-1">
                    <InteractiveIcon
                        className={`rounded-full p-1.5 ${playing ? 'text-red-500' : 'text-green-500'}`}
                        icon={playing ? <Icons.Stop/> : <Icons.Play/>}
                        onClick={playVoice}/>
                </div>
            }
        />
    )
}
