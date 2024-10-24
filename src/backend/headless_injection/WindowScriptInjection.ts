/**
 * @fileoverview WindowScriptInjection.ts
 * @author Luca Warmenhoven
 * @date Created on Wednesday, October 23 - 20:45
 */

import { BrowserWindow } from 'electron';

export const WEB_INJECTED_IDENTIFIER = 'fragment-' + Math.random().toString(32).substring(2).toUpperCase();

/**
 * Creates a browser window with a given configuration and
 * a script that is injected.
 * @param url The web page to load, often a remote, closed-source website.
 * @param script The script to execute
 * @param parameters The parameters to supply to the window.
 */
export function createInjectionWindow(url: string, script: string, parameters: Record<string, string>) {
    const window          = new BrowserWindow(
        {
            show: false,
            webPreferences: { contextIsolation: false }
        });
    const globalVariables = `\`window[${WEB_INJECTED_IDENTIFIER}] = {\n${Object.entries(parameters)
                                                                               ?.map(([ key, value ]) => {
                                                                                   return `${key}: ${JSON.stringify(value)}`
                                                                               }).join(',\n')}};`;
    window.loadURL(url);
    window.on('ready-to-show', () => {
        window.show();
        console.log("Exposing global variable as ", WEB_INJECTED_IDENTIFIER);
        console.log("Global variables", globalVariables)
        window
            .webContents
            .executeJavaScript(
                `${globalVariables}\n${script}`)
            .catch(console.error);
    });
    return window;
}
