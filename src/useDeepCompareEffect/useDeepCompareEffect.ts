import { useEffect, useRef, DependencyList, EffectCallback } from 'react';
import { isEqual } from '@utils/isEqual';

export const useDeepCompareEffect = (
  callback: EffectCallback,
  dependencies: DependencyList
) => {
  const currentDependenciesRef = useRef<DependencyList>();

  useEffect(() => {
    if (isEqual(currentDependenciesRef.current, dependencies)) {
      return;
    }

    currentDependenciesRef.current = dependencies;
    return callback();
  }, dependencies);
};
