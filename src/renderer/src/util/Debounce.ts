/**
 * @fileoverview Debounce.ts
 * @author Luca Warmenhoven
 * @date Created on Sunday, October 20 - 14:27
 */

/**
 * Debounce function for executing a function after a certain delay.
 * @param func The function to debounce.
 * @param delay The delay to wait before executing the function.
 */
export function debounce(func: Function, delay: number) {
    let timeout: NodeJS.Timeout;
    return function (...args: any[]) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), delay);
    };
}
