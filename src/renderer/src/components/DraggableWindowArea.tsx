/**
 * @fileoverview DraggableWindowArea.tsx
 * @author Luca Warmenhoven
 * @date Created on Wednesday, October 23 - 15:47
 */

/**
 * Draggable area for the window.
 */
export function WindowDraggableArea()
{
    return (<div className="flex w-full min-h-7 shrink-0 justify-center items-center" style={{
        WebkitUserSelect: 'none',
        /** @ts-ignore */
        WebkitAppRegion: 'drag',
    }}/>)
}
