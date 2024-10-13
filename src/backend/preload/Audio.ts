/**
 * @fileoverview Audio.ts
 * @author Luca Warmenhoven
 * @date Created on Friday, October 04 - 15:07
 */

import { contextBridge } from "electron";

/**
 * The audio API.
 * This API is used to play audio and request the microphone.
 */
contextBridge.exposeInMainWorld('audio', {
    /**
     * Play the given audio blob.
     * @param audioBlob The audio blob to play.
     * @returns The audio element that is playing the audio.
     */
    play: function playAudio(audioBlob: Blob): HTMLAudioElement {
        const audioElem   = document.createElement('audio');
        audioElem.src     = URL.createObjectURL(audioBlob);
        let revokeUrl     = () => URL.revokeObjectURL(audioElem.src);
        audioElem.onended = revokeUrl;
        audioElem.play().catch(_ => revokeUrl())
        return audioElem;
    },

    /**
     * Request the audio device and return the media recorder,
     * or null if the device is not available.
     */
    requestMicrophone: async function(): Promise<MediaRecorder | null> {
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
});
