/**
 * @fileoverview AnimationSequence.tsx
 * @author Luca Warmenhoven
 * @date Created on Saturday, September 14 - 01:51
 */
import { RefObject, useEffect } from "react";

export interface AnimationSequenceConfig {
    containerRef: RefObject<HTMLElement>;
    intervalType?: 'relative' | 'absolute';
    observerOptions?: IntersectionObserverInit;
}

export function CreateSequence(animation: string, duration: number, delay: number) {
    return {
        'data-sequence-animation': animation,
        'data-sequence-duration-ms': duration,
        'data-sequence-delay-ms': delay
    };
}

/**
 * @description This hook will animate elements in a sequence when they intersect with the viewport.
 * All child elements of the containerRef that have the `data-sequence-animation` attribute will be animated. <br />
 * Allowed attributes for animatable elements are as followed: <br />
 * - `data-sequence-animation`: The animation class that will be added to the element <br />
 * - `data-sequence-duration-ms`: The duration of the animation in milliseconds <br />
 * - `data-sequence-delay-ms`: The delay of the animation in milliseconds, relative or absolute. <br />
 * @param config The configuration object for the animation sequence
 * Optional configuration options are: <br />
 * - `containerRef`: The reference to the container element that contains the animatable elements <br />
 * - `intervalType`: The type of interval that will be used for the delay of the animations. This can be either
 * `relative` or `absolute`, and defaults to `relative` <br />
 * - `observerOptions`: The options for the IntersectionObserver that will be used to detect when the elements are in view
 * @param dependencies The dependencies of the hook. If any of these dependencies change, the hook will re-run
 */
export function useAnimationSequence(config: AnimationSequenceConfig, dependencies?: any[]) {
    useEffect(() => {
        if ( !config.containerRef.current )
            return;

        console.log('Animating sequence');

        const animatableElements = config.containerRef.current.querySelectorAll('*[data-sequence-animation]');
        animatableElements.forEach((element) => {
            const target = element as HTMLElement;
            element.classList.add(target.dataset.sequenceAnimation ?? '');
            target.style.animationPlayState = 'paused';
        });

        let interval = 0;

        const observer = new IntersectionObserver((entries) => {

            if ( !config.containerRef.current || !entries[ 0 ].isIntersecting || !entries[ 0 ].target.checkVisibility())
                return;

            animatableElements.forEach((element) => {

                const hElement = element as HTMLElement;
                const sequenceDelay = parseInt(hElement.dataset.sequenceDelayMs ?? '0');
                const sequenceDuration = parseInt(hElement.dataset.sequenceDurationMs ?? '300');
                hElement.style.willChange = 'transform, opacity, color';

                interval = config.intervalType === 'absolute' ? sequenceDelay : interval + sequenceDelay;

                hElement.style.animationFillMode = 'forwards';
                hElement.style.animationPlayState = 'running';
                hElement.style.animationDuration = sequenceDuration + 'ms';
                hElement.style.animationDelay = `${interval}ms`;
            });

            //observer.disconnect();
        }, config.observerOptions ?? { threshold: [ 0, .1, .2, .3 ] });

        observer.observe(config.containerRef.current);

        return () => observer.disconnect();
    }, [ config.containerRef, ...(dependencies ?? []) ]);
}