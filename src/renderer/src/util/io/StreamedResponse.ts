/**
 * @fileoverview StreamedRequest.ts
 * @author Luca Warmenhoven
 * @date Created on Saturday, October 12 - 11:18
 */

export class StreamedResponse {

    private readonly stream: ReadableStreamDefaultReader<Uint8Array>;
    private readonly controller: AbortController;
    private readonly decoder: TextDecoder;

    /**
     * Constructs a new instance of the StreamedRequest class.
     * This class is used to make streamed requests to the AI.
     * @param response The response object to use.
     */
    constructor(response: Response) {
        this.controller = new AbortController();
        this.stream     = response.body!.getReader();
        this.decoder    = new TextDecoder('utf-8');
    }

    /**
     * Returns the next chunk of data from the stream.
     */
    async* next(): AsyncGenerator<Uint8Array> {
        while ( true ) {
            const { value, done } = await this.stream
                                              .read()

            if ( done ) break;
            yield value;
        }
    }
}
