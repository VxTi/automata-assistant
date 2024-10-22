/**
 * @fileoverview Settings.ts
 * @author Luca Warmenhoven
 * @date Created on Tuesday, October 22 - 11:21
 */

interface Setting<T> {
    key: string,
    defaultValue: T;
    allowedValues?: (T)[];
}

export const Settings = {

    LANGUAGES:  [ 'English', 'Dutch', 'German', 'French', 'Spanish', 'Italian', 'Russian', 'Chinese', 'Japanese', 'Korean' ],
    ISO_LANGUAGES: [ 'en', 'nl', 'de', 'fr', 'es', 'it', 'ru', 'zh', 'ja', 'ko' ],
    TTS_VOICES: [ 'Nova', 'Alloy', 'Echo', 'Fable', 'Onyx', 'Shimmer' ],

    THEME: {
        key: 'system.theme',
        defaultValue: 'dark',
    } as Setting<'dark' | 'light'>,

    CONTINUOUS_CONVERSATION: {
        key: 'conversation.continuous_listening',
        defaultValue: true,
    } as Setting<boolean>,

    SAVE_CONVERSATIONS: {
        key: 'conversation.save_conversations',
        defaultValue: true
    } as Setting<boolean>,

    ASSISTANT_VOICE_TYPE: {
        key: 'conversation.assistant.voice',
        defaultValue: 0
    } as Setting<number>,

    /**
     * Setting for saving resources.
     * Saving resources
     */
    SAVE_RESOURCES: {
        key: 'conversation.save_resources',
        defaultValue: true
    } as Setting<boolean>,

    /**
     * Setting for personalized messages.
     * Personalized messages is a feature where the application / assistant
     * saves information about your conversations locally to create a better image
     * of who it is talking to. This makes it able to remember who you are, and what you like.
     */
    PERSONALIZED_MESSAGES: {
        key: 'conversation.personalized_messages',
        defaultValue: true
    } as Setting<boolean>,

    /**
     * Setting for voice recognition language.
     * This mostly affects the quality of the speech transcription,
     * and will not necessarily have any other effect.
     * This value is stored as an index, referring to the ISO languages defined
     * at the top of this file.
     */
    VOICE_RECOGNITION_LANGUAGE: {
        key: 'conversation.voice_recognition_language',
        defaultValue: 0
    } as Setting<number>,

    /**
     * Returns the value of a setting from local storage,
     * or the default value if the setting hasn't been updated yet.
     * @param setting The setting to retrieve.
     */
    get: function <T>(setting: Setting<T>): string | T {
        return (window.localStorage.getItem(setting.key) ?? setting.defaultValue)
    },

    /**
     * Updates the value of a setting in local storage.
     * This will save the setting with the given key to local storage
     * with the given value.
     * @param setting The setting to update
     * @param value The new value of the setting
     */
    set: function <T>(setting: Setting<T>, value: T): void {
        window.localStorage.setItem(setting.key, String(value));
    }
}
