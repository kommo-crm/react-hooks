import { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { throttle } from 'throttle-debounce';

export type Breakpoints = Record<string, number>;

export interface UseContainerSizeOptions<T> {
  /**
   * Breakpoints map where key is a breakpoint name
   * and value is a minimum container width in pixels.
   */
  breakpoints: T;
  /**
   * Flag that enables or disables hook logic.
   * When disabled the hook does not listen to size changes.
   */
  isEnabled?: boolean;
  /**
   * Throttle time in milliseconds for resize events.
   */
  throttleTime?: number;
}

export interface UseContainerSizeResult<T extends Breakpoints> {
  /**
   * Current breakpoint name or null if no breakpoint matches.
   */
  size: keyof T | null;
  /**
   * Current container width in pixels.
   */
  width: number | null;
  /**
   * Ref callback for the tracked element.
   */
  ref: (node: HTMLElement | null) => void;
}

/**
 * Internal interface representing a parsed breakpoint with name and value.
 * @property {string} name - Breakpoint name.
 * @property {number} value - Breakpoint value in pixels.
 */
interface ParsedBreakpoint {
  /**
   * Breakpoint name.
   */
  name: string;
  /**
   * Breakpoint value in pixels.
   */
  value: number;
}

/**
 * Pure function that determines the current breakpoint based on width.
 * @template T - Type extending Breakpoints.
 * @param {number} width - Current container width in pixels.
 * @param {ParsedBreakpoint[]} parsedBreakpoints - Array of breakpoints sorted by value in ascending order.
 * @returns {keyof T | null} The breakpoint name that matches the width, or null if no breakpoint matches.
 */
const getCurrentSize = <T extends Breakpoints>(
  width: number,
  parsedBreakpoints: ParsedBreakpoint[]
): keyof T | null => {
  for (let i = parsedBreakpoints.length - 1; i >= 0; i--) {
    if (width >= parsedBreakpoints[i].value) {
      return parsedBreakpoints[i].name as keyof T;
    }
  }

  return null;
};

/**
 * React hook that tracks container width and returns a breakpoint name
 * based on the provided breakpoints map.
 * The hook uses ResizeObserver under the hood and throttles resize events.
 * @template T - Type extending Breakpoints.
 * @param {UseContainerSizeOptions<T>} options - Configuration options for the hook.
 * @returns {UseContainerSizeResult<T>} Object containing ref callback, current size, and width.
 */
export const useContainerSize = <T extends Breakpoints>(
  options: UseContainerSizeOptions<T>
): UseContainerSizeResult<T> => {
  const { breakpoints, isEnabled = true, throttleTime = 10 } = options;

  const elementRef = useRef<HTMLElement | null>(null);

  const parsedBreakpoints = useMemo(() => {
    return Object.entries(breakpoints)
      .map(([name, value]) => {
        return { name, value };
      })
      .sort((a, b) => {
        return a.value - b.value;
      });
  }, [breakpoints]);

  const [size, setSize] = useState<keyof T | null>(null);
  const [width, setWidth] = useState<number | null>(null);

  const handleResize = useCallback(() => {
    const element = elementRef.current;

    if (!element) {
      return;
    }

    const newWidth = element.offsetWidth;
    const newSize = getCurrentSize<T>(newWidth, parsedBreakpoints);

    setSize((prev) => {
      return prev === newSize ? prev : newSize;
    });

    setWidth((prev) => {
      return prev === newWidth ? prev : newWidth;
    });
  }, [parsedBreakpoints]);

  useLayoutEffect(() => {
    const element = elementRef.current;
    if (!element || !isEnabled) {
      return;
    }

    if (typeof ResizeObserver === 'undefined') {
      console.warn(
        'useContainerSize: ResizeObserver is not available. Please provide a polyfill for browsers that do not support it.'
      );
      return;
    }

    const throttledResize = throttle(throttleTime, handleResize, {
      noLeading: false,
      noTrailing: false,
    });

    const observer = new ResizeObserver(throttledResize);

    observer.observe(element);

    return () => {
      observer.disconnect();
      throttledResize.cancel();
    };
  }, [isEnabled, throttleTime, handleResize]);

  const ref = useCallback(
    (node: HTMLElement | null) => {
      elementRef.current = node;
      if (node) {
        handleResize();
      } else {
        setSize(null);
        setWidth(null);
      }
    },
    [handleResize]
  );

  return { ref, size, width };
};
