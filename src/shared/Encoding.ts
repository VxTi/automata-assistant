/**
 * @fileoverview Encoding.ts
 * @author Luca Warmenhoven
 * @date Created on Saturday, October 19 - 17:16
 */

export function encodeBase64(data: string): string {
    return Buffer.from(data).toString('base64');
}

export async function encodeBase64Blob(data: Blob): Promise<string> {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(data);
    });
}

export function decodeBase64(data: string): string {
    return Buffer.from(data, 'base64').toString();
}

export function decodeBase64Blob(data: string, type: string): Blob {
    return new Blob([Buffer.from(data, 'base64')], { type: type });
}
