import { useRef, useEffect } from 'react';

export const useIsComponentMounted = (): (() => boolean) => {
  const isComponentMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isComponentMountedRef.current = false;
    };
  }, []);

  const isComponentMounted = () => {
    return isComponentMountedRef.current;
  };

  return isComponentMounted;
};
