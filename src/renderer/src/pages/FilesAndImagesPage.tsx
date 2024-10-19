/**
 * @fileoverview FilesAndImagesPage.tsx
 * @author Luca Warmenhoven
 * @date Created on Wednesday, October 16 - 19:57
 */
import { useContext, useEffect, useRef }        from "react";
import { CreateSequence, useAnimationSequence } from "../util/AnimationSequence";
import { ApplicationContext }                   from "../contexts/ApplicationContext";
import { ScrollableContainer }                  from "../components/ScrollableContainer";

export function FilesAndImagesPage() {

    const { setHeaderConfig } = useContext(ApplicationContext);
    const containerRef        = useRef<HTMLDivElement>(null);
    useAnimationSequence({ containerRef });

    useEffect(() => {
        setHeaderConfig(() => {
            return {
                pageTitle: 'Files and Images',
            }
        });
    }, []);

    return (
        <ScrollableContainer className="pb-10">
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 rounded-xl min-w-max max-w-screen-lg"
                 ref={containerRef}>
                {Array(50).fill(0).map((_, i) => (
                    <Resource key={i}
                              type={i % 2 === 0 ? 'image' : 'file'}
                              tags={[ 'tag1', 'tag2', 'tag3' ]}
                              thumbnailSrc={`https://placehold.co/600x400?text=${i}`}/>
                ))}
            </div>
        </ScrollableContainer>
    )
}

function Resource(props: {
    type: 'image' | 'file',
    thumbnailSrc: string,
    tags: string[],
}) {

    return (
        <div className="flex flex-col justify-start items-center content-container rounded-xl p-4 pb-0">
            <span {...CreateSequence('fadeIn', 500, 35)}
                className="bg-no-repeat bg-cover bg-center w-full h-80 rounded-md brightness-50"
                style={{ backgroundImage: `url(${props.thumbnailSrc})`, }}/>
            <div className="flex flex-row justify-start items-start flex-wrap text-sm w-full">
                {
                    props.tags.map((tag, i) => (
                <span key={i} className="text-black dark:text-gray-300 rounded-full p-1 mx-2 my-2 hover:underline cursor-pointer">
                    #{tag}
                </span>
                ))}
            </div>
        </div>
    )
}
