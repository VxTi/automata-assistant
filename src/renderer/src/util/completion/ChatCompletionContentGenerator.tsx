/**
 * @fileoverview ChatCompletionContentGenerator.tsx
 * @author Luca Warmenhoven
 * @date Created on Wednesday, October 23 - 12:41
 */
import { ChatCompletionSession }                    from "@renderer/util/completion/ChatCompletionSession";
import { FC, ReactNode }                            from "react";
import { ComposedMessageFragment, MessageFragment } from "@renderer/util/completion/ChatCompletionMessageFragments";
import { MessageRole }                              from "llm";

/**
 * The chat completion content generator.
 * This class is used to generate the content for a completion,
 * in React nodes.
 * This will generate JSON nodes that can be rendered in the completion.
 */
export class ChatCompletionContentGenerator {

    /** The completion session. */
    private readonly _session: ChatCompletionSession;

    /**
     * The generated fragments for the completion.
     * This can be parsed into React nodes to render the completion
     * using the `content` getter.
     */
    private _composedFragments: ComposedMessageFragment[] = [];

    /**
     * Constructor for the chat completion content generator.
     */
    constructor(session: ChatCompletionSession) {
        this._session = session;
    }


    /**
     * Getter for the generated React nodes for the completion.
     * @return The generated React nodes.
     */
    public get content(): ReactNode[] {
        return this._composedFragments.map((fragment, i) => {
            return (
                <div key={i} className="flex flex-col">
                    {fragment.fragments.map((f, j) => {
                        switch (f.type) {
                            case "file":

                                break;
                        };
                    })}
                </div>
            )
        })
    }

    /**
     * Appends fragments to the fragment node list.
     * If the last fragment is of the same origin, the fragment will be appended to the last fragment,
     * otherwise a new fragment node will be created.
     */
    public appendFragment(fragment: MessageFragment, roleOrigin: MessageRole) {
        // If no fragments are present, create a new fragment node and return
        if ( this._composedFragments.length === 0 ) {
            this._composedFragments.push({ fragments: [ fragment ], role: roleOrigin });
            return;
        }

        // Check whether the last fragment is of the same origin
        const last = this._composedFragments[ this._composedFragments.length - 1 ];
        if ( last.role === roleOrigin ) {
            last.fragments.push(fragment);
            return;
        }

        this._composedFragments.push({ fragments: [ fragment ], role: roleOrigin });
    }
}
