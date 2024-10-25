/**
 * @fileoverview InternetQueryService.ts
 * @author Luca Warmenhoven
 * @date Created on Wednesday, October 23 - 18:43
 */
import { Service }               from "./Services";
import { ChatCompletionSession } from "@renderer/util/completion/ChatCompletionSession";

export class InternetQueryService extends Service<{ query: string, session: ChatCompletionSession }> {

    constructor() {
        super('internet_query');
    }

    /**
     * Invokes the `internet_query` service.
     */
    public invoke(config: { query: string, session: ChatCompletionSession }) {
        console.log('Querying the internet for:', config.query);
        const targetUrl = config.query.match(/^http(s)?:\/\//) ? config.query :
                  'https://google.com/search?q=' + encodeURIComponent(config.query);

        window[ 'fs' ]
            .fetchRemoteResource(targetUrl)
            .then(response => {
                config.session.appendMessage(
                    {
                        content: response.data.replace(/<[^>]*>/g, ''),
                        role: 'assistant'
                    })
            });
    }
}
