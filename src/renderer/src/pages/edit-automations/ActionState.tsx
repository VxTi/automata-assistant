/**
 * @fileoverview ActionState.tsx
 * @author Luca Warmenhoven
 * @date Created on Sunday, October 06 - 14:08
 */

export type ActionStateType = 'when' | 'then' | 'else';
export type ActionStateOption = 'input' | 'output' | 'state' | 'time' | 'event';

//export interface ActionState

export interface ActionStateProps<T = ActionStateType> {
    title: string,
    type: ActionStateType | T,
    options: ActionStateOption[],
}

export function ActionState<T>(props: ActionStateProps<T>) {
    return (
        <div className="flex flex-row justify-start items-center relative w-max p-4 rounded-lg bg-gray-800">
            <span className="text-white font-helvetica-neue text-sm mr-2">{props.title}</span>
            {
                props.options.map((_, i) => {
                    return (
                        <div className="flex flex-row justify-between items-center" key={i}>
                            <input type="text" className="bg-gray-700 text-white font-helvetica-neue text-sm p-2 rounded-lg"/>
                        </div>
                    )
                })
            }
            <div className="absolute left-1/2 bottom-full">
                <div className="w-0 h-0 border-4 border-solid border-gray-800 border-t-0 border-l-2 border-r-2"></div>
            </div>
        </div>
    )
}