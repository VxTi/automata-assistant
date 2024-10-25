/**
 * @fileoverview ChatCompletionMessageFragments.ts
 * @author Luca Warmenhoven
 * @date Created on Friday, October 25 - 18:24
 */

import { ImageDimensions } from "stable-diffusion";
import { MessageRole }     from "llm";

/**
 * The base fragment.
 * This contains the type of the fragment,
 * which is used for content generation.
 */
interface FragmentBase {
    type: string;
}

/**
 * The text fragment.
 * Text fragments are used to represent ordinary text in the completion.
 */
export interface TextFragment extends FragmentBase {
    /** The content of the text fragment. */
    content: string

    type: 'text';
}

/**
 * The image fragment.
 * Image fragments are used to represent images in the completion.
 */
export interface ImageFragment extends FragmentBase {
    /** The URL of the image. */
    url: string;

    /** The alt text of the image. */
    alt: string;

    /** The dimensions of the image. */
    dimensions: ImageDimensions

    type: 'image';
}

/**
 * The file fragment.
 * File fragments are used to represent files in the completion.
 */
export interface FileFragment extends FragmentBase {
    /** The URL of the file. */
    url: string;

    /** The alt text of the file. */
    name: string;

    /** The size of the file. */
    size: number;

    type: 'file';
}

/**
 * The file list fragment.
 * File list fragments are used to represent a list of files in the completion.
 * Every file sent is pushed into a file list, which makes
 * file list fragments useful for representing multiple files.
 */
export interface FileListFragment extends FragmentBase {
    files: FileFragment[];

    type: 'file-list';
}

/**
 * The executable fragment.
 * Executable fragments are used to represent executable code in the completion.
 */
export interface ExecutableFragment extends FragmentBase {

    /** The executable content. */
    content: string;

    type: 'executable';
}

/**
 * The message fragment.
 * Message fragments are used to represent messages in the completion.
 */
export type MessageFragment = TextFragment | ImageFragment | FileFragment;

/**
 * The composed message fragment.
 * Composed message fragments are used to represent messages in the completion.
 */
export interface ComposedMessageFragment {
    /** The role of the message. */
    role: MessageRole;

    /** The fragments of the message. */
    fragments: MessageFragment[];
}
