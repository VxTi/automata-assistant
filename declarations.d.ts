declare global {
    declare module '*.glsl' {
        const value: string;
        export default value;
    }
}

export type ISOLanguageCodes = 'en' | 'nl' | ''
