/**
 * @fileoverview DistantScalingHook.tsx
 * @author Luca Warmenhoven
 * @date Created on Friday, October 18 - 00:59
 */
import { RefObject, useEffect } from "react";

export function useDistantScaling(elementRef: RefObject<HTMLElement>) {
    useEffect(() => {

        if (!elementRef.current) return;

        const element = elementRef.current;
        element.style.transition = 'transform 0.5s ease';
        const observer = new IntersectionObserver((entries) => {


            for (const entry of entries) {
                const target = entry.target as HTMLElement;
                target.style.transform = `scale(${Math.min(Math.max(0, entry.intersectionRatio * 2), 1)})`;
                target.style.opacity = `${Math.min(Math.max(0, entry.intersectionRatio * 2), 1)}`;
            }

        }, { threshold: [.1, .2, .8] });

        observer.observe(element);

        return () => observer.disconnect();

    }, []);
}
