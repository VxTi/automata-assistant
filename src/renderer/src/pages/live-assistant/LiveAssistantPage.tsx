/**
 * @fileoverview LiveAssistantPage.tsx
 * @author Luca Warmenhoven
 * @date Created on Sunday, October 06 - 18:52
 */

import { ApplicationContext }            from "../../util/ApplicationContext";
import { useContext, useEffect, useRef } from "react";
import { Shader }                        from "../../util/rendering/Shader";
import fragmentShader                    from "./audio_visualizer_shader.glsl";
import { VBO }                           from "../../util/rendering/VBO";

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
        const gl     = canvas.getContext('webgl2');

        if ( !gl )
            return;

        let time           = 0;
        let lastTimeMillis = Date.now();

        canvas.width  = window.innerWidth * 2;
        canvas.height = window.innerHeight * 2;

        const audioContext = new (window.AudioContext || window[ 'webkitAudioContext' ])();
        const analyzer     = audioContext.createAnalyser();
        analyzer.fftSize   = 256;
        const dataArray    = new Uint8Array(analyzer.frequencyBinCount);

        const shader = new Shader(gl, fragmentShader,
                                  '#version 300 es\n' +
                                      'in vec2 position;\n' +
                                      'void main() {\n' +
                                      'gl_Position = vec4(position, 0.0, 1.0);' +
                                      '\n}');
        const vbo    = new VBO(gl, shader);
        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.clearColor(0, 0, 0, 1);
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);


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

                 });

        const audioBubbleCount = 12;
        const audioBubbles     = new Float32Array(audioBubbleCount);

        const render = () => {
            analyzer.getByteFrequencyData(dataArray);
            gl.clearColor(0.0, 0.0, 0.0, 0.0);
            gl.clear(vbo.gl.COLOR_BUFFER_BIT);
            shader.use();
            gl.uniform1f(vbo.gl.getUniformLocation(vbo.shader.program, 'time'), time / 1000);

            const currentTimeMillis = Date.now();
            const deltaTime         = currentTimeMillis - lastTimeMillis;
            time += deltaTime;
            lastTimeMillis          = Date.now();
            // Clear bubble array
            audioBubbles.fill(0);
            for ( let i = 0; i < dataArray.length; i++ ) {
                audioBubbles[ i % audioBubbleCount ] = Math.max((dataArray[ i ] / 255.0) * 15, audioBubbles[ i % audioBubbleCount ]);
            }

            vbo.gl.uniform1fv(vbo.gl.getUniformLocation(vbo.shader.program, 'audioLevels'), audioBubbles);

            vbo.render(window.innerWidth, window.innerHeight);
            requestAnimationFrame(render);
        }
        render();
    }, [ canvasRef ]);

    return (
        <div className="mx-auto max-w-screen-md w-full flex flex-col grow justify-start">
            <div className="flex flex-col items-center m-4">
                <h1 className="text-white text-center text-2xl">Live Assistant</h1>
            </div>
            <div className="flex flex-col grow justify-center items-center">
                <canvas className="w-60 h-60 " ref={canvasRef}/>
            </div>
        </div>
    )
}
