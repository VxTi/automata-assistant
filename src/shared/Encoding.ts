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
    const arrayBuffer = await data.arrayBuffer();
    const u8 = new Uint8Array(arrayBuffer);

    // Create a binary string using a loop
    let binaryString = '';
    for ( let i = 0; i < u8.length; i++ ) {
        binaryString += String.fromCharCode(u8[ i ]);
    }

    // Convert the binary string to base64
    return btoa(binaryString);
}
