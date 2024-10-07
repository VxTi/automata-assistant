/**
 * @fileoverview LiveAssistantPage.tsx
 * @author Luca Warmenhoven
 * @date Created on Sunday, October 06 - 18:52
 */

import { AnnotatedIcon }                 from "../../components/AnnotatedIcon";
import { HomePage }                      from "../HomePage";
import { ApplicationContext }            from "../../util/ApplicationContext";
import { useContext, useEffect, useRef } from "react";

/**
 * Convert a float32 array to a 16-bit PCM array.
 * @param float32Array the float32 array.
 */
function floatTo16BitPCM(float32Array: Float32Array): ArrayBuffer {
    const buffer = new ArrayBuffer(float32Array.length * 2);
    const view   = new DataView(buffer);
    let offset   = 0;
    for ( let i = 0; i < float32Array.length; i++, offset += 2 ) {
        let s = Math.max(-1, Math.min(1, float32Array[ i ]));
        view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    }
    return buffer;
}

/**
 * Converts a Float32Array to base64-encoded PCM16 data
 * @param float32Array The Float32Array to encode
 */
function base64EncodeAudio(float32Array: Float32Array): string {
    const arrayBuffer = floatTo16BitPCM(float32Array);
    let binary        = '';
    let bytes         = new Uint8Array(arrayBuffer);
    const chunkSize   = 0x8000; // 32KB chunk size
    for ( let i = 0; i < bytes.length; i += chunkSize ) {
        let chunk = Array.from(bytes.subarray(i, i + chunkSize));
        binary += String.fromCharCode.apply(null, chunk);
    }
    return btoa(binary);
}

/**
 * The live assistant page.
 */
export function LiveAssistantPage() {

    const { setContent } = useContext(ApplicationContext);
    const canvasRef      = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if ( !canvasRef.current )
            return;

        const canvas = canvasRef.current;
        const ctx    = canvas.getContext('2d');

        if ( !ctx )
            return;

        canvas.width  = window.innerWidth * 2;
        canvas.height = window.innerHeight * 2;

        const audioContext = new (window.AudioContext || window[ 'webkitAudioContext' ])();
        const analyzer     = audioContext.createAnalyser();
        analyzer.fftSize   = 256;
        const dataArray    = new Uint8Array(analyzer.frequencyBinCount);


        /** Acquire the audio stream from the user's microphone. */
        navigator.mediaDevices.getUserMedia({ audio: true, video: false })
                 .then(stream => {
                     const source = audioContext.createMediaStreamSource(stream);
                     source.connect(analyzer);

                     /*const url = "wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-10-01";
                     const ws  = new WebSocket(url, {
                         headers: {
                             'Authorization': 'Bearer ' + process.env.OPENAI_API_KEY,
                             'OpenAI-Beta': 'realtime=v1'
                         }
                     });
                     ws.on('open', () => {
                         let audioDevice: MediaRecorder = new MediaRecorder(stream);

                         audioDevice.ondataavailable = async (event) => {
                             const blobChunk = event.data;
                             const f32Array  = new Float32Array(await blobChunk.arrayBuffer());
                             const base64    = base64EncodeAudio(f32Array);
                         }

                         ws.send(
                             JSON.stringify(
                                 {
                                     type: "response.create",
                                     response: { modalities: [ "text" ], instructions: "Please speak to the user.", }
                                 }));
                     })*/


                 })
                 .catch(() => {
                     setContent(<HomePage/>);
                 });

        const render = () => {
            analyzer.getByteFrequencyData(dataArray);
            // Draw each frequency bar as a peak from the middle of a circle.
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.beginPath();
            ctx.moveTo(canvas.width / 2, canvas.height / 2);
            ctx.fillStyle = 'white';
            ctx.lineWidth   = 2;
            for ( let i = 0; i < dataArray.length; i++ ) {
                //ctx.moveTo(canvas.width / 2, canvas.height / 2);
                const angle = 6 * Math.PI * i / dataArray.length - Math.PI / 2;
                const x     = canvas.width / 2 + Math.cos(angle) * (2 + dataArray[ i ] * 2);
                const y     = canvas.height / 2 + Math.sin(angle) * (2 + dataArray[ i ] * 2);
                ctx.arcTo(x, y, x, y, 1);
            }
            ctx.fill();
            requestAnimationFrame(render);
        }
        render();
    }, [ canvasRef ]);

    return (
        <div className="mx-auto max-w-screen-md w-full flex flex-col grow justify-start">
            <div className="grid grid-cols-3 m-4 items-center">
                <div className="flex items-center justify-start">
                    <AnnotatedIcon path="M15.75 19.5 8.25 12l7.5-7.5"
                                   annotation="Back to menu" side='right'
                                   onClick={() => setContent(<HomePage/>)}/>
                </div>
                <h1 className="text-white text-center text-2xl font-helvetica-neue">Live Assistant</h1>
            </div>
            <div className="flex flex-col grow justify-center items-center">
                <canvas className="w-60 h-60 " ref={canvasRef}/>
            </div>
        </div>
    )
}
