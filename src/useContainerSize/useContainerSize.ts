import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { throttle } from '@utils';

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
 * React hook that tracks container width and returns a breakpoint name
 * based on the provided breakpoints map.
 * The hook uses ResizeObserver under the hood and throttles resize events.
 */

export const useContainerSize = <T extends Breakpoints>(
  options: UseContainerSizeOptions<T>
): UseContainerSizeResult<T> => {
  const { breakpoints, isEnabled = true, throttleTime = 10 } = options;

  const [element, setElement] = useState<HTMLElement | null>(null);

  const parsedBreakpoints = useMemo(() => {
    return Object.entries(breakpoints)
      .map(([name, value]) => {
        return { name, value };
      })
      .sort((a, b) => {
        return a.value - b.value;
      });
  }, [breakpoints]);

  const getCurrentSize = useCallback(
    (width: number): keyof T | null => {
      for (let i = parsedBreakpoints.length - 1; i >= 0; i--) {
        if (width >= parsedBreakpoints[i].value) {
          return parsedBreakpoints[i].name;
        }
      }

      return null;
    },
    [parsedBreakpoints]
  );

  const [size, setSize] = useState<keyof T | null>(() => {
    if (!element) {
      return null;
    }

    return getCurrentSize(element.offsetWidth);
  });

  const [width, setWidth] = useState<number | null>(() => {
    if (!element) {
      return null;
    }

    return element.offsetWidth;
  });

  const handleResizeRef = useRef<(() => void) | null>(null);
  const throttledResizeRef = useRef<ReturnType<typeof throttle> | null>(null);

  const handleResize = useCallback(() => {
    if (!element || !isEnabled) {
      return;
    }

    const newWidth = element.offsetWidth;
    const newSize = getCurrentSize(newWidth);

    setSize((prev) => {
      return prev === newSize ? prev : newSize;
    });

    setWidth((prev) => {
      return prev === newWidth ? prev : newWidth;
    });
  }, [element, getCurrentSize, isEnabled]);

  handleResizeRef.current = handleResize;

  useEffect(() => {
    if (!element || !isEnabled) {
      setSize(null);
      setWidth(null);
      return;
    }

    if (handleResizeRef.current) {
      handleResizeRef.current();
    }
  }, [element, isEnabled]);

  useLayoutEffect(() => {
    if (!element || !isEnabled) {
      return;
    }

    if (throttledResizeRef.current) {
      throttledResizeRef.current.cancel();
    }

    const throttledResize = throttle(
      () => {
        if (handleResizeRef.current) {
          handleResizeRef.current();
        }
      },
      throttleTime,
      {
        leading: true,
        trailing: true,
      }
    );

    throttledResizeRef.current = throttledResize;

    const observer = new ResizeObserver(throttledResize);

    observer.observe(element);

    return () => {
      observer.disconnect();
      throttledResize.cancel();
      throttledResizeRef.current = null;
    };
  }, [element, isEnabled, throttleTime]);

  const ref = useCallback((node: HTMLElement | null) => {
    setElement(node);
  }, []);

  return { ref, size, width };
};
