/**
 * @fileoverview EmailService.ts
 * @author Luca Warmenhoven
 * @date Created on Wednesday, October 23 - 19:28
 */

import { Service } from "./Services";
import { ChatCompletionSession } from "@renderer/util/completion/ChatCompletionSession";

export class EmailService extends Service<{ recipient: string, topic: string, body: string, session: ChatCompletionSession, attachments?: string[] }> {

    constructor() {
        super('send_email');
    }

    /**
     * Invokes the `email` service.
     */
    public invoke(config: { recipient: string, topic: string, body: string, session: ChatCompletionSession, attachments?: string[] }) {
        config.session.appendMessage(
            {
                content: 'Sending email:\n' + 'To: ' + config.recipient + '\nSubject: ' + config.topic + '\nContent: ' + config.body,
                role: 'assistant'
            }
        )
    }
}
