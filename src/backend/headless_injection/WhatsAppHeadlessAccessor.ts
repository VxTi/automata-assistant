/**
 * @fileoverview WhatsAppHeadlessAccessor.ts
 * @author Luca Warmenhoven
 * @date Created on Wednesday, October 23 - 20:56
 */

import { ipcMain }               from "electron";
import { createInjectionWindow } from "./WindowScriptInjection";

const injection = `
window['balls'] = 'test';
`;

ipcMain.on('whatsapp:send-message', (_, recipient: string, body: string) => {
    createInjectionWindow('https://web.whatsapp.com/', injection, { recipient: recipient, body: body });
});
