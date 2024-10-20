/**
 * @fileoverview BooleanSetting.tsx
 * @author Luca Warmenhoven
 * @date Created on Sunday, October 20 - 13:59
 */


import { ToggleableSwitch } from "../ToggleableSwitch";

/**
 * A boolean setting component.
 * Boolean settings are used to display a setting that can be toggled on or off.
 * @constructor
 */
export function BooleanSetting(props: {
    title: string,
    description: string,
    enabled: boolean,
    onChange: (newState: boolean) => void,
    props?: any
}) {
    return (
        <div className="flex flex-row w-full justify-between items-center gap-5"
             {...props.props}>
            <div className="flex flex-col gap-1">
                <span aria-label={props.description}>{props.title}</span>
                <span className="text-gray-400 text-sm">{props.description}</span>
            </div>
            <ToggleableSwitch onStateChange={props.onChange} checked={props.enabled}/>
        </div>
    )
}
