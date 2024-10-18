/**
 * @fileoverview ImageLibraryPage.tsx
 * @author Luca Warmenhoven
 * @date Created on Wednesday, October 16 - 19:57
 */
import { useContext, useEffect, useRef }        from "react";
import { CreateSequence, useAnimationSequence } from "../util/AnimationSequence";
import { ApplicationContext }                   from "../contexts/ApplicationContext";
import { ScrollableContainer }                  from "../components/ScrollableContainer";

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
        <ScrollableContainer>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 rounded-xl min-w-max max-w-screen-lg" ref={containerRef}>
                {Array(50).fill(0).map((_, i) => (
                    <Image key={i} src={`https://placehold.co/600x400?text=${i}`}/>
                ))}
            </div>
        </ScrollableContainer>
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
