import { useRef } from 'react';

export const useConst = <T>(fn: () => T): T => {
  const ref = useRef<{
    /**
     * immutable value obtained from a function call;
     */
    value: T;
  }>();

  if (!ref.current) {
    ref.current = { value: fn() };
  }

  return ref.current.value;
};
