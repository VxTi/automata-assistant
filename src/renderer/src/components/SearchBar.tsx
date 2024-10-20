/**
 * @fileoverview SearchBar.tsx
 * @author Luca Warmenhoven
 * @date Created on Saturday, October 19 - 18:27
 */
import { Icons }             from "./Icons";
import { BasicElementProps } from "../util/BasicElementProps";


export function SearchBar(props: BasicElementProps & { placeholder?: string, onInput?: (value: string) => void }) {
    return (
        <div
            className="content-container selectable grow apply-stroke sticky top-0 col-start-2 z-50 col-end-3 flex items-center justify-start overflow-hidden py-1.5 px-3 rounded-lg mx-0.5">
            <Icons.MagnifyingGlass className="w-6 h-6 mr-2 fill-none"/>
            <input type="text" placeholder={props.placeholder ?? 'Search'} ref={props.elementRef}
                   tabIndex={0}
                   onInput={e => props.onInput?.call(null, (e.target as HTMLInputElement).value)}
                   className="bg-transparent col-start-2 placeholder:text-gray-500 col-end-3 focus:outline-none mx-1 px-1 grow"/>
        </div>
    )
}
