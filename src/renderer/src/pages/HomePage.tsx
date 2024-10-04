/**
 * @fileoverview HomePage.tsx
 * @author Luca Warmenhoven
 * @date Created on Friday, October 04 - 12:07
 */
import { ReactNode, useContext, useEffect, useRef } from "react";
import { AssistantPage }                            from "./assistant/AssistantPage";
import { ApplicationContext }                       from "../util/ApplicationContext";
import { AutomationsPage }                          from "./AutomationsPage";
import { Shader }                                   from "../util/Shader";
import { VBO }                                      from "../util/VBO";

export function HomePage() {

    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if ( !canvasRef.current )
            return;

        const canvas = canvasRef.current;
        const gl     = canvas.getContext('webgl2');

        if ( !gl )
            return;

        let time = 0;
        let lastTimeMillis = Date.now();

        canvas.width  = window.innerWidth;
        canvas.height = window.innerHeight;
        const shader  = new Shader(gl, fragmentShader);
        const vbo     = new VBO(gl, shader);
        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.clearColor(0, 0, 0, 1);
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

        const render = () => {
            vbo.gl.clearColor(0.0, 0.0, 0.0, 0.0);
            vbo.gl.clear(vbo.gl.COLOR_BUFFER_BIT);
            shader.use();
            vbo.gl.uniform1f(vbo.gl.getUniformLocation(vbo.shader.program, 'time'), time / 1000);

            const currentTimeMillis = Date.now();
            const deltaTime = currentTimeMillis - lastTimeMillis;
            time += deltaTime;
            lastTimeMillis = Date.now();

            vbo.render(window.innerWidth, window.innerHeight);
            requestAnimationFrame(render);
        }
        render();

    }, [ canvasRef ]);

    return (
        <div className="relative grow flex flex-col justify-center">
            <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none"/>
            <div className="grid grid-rows-3 place-items-center justify-items-center z-10">
                <div>
                    <h1 className="text-white text-4xl my-5 text-center font-sans">Welcome back.</h1>
                    <span className="text-white text-sm my-1 text-center font-sans">Select any of the below tasks to get started.</span>
                </div>
                <div>
                    <div className="flex flex-row justify-center items-stretch max-w-sm">
                        <FeatureCard title="Assistant" description="" targetPage={<AssistantPage/>}/>
                        <FeatureCard title="Automations" description="Automate shit" targetPage={<AutomationsPage/>}/>
                    </div>
                </div>
            </div>
        </div>
    )
}

function FeatureCard(props: { title: string, description: string, targetPage: ReactNode }) {
    const { setContent } = useContext(ApplicationContext);
    return (
        <div
            className="flex flex-col justify-center hover:bg-gray-700 hover:cursor-pointer duration-1000 transition-colors items-center rounded-lg border-[1px] border-solid border-gray-700 bg-gray-800 p-4 m-3 select-none"
            onClick={() => setContent(props.targetPage)}>
            <h2 className="text-white text-lg">{props.title}</h2>
            <p className="text-white text-sm">{props.description}</p>
        </div>
    )
}

const fragmentShader = `
precision mediump float;

uniform float time;        // Uniform to pass time from JavaScript
uniform vec2 iResolution;  // Resolution of the screen

// CPPN function for smoother gradients
vec3 cppn(vec2 pos, float time) {
    float x = (pos.x * 2.0 - 1.0) * .2;
    float y = (pos.y * 2.0 - 1.0) * .2 + sin(time * 0.1) * 0.1;
    x *= iResolution.x / iResolution.y;  // Correct aspect ratio

    // Smooth gradient using positional coordinates instead of radial focus
    float red   = 0.5 + 0.5 * sin(x * 5.0 + time * 0.1);    // Smooth gradient across x-axis
    float green = 0.5 + 0.5 * cos(y * 5.0 + time * 0.2);    // Smooth gradient across y-axis
    float blue  = 0.5 + 0.5 * sin((x + y) * 5.0 + time * 0.3); // Combined x-y gradient

    // Return the combined color
    return vec3(red, green, blue);
}

void main() {
    // Normalize pixel coordinates and maintain aspect ratio
    vec2 uv = gl_FragCoord.xy / iResolution;

    // Calculate the gradient color using the CPPN function
    vec3 color = cppn(uv, time);
    
    // Output the final color
    gl_FragColor = vec4(color, 1.0);
}
`;