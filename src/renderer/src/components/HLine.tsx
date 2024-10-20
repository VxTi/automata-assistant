/**
 * @fileoverview HLine.tsx
 * @author Luca Warmenhoven
 * @date Created on Sunday, October 20 - 13:57
 */

/**
 * A horizontal line component.
 * This component is used to display a horizontal line.
 */
export function HLine(props: { props?: any }) {
    return <hr className="border-gray-300 dark:border-gray-600 my-1.5" {...props.props} />
}
