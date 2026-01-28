import { useRef } from 'react';

interface State<T> {
  /**
   * The previous value.
   */
  previous: T | undefined;
  /**
   * The current value.
   */
  new: T;
}

export const usePrevious = <T>(value: T): T | undefined => {
  const stateRef = useRef<State<T>>({
    previous: undefined,
    new: value,
  });

  if (stateRef.current.new !== value) {
    stateRef.current.previous = stateRef.current.new;
    stateRef.current.new = value;
  }

  return stateRef.current.previous;
};
