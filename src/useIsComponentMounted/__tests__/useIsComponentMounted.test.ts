import { renderHook } from '@testing-library/react-hooks';
import { useIsComponentMounted } from '../useIsComponentMounted';

describe('useIsComponentMounted', () => {
  it('should be defined', () => {
    expect(useIsComponentMounted).toBeDefined();
  });

  it('should return a function', () => {
    const hook = renderHook(() => useIsComponentMounted());

    expect(typeof hook.result.current).toEqual('function');
  });

  it('should return true if component is mounted', () => {
    const hook = renderHook(() => useIsComponentMounted());

    expect(hook.result.current()).toBeTruthy();
  });

  it('should return false if component is unmounted', () => {
    const hook = renderHook(() => useIsComponentMounted());

    hook.unmount();

    expect(hook.result.current()).toBeFalsy();
  });
});
