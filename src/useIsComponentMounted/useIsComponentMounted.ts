import { useRef, useEffect } from 'react';

export const useIsComponentMounted = (): (() => boolean) => {
  /**
   * The ref is initialized as `false` and set to `true` only inside the effect
   * (not in the component body) for two reasons:
   *
   * 1. Mutating a ref during render is a side effect. In concurrent mode renders
   * can be interrupted and replayed, so writing to `ref.current` in the
   * component body is not safe.
   *
   * 2. This hook is designed for async callbacks (`fetch`, `setTimeout`, etc.)
   * that resolve after effects have already run, so `isMounted()` is never
   * called synchronously during render.
   *
   * Keeping all mutations inside the effect also ensures compatibility with
   * React 18+ StrictMode, which re-runs effects (mount → cleanup → mount)
   * for newly mounted components in development.
   */
  const isComponentMountedRef = useRef(false);

  useEffect(() => {
    isComponentMountedRef.current = true;

    return () => {
      isComponentMountedRef.current = false;
    };
  }, []);

  const isComponentMounted = () => {
    return isComponentMountedRef.current;
  };

  return isComponentMounted;
};
