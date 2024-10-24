/**
 * @fileoverview Encoding.ts
 * @author Luca Warmenhoven
 * @date Created on Saturday, October 19 - 17:16
 */

export function encodeBase64(data: string): string {
    return Buffer.from(data).toString('base64');
}

/**
 * Encode a blob to base64.
 * @param data
 */
export async function encodeBlobToBase64(data: Blob): Promise<string> {
    return new Promise((resolve) => {
        const reader  = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(data);
    });
}

/**
 * Decode a base64 string from a blob.
 * @param data
 * @param type
 */
export function decodeBase64FromBlob(data: string, type: string): Blob {
    if (!('Buffer' in window)) {
        return new Blob([ Uint8Array.from(atob(data), c => c.charCodeAt(0)) ], { type: type });
    }
    return new Blob([ Buffer.from(data, 'binary') ], { type: type });
}

/**
 * Decode a base64 string.
 * @param data
 */
export function decodeBase64(data: string): string {
    return Buffer.from(data, 'base64').toString();
}
