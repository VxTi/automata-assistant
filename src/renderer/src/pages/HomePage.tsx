/**
 * @fileoverview HomePage.tsx
 * @author Luca Warmenhoven
 * @date Created on Friday, October 04 - 12:07
 */
import { ReactNode, useContext, useEffect, useRef } from "react";
import { AssistantPage }                            from "./assistant/AssistantPage";
import { ApplicationContext }                       from "../util/ApplicationContext";
import { AutomationsListPage }                      from "./automations/AutomationsListPage";
import { Shader }                                   from "../util/Shader";
import { VBO }                                      from "../util/VBO";
import { LiveAssistantPage }                        from "./live-assistant/LiveAssistantPage";
import fragmentShader                           from "./home_page_shader.glsl";
import { CreateSequence, useAnimationSequence } from "../util/AnimationSequence";

export function HomePage() {

    const canvasRef    = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    useAnimationSequence({ containerRef: containerRef });

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
            const deltaTime         = currentTimeMillis - lastTimeMillis;
            time += deltaTime;
            lastTimeMillis          = Date.now();

            vbo.render(window.innerWidth, window.innerHeight);
            requestAnimationFrame(render);
        }
        render();

    }, [ canvasRef ]);

    return (
        <div className="grow flex flex-col justify-center">
            <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none"/>
            <div className="grid grid-rows-3 place-items-center justify-items-center z-10" ref={containerRef}>
                <div className="mb-3">
                    <h1 className="text-white font-bold text-4xl sm:text-6xl my-5 text-center font-helvetica-neue"
                        {...CreateSequence('fadeIn', 800, 40)}>
                        Welcome back</h1>
                    <span className="text-white text-sm sm:text-2xl my-1 text-center font-helvetica-neue"
                          {...CreateSequence('fadeIn', 800, 40)}>Select any of the below tools to get started.</span>
                </div>
                <div className="flex flex-row justify-center items-center w-full max-w-screen-md flex-wrap">
                    <FeatureCard title="Assistant" thumbnail={
                        <svg fill="currentColor" viewBox="0 0 24 24"
                             xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                            <path clipRule="evenodd" fillRule="evenodd"
                                  d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z"></path>
                        </svg>
                    } targetPage={<AssistantPage/>}/>
                    <FeatureCard title="Automations" thumbnail={
                        <svg fill="currentColor" viewBox="0 0 24 24"
                             xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                            <path clipRule="evenodd" fillRule="evenodd"
                                  d="M9.315 7.584C12.195 3.883 16.695 1.5 21.75 1.5a.75.75 0 0 1 .75.75c0 5.056-2.383 9.555-6.084 12.436A6.75 6.75 0 0 1 9.75 22.5a.75.75 0 0 1-.75-.75v-4.131A15.838 15.838 0 0 1 6.382 15H2.25a.75.75 0 0 1-.75-.75 6.75 6.75 0 0 1 7.815-6.666ZM15 6.75a2.25 2.25 0 1 0 0 4.5 2.25 2.25 0 0 0 0-4.5Z"></path>
                            <path
                                d="M5.26 17.242a.75.75 0 1 0-.897-1.203 5.243 5.243 0 0 0-2.05 5.022.75.75 0 0 0 .625.627 5.243 5.243 0 0 0 5.022-2.051.75.75 0 1 0-1.202-.897 3.744 3.744 0 0 1-3.008 1.51c0-1.23.592-2.323 1.51-3.008Z"></path>
                        </svg>
                    } targetPage={<AutomationsListPage/>}/>
                    <FeatureCard title="Live Assistant"
                                 thumbnail={
                                     <svg data-slot="icon" fill="currentColor" viewBox="0 0 24 24"
                                          xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                                         <path clipRule="evenodd" fillRule="evenodd"
                                               d="M9 4.5a.75.75 0 0 1 .721.544l.813 2.846a3.75 3.75 0 0 0 2.576 2.576l2.846.813a.75.75 0 0 1 0 1.442l-2.846.813a3.75 3.75 0 0 0-2.576 2.576l-.813 2.846a.75.75 0 0 1-1.442 0l-.813-2.846a3.75 3.75 0 0 0-2.576-2.576l-2.846-.813a.75.75 0 0 1 0-1.442l2.846-.813A3.75 3.75 0 0 0 7.466 7.89l.813-2.846A.75.75 0 0 1 9 4.5ZM18 1.5a.75.75 0 0 1 .728.568l.258 1.036c.236.94.97 1.674 1.91 1.91l1.036.258a.75.75 0 0 1 0 1.456l-1.036.258c-.94.236-1.674.97-1.91 1.91l-.258 1.036a.75.75 0 0 1-1.456 0l-.258-1.036a2.625 2.625 0 0 0-1.91-1.91l-1.036-.258a.75.75 0 0 1 0-1.456l1.036-.258a2.625 2.625 0 0 0 1.91-1.91l.258-1.036A.75.75 0 0 1 18 1.5ZM16.5 15a.75.75 0 0 1 .712.513l.394 1.183c.15.447.5.799.948.948l1.183.395a.75.75 0 0 1 0 1.422l-1.183.395c-.447.15-.799.5-.948.948l-.395 1.183a.75.75 0 0 1-1.422 0l-.395-1.183a1.5 1.5 0 0 0-.948-.948l-1.183-.395a.75.75 0 0 1 0-1.422l1.183-.395c.447-.15.799-.5.948-.948l.395-1.183A.75.75 0 0 1 16.5 15Z"></path>
                                     </svg>
                                 } targetPage={<LiveAssistantPage/>}/>
                </div>
            </div>
        </div>
    )
}

/**
 * FeatureCard
 * A card that represents a feature on the home page
 * @constructor
 */
function FeatureCard(props: { title: string, thumbnail: JSX.Element, targetPage: ReactNode }) {
    const { setContent } = useContext(ApplicationContext);
    return (
        <div
            {...CreateSequence('fadeIn', 800, 40)}
            className="flex flex-col basis-40 justify-center hover:bg-gray-700 hover:cursor-pointer duration-500 transition-colors items-center rounded-lg border-[1px] border-solid border-gray-700 bg-gray-800 p-5 m-3 select-none"
            onClick={() => setContent(props.targetPage)}>
            <div className="text-white w-14 h-14">
                {props.thumbnail}
            </div>
            <h2 className="text-white mt-2 text-md sm:text-lg">{props.title}</h2>
        </div>
    )
}
