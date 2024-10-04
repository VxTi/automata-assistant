/**
 * @fileoverview Audio.ts
 * @author Luca Warmenhoven
 * @date Created on Friday, October 04 - 15:07
 */

/**
 * Play the given audio blob.
 * @param audioBlob The audio blob to play.
 */
export function playAudio(audioBlob: Blob) {
    const audioElem   = document.createElement('audio');
    audioElem.src     = URL.createObjectURL(audioBlob);
    let revokeUrl     = () => URL.revokeObjectURL(audioElem.src);
    audioElem.onended = revokeUrl;
    audioElem.play().catch(_ => revokeUrl())
}

/**
 * Request the audio device and return the media recorder,
 * or null if the device is not available.
 */
export async function requestMicrophoneAccess(): Promise<MediaRecorder | null> {
    // Request microphone access
    const devices  = await navigator.mediaDevices.enumerateDevices();
    const deviceId = devices.find(device =>
                                      device.kind === 'audioinput')?.deviceId;

    return await window.navigator.mediaDevices
                       .getUserMedia({ audio: (deviceId ? { deviceId: { exact: deviceId } } : true) })
                       .then(mediaStream =>
                                 new MediaRecorder(mediaStream, { audioBitsPerSecond: 16000 })
                       )
                       .catch(_ => null);
}