/**
 * @fileoverview FilesAndImagesPage.tsx
 * @author Luca Warmenhoven
 * @date Created on Wednesday, October 16 - 19:57
 */
import { useContext, useEffect, useRef }        from "react";
import { CreateSequence, useAnimationSequence } from "../util/AnimationSequence";
import { ApplicationContext }                   from "../contexts/ApplicationContext";
import { ScrollableContainer } from "../components/ScrollableContainer";
import { DropdownSelectable }  from "../components/interactive/DropdownSelectable";
import { SearchBar }           from "../components/SearchBar";

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
        <>
            <div className="flex flex-row justify-start items-center max-w-screen-sm w-full mx-auto">
                <DropdownSelectable options={[
                    "All Files", "Images", "Spreadsheets", "PDFs"
                ]} />
                <SearchBar placeholder="Search for tags and files "/>
            </div>
            <ScrollableContainer className="py-10" blurEdges elementRef={containerRef} size='lg'>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 rounded-xl mx-2">
                    {Array(50).fill(0).map((_, i) => (
                        <Resource key={i}
                                  type={i % 2 === 0 ? 'image' : 'file'}
                                  tags={[ 'tag1', 'tag2', 'tag3', 'tag1', 'balls', 'something' ]}
                                  thumbnailSrc={`https://placehold.co/600x400?text=${i}`}/>
                    ))}
                </div>
            </ScrollableContainer>
        </>
    )
}

function Resource(props: {
    type: 'image' | 'file',
    thumbnailSrc: string,
    tags: string[],
}) {

    return (
        <div className="flex flex-col justify-start items-center content-container rounded-xl p-4 pb-2">
            <span {...CreateSequence('fadeIn', 500, 35)}
                  className="bg-no-repeat bg-cover bg-center w-full h-80 rounded-md brightness-50"
                  style={{ backgroundImage: `url(${props.thumbnailSrc})`, }}/>
            <div className="flex flex-row justify-start items-start flex-wrap text-sm w-full">
                {
                    props.tags.map((tag, i) => (
                        <span key={i}
                              className="text-black dark:text-gray-300 rounded-full p-1 mx-1 hover:underline cursor-pointer">
                    #{tag}
                </span>
                    ))}
            </div>
        </div>
    )
}
