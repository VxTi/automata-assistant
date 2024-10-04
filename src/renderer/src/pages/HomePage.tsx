/**
 * @fileoverview HomePage.tsx
 * @author Luca Warmenhoven
 * @date Created on Friday, October 04 - 12:07
 */
import { ReactNode, useContext } from "react";
import { AssistantPage }         from "./assistant/AssistantPage";
import { ApplicationContext }    from "../util/ApplicationContext";
import { AutomationsPage }       from "./AutomationsPage";

export function HomePage() {

    return (
        <div className="grid grid-rows-3 place-items-center justify-items-center grow">
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