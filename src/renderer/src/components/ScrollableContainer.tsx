/**
 * @fileoverview ScrollableContainer.tsx
 * @author Luca Warmenhoven
 * @date Created on Friday, October 18 - 21:16
 */
import { ReactNode, RefObject, useEffect, useRef } from "react";

/**
 * A container that can be scrolled vertically.
 */
export function ScrollableContainer(props: {
    children: ReactNode, className?: string, blurEdges?: boolean, elementRef?: RefObject<HTMLDivElement>,
    size?: 'sm' | 'md' | 'lg' | 'xl'
}) {

    const innerContainerRef = useRef<HTMLDivElement>(null);
    const containerRef      = useRef<HTMLDivElement>(null);
    const scrollbarRef      = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if ( !containerRef.current || !innerContainerRef.current )
            return;

        let containerDimensions      = containerRef.current.getBoundingClientRect();
        let innerContainerDimensions = innerContainerRef.current.getBoundingClientRect();

        const handleResize = () => {

            if ( !containerRef.current || !innerContainerRef.current )
                return;

            containerDimensions      = containerRef.current.getBoundingClientRect();
            innerContainerDimensions = innerContainerRef.current.getBoundingClientRect();
        }

        const scrollbarHeight = containerDimensions.height / innerContainerDimensions.height * containerDimensions.height;

        scrollbarRef.current!.style.height = `${scrollbarHeight}px`;

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        }
    }, [ containerRef ]);

    return (
        <div
            ref={containerRef}
            className={`flex flex-col justify-start items-center no-scrollbar grow gap-4 overflow-y-auto overflow-x-hidden w-full max-w-screen-${props.size ?? 'lg'} ${props.blurEdges ? 'h-gradient-clip' : ''}`}>
            <div className="relative grow w-full" ref={innerContainerRef}>
                <div
                    className={`flex flex-col justify-start items-stretch absolute top-0 left-0 w-full ${props.className ?? ''}`}
                    ref={props.elementRef}>
                    {props.children}
                </div>
                <div className="absolute top-0 left-full w-4 rounded-full bg-gray-300"
                     ref={scrollbarRef}/>
            </div>
        </div>
    )
}
