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
    const audioElem   = document.createElement('audio');
    audioElem.src     = URL.createObjectURL(audioBlob);
    let revokeUrl     = () => URL.revokeObjectURL(audioElem.src);
    audioElem.onended = revokeUrl;
    audioElem.play().catch(_ => revokeUrl())
    return audioElem;
}

/**
 * Audio device for recording.
 * This can be null if permissions aren't granted.
 * To acquire the MediaRecorder object, one can call
 * `await audioDevice` and then use the MediaRecorder object.
 */
export const audioDevice = new Promise((resolve) => {
    window!.addEventListener('load', async () => {
        const devices  = await navigator.mediaDevices.enumerateDevices();
        const deviceId = devices.find(device =>
                                          device.kind === 'audioinput')?.deviceId;

        resolve(await window.navigator.mediaDevices
                             .getUserMedia({ audio: (deviceId ? { deviceId: { exact: deviceId } } : true) })
                             .then(mediaStream =>
                                       new MediaRecorder(mediaStream, { audioBitsPerSecond: 16000 })
                             )
                             .catch(_ => null));
    })
});
