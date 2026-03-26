import { useRef, useEffect } from 'react';

export const useIsComponentMounted = (): (() => boolean) => {
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
