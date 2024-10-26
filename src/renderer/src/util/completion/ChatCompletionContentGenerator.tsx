/**
 * @fileoverview ChatCompletionContentGenerator.tsx
 * @author Luca Warmenhoven
 * @date Created on Wednesday, October 23 - 12:41
 */
import { Dispatch, ReactNode, SetStateAction } from "react";
import {
    ComposedMessageFragment,
    FileListFragment,
    MessageFragment
}                                              from "@renderer/util/completion/ChatCompletionMessageFragments";
import { MessageRole }                         from "llm";

/**
 * The chat completion content generator.
 * This class is used to generate the content for a completion,
 * in React nodes.
 * This will generate JSON nodes that can be rendered in the completion.
 */
export class ChatCompletionContentGenerator {

    private _reactDispatchListener: Dispatch<SetStateAction<void>> | undefined;

    /**
     * The generated fragments for the completion.
     * This can be parsed into React nodes to render the completion
     * using the `content` getter.
     */
    private _composedFragments: ComposedMessageFragment[] = [];

    /**
     * Getter for the generated React nodes for the completion.
     * @return The generated React nodes.
     */
    public get content(): ReactNode[] {
        return this._composedFragments.map((composedFragment, i) => {
            return (
                <div key={i} className="flex flex-col">
                    {composedFragment.fragments.map((fragment, j) => {

                        switch ( fragment.type ) {
                            case "file-list":
                                return (
                                    <div key={j} className="flex flex-col">
                                        {fragment.files.map((file, k) => {
                                            return (
                                                <div key={k} className="flex flex-row items-center">
                                                    <span className="text-sm font-bold">{file.name}</span>
                                                    <span className="text-sm text-gray-400 ml-2">{file.size}</span>
                                                </div>
                                            )
                                        })}
                                    </div>
                                );
                            case 'text':
                                return <span key={j} className="text-sm"
                                             dangerouslySetInnerHTML={{ __html: fragment.content }}></span>

                            case "image":
                                const [ width, height ] = (fragment.dimensions as string).split('x').map(Number);
                                return (
                                    <img key={j} src={fragment.url} alt={fragment.alt} width={width} height={height}/>
                                );
                            case 'executable':
                                return (
                                    <div className="bg-black text-white">{fragment.content}</div>
                                );
                        }
                        return null;
                    })}
                </div>
            )
        })
    }

    /**
     * Sets the React dispatch listener.
     * This listener will be called when the content of the completion changes.
     * @param listener The listener to call
     */
    public setReactDispatchListener(listener: Dispatch<SetStateAction<void>>) {
        this._reactDispatchListener = listener;
    }

    /**
     * Appends fragments to the fragment node list.
     * If the last fragment is of the same origin, the fragment will be appended to the last fragment,
     * otherwise a new fragment node will be created.
     */
    public appendFragment(fragment: MessageFragment, roleOrigin: MessageRole) {

        const lastIdx = this._composedFragments.length - 1;

        // If there are no previous fragments, or the last fragment is not of the same origin, create a new fragment
        // node
        if ( this._composedFragments.length === 0 || this._composedFragments[ lastIdx ].role !== roleOrigin ) {

            // If the fragment is a file, we'll create a new file list fragment
            if ( fragment.type === 'file' ) {
                this._composedFragments.push(
                    { fragments: [ { type: 'file-list', files: [ fragment ] } ], role: roleOrigin });

                return;
            }
            this._composedFragments.push({ fragments: [ fragment ], role: roleOrigin });
            return;
        }

        // If the last fragment is a file list, and the new fragment is a file, append the file to the file list
        if (
            this._composedFragments[ lastIdx ]
                .fragments[ this._composedFragments[ lastIdx ].fragments.length - 1 ]
                .type === 'file-list' &&
            fragment.type === 'file'
        ) {
            (this._composedFragments[ lastIdx ]
                .fragments[ this._composedFragments[ lastIdx ].fragments.length - 1 ] as FileListFragment)
                .files.push(fragment);
            return;
        }

        // Append the fragment to the last fragment node
        this._composedFragments[ lastIdx ].fragments.push(fragment);

        this._session.callUpdateListener();
    }
}
