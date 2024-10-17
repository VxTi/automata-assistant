/**
 * @fileoverview ImageLibraryPage.tsx
 * @author Luca Warmenhoven
 * @date Created on Wednesday, October 16 - 19:57
 */
import { useContext, useEffect, useRef, useState } from "react";
import { CreateSequence, useAnimationSequence }    from "../util/AnimationSequence";
import { ApplicationContext }                      from "../util/ApplicationContext";

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
    const cardRef             = useRef<HTMLSpanElement>(null);
    const [ scale, setScale ] = useState(1);

    useEffect(() => {
        if ( !cardRef.current )
            return;
        const observer = new IntersectionObserver((entries) => {
                console.log(entries);
            entries.forEach(entry => {
                if ( entry.isIntersecting ) {
                    // Fully visible
                    setScale(1);
                }
                else {
                    // Scale down based on intersection ratio
                    const ratio = Math.max(0, entry.intersectionRatio);
                    setScale(1 - (1 - ratio) * 0.5); // Adjust scaling factor as needed
                }
            });
        }, { threshold: [0, .5, 1] }); // thresholds from 0 to 1

        observer.observe(cardRef.current);

        return () => {
            observer.unobserve(cardRef.current!);
        };
    }, [ cardRef ]);
    return (
        <span
            {...CreateSequence('fadeIn', 500, 35)}
            className="bg-no-repeat bg-cover bg-center w-full h-80 rounded-xl"
            style={{
                backgroundImage: `url(${props.src})`,
                transform: `scale(${scale})`,
                transition: 'transform 0.5s ease'
            }}/>
    )
}
