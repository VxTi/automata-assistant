/**
 * @fileoverview ImageLibraryPage.tsx
 * @author Luca Warmenhoven
 * @date Created on Wednesday, October 16 - 19:57
 */
import { useContext, useEffect, useRef }        from "react";
import { CreateSequence, useAnimationSequence } from "../util/AnimationSequence";
import { ApplicationContext }                   from "../util/ApplicationContext";

export function ImageLibraryPage() {

    const { setHeaderConfig } = useContext(ApplicationContext);
    const containerRef        = useRef<HTMLDivElement>(null);
    useAnimationSequence({ containerRef });

    console.log("Rendering")

    useEffect(() => {
        setHeaderConfig(() => {
                            return {
                                pageTitle: 'Image Library',
                            }
                        }
        );
    }, []);

    return (
        <div className="flex flex-col justify-start items-center grow m-4">
            <div
                className="w-full mx-auto max-w-screen-lg grid grid-cols-3 lg:grid-cols-4 gap-2 grow overflow-y-scroll rounded-xl"
                ref={containerRef}>
                {Array(50).fill(0).map((_, i) => (
                    <Image key={i} src={`https://placehold.co/600x400?text=${i}`}/>
                ))}
            </div>
        </div>
    )
}

function Image(props: { src: string }) {

    return (
        <span
            {...CreateSequence('fadeIn', 500, 35)}
            className="bg-no-repeat bg-cover bg-center w-full h-80 rounded-xl"
            style={{ backgroundImage: `url(${props.src})`, }}/>
    )
}
