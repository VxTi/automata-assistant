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

    useEffect(() => {
        setHeaderConfig(() => {
                            return {
                                pageTitle: 'Image Library',
                            }
                        }
        );
    }, []);

    return (
        <div className="flex flex-col justify-start items-center w-full grow m-4">
            <div
                className="w-full mx-auto max-w-screen-lg grid grid-cols-3 lg:grid-cols-4 gap-2 overflow-y-scroll rounded-xl"
                ref={containerRef}>
                <Image src="https://placehold.co/600x400"/>
                <Image src="https://placehold.co/600x400"/>
                <Image src="https://placehold.co/600x400"/>
                <Image src="https://placehold.co/600x400"/>
                <Image src="https://placehold.co/600x400"/>
                <Image src="https://placehold.co/600x400"/>
                <Image src="https://placehold.co/600x400"/>
                <Image src="https://placehold.co/600x400"/>
                <Image src="https://placehold.co/600x400"/>
                <Image src="https://placehold.co/600x400"/>
                <Image src="https://placehold.co/600x400"/>
                <Image src="https://placehold.co/600x400"/>
                <Image src="https://placehold.co/600x400"/>
                <Image src="https://placehold.co/600x400"/>
                <Image src="https://placehold.co/600x400"/>
                <Image src="https://placehold.co/600x400"/>
                <Image src="https://placehold.co/600x400"/>
                <Image src="https://placehold.co/600x400"/>

            </div>
        </div>
    )
}

function Image(props: { src: string }) {
    return (
        <span
            {...CreateSequence('fadeIn', 700, 50)}
            className="bg-no-repeat bg-cover bg-center w-full h-80 rounded-xl"
            style={{ backgroundImage: `url(${props.src})` }}/>
    )
}
