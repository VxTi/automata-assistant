/**
 * @fileoverview MultiSelectionSetting.tsx
 * @author Luca Warmenhoven
 * @date Created on Sunday, October 20 - 17:10
 */
import { DropdownSelection } from "@renderer/components/interactive/DropdownSelection";

export function MultiSelectionSetting(props: {
    title: string,
    description: string,
    onChange: (value: string, index: number) => void,
    options: string[],
    currentIndex: number,
    extraDescriptive?: JSX.Element,
    extraOption?: JSX.Element,
    props?: any
}) {

    return (
        <div className="flex flex-row w-full justify-between items-center gap-5"
             {...props.props}>
            <div className="flex flex-col gap-1">
                <span aria-label={props.description}>{props.title}</span>
                <span className="text-gray-400 text-sm">{props.description}</span>
                {props.extraDescriptive}
            </div>
            <div className="flex flex-row justify-start items-center">
                {props.extraOption}
            <DropdownSelection options={props.options} currentValue={props.currentIndex} onChange={props.onChange}/>
            </div>
        </div>
    )
}
