/**
 * @fileoverview FilesAndImagesPage.tsx
 * @author Luca Warmenhoven
 * @date Created on Wednesday, October 16 - 19:57
 */
import { useContext, useEffect, useRef, useState } from "react";
import { CreateSequence, useAnimationSequence }    from "../util/AnimationSequence";
import { ApplicationContext }                      from "../contexts/ApplicationContext";
import { ScrollableContainer } from "../components/ScrollableContainer";
import { FilterSelection }     from "../components/interactive/FilterSelection";
import { SearchBar }           from "../components/SearchBar";
import { Icons }                                   from "../components/Icons";
import { AbstractResource }                        from "abstractions";

type ResourceType = 'image' | 'spreadsheet' | 'file';

function getResourceTypeFromFileExtension(extension: string): ResourceType {
    switch (extension) {
        case 'png':
        case 'jpg':
        case 'jpeg':
        case 'gif':
            return 'image';
        case 'xlsx':
        case 'xls':
        case 'csv':
            return 'spreadsheet';
        default:
            return 'file';
    }
}

export interface ResourceInfo {
    resource: AbstractResource,
    tags: string[],
    type: ResourceType,
}

export function FilesAndImagesPage() {

    const [ searchQuery, setSearchQuery ]             = useState<string>('');
    const [ filterType, setFilterType ]               = useState<ResourceType | 'none'>('none');
    const [ resources, setResources ]                 = useState<ResourceInfo[]>([]);
    const [ filteredResources, setFilteredResources ] = useState<ResourceInfo[]>([]);

    const { setHeaderConfig } = useContext(ApplicationContext);
    const containerRef        = useRef<HTMLDivElement>(null);

    useAnimationSequence({ containerRef });

    useEffect(() => {
        setHeaderConfig(() => {
            return {
                pageTitle: 'Files and Images',
            }
        });

        window['fs'].getResources()
            .then((resources: AbstractResource[]) => {
                const mappedResources = resources.map(resource => {
                    return {
                        resource: resource,
                        type: getResourceTypeFromFileExtension(resource.name.split('.').pop()!),
                        tags: []
                    } as ResourceInfo;
                });
                setResources(mappedResources);
                setFilteredResources(mappedResources);
            })
    }, []);

    useEffect(() => {
        setFilteredResources(resources.filter(resource => {
            return (searchQuery.length === 0 ||
                    (resource.tags.some(tag => tag.includes(searchQuery))) ||
                    (resource.resource.name && resource.resource.name.toLowerCase().includes(searchQuery))) &&
                (filterType === 'none' || resource.type === filterType);
        }));
    }, [ searchQuery, filterType, resources ]);

    return (
        <div className="w-full max-w-screen-lg flex flex-col justify-start items-stretch grow">
            <div className="flex flex-row justify-start items-center w-[80%] mx-auto z-10">
                <FilterSelection options={[
                    "All Files", "Images", "Spreadsheets", "PDFs"
                ]} onClick={(_, index) => {
                    setFilterType(
                        index === 0 ? 'none' : [ 'file', 'image', 'spreadsheet' ][ index - 1 ] as ResourceType)
                }}/>
                <SearchBar placeholder="Search for tags and files"
                           onInput={(value) => setSearchQuery(value.toLowerCase())}/>
            </div>
            <ScrollableContainer className="py-10" blurEdges elementRef={containerRef} size='lg'>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 rounded-xl mx-2">
                    {filteredResources.map((resource, i) => (
                        <Resource key={i} resource={resource}/>)
                    )}
                </div>
            </ScrollableContainer>
        </div>
    )
}

/**
 * The resource component.
 * A resource is a file, image, or spreadsheet,
 * that is saved from the assistant.
 */
function Resource(props: { resource: ResourceInfo }) {

    return (
        <div
            className="group relative flex flex-col justify-start items-center content-container hoverable duration-300 transition-colors rounded-xl p-4 pb-2"
        onClick={() => {
            // TODO: Add navigation to file on local file system
        }}>
            <div className="absolute left-0 top-0 w-full z-10">
                <div
                    className="opacity-0 group-hover:opacity-100 w-9 h-9 p-2 float-right m-5 rounded-full backdrop-brightness-90 hover:backdrop-brightness-75 transition-all duration-300">
                    <Icons.ArrowTopRightSquare/>
                </div>
            </div>
            <span {...CreateSequence('fadeIn', 500, 35)}
                  className="bg-no-repeat bg-cover bg-center w-full h-80 rounded-md"
                  style={{ backgroundImage: `url(${props.resource.resource.data})`, }}/>
            <span className="text-lg mt-2 mb-1 ml-1 mr-auto">{props.resource.resource.name || 'Resource'}</span>
            <div className="flex flex-row justify-start items-start flex-wrap text-xs w-full">
                {
                    props.resource.tags.map((tag, i) => (
                        <span key={i}
                              className="text-black dark:text-gray-300 rounded-full p-1 mx-1 hover:underline cursor-pointer">
                    #{tag}
                </span>
                    ))}
            </div>
        </div>
    )
}
