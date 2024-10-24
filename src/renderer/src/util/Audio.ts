/**
 * @fileoverview Audio.ts
 * @author Luca Warmenhoven
 * @date Created on Friday, October 04 - 15:07
 */


/**
 * Play an audio blob
 * @param audioBlob The audio blob to play
 */
export function playAudio(audioBlob: Blob): HTMLAudioElement {
    const audioElement = document.createElement('audio');
    audioElement.src   = URL.createObjectURL(audioBlob);

    let revokeUrl = () => URL.revokeObjectURL(audioElement.src);

    audioElement.onended = revokeUrl;
    audioElement.onerror = (error) => {
        console.error('Failed to load audio', error);
        revokeUrl();
    };
    audioElement.play().catch(_ => {
        console.error('Failed to play audio', _);
        revokeUrl()
    })
    return audioElement;
}

