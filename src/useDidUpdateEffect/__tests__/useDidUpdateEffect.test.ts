import { renderHook } from '@testing-library/react-hooks';
import { useDidUpdateEffect } from '../useDidUpdateEffect';

interface GetHookParams {
  /**
   * function that will be called;
   */
  fn: () => void;
  /**
   * array of values that the function call depends on, in the same manner as `useEffect`;
   */
  deps: React.DependencyList;
}

const getHook = ({ fn, deps }: GetHookParams) => {
  return renderHook(({ fn, deps }) => useDidUpdateEffect(fn, deps), {
    initialProps: { fn, deps },
  });
};

describe('useDidUpdateEffect', () => {
  it('should be defined', () => {
    expect(useDidUpdateEffect).toBeDefined();
  });

  it('should return nothing', () => {
    const mockFn = jest.fn(() => {});
    const { result } = getHook({ fn: mockFn, deps: [1, 2, 3] });

    expect(result.current).toBeUndefined();
  });

  it('should return nothing', () => {
    const mockFn = jest.fn(() => {});
    const { result } = getHook({ fn: mockFn, deps: ['idle'] });

    expect(result.current).toBeUndefined();
  });

  it('should not call after component mount', () => {
    const mockFn = jest.fn(() => {});
    getHook({ fn: mockFn, deps: ['idle'] });

    expect(mockFn).toHaveBeenCalledTimes(0);
  });

  it('should not call after deps not changed', () => {
    const mockFn = jest.fn(() => {});
    const { rerender } = getHook({ fn: mockFn, deps: ['idle'] });

    rerender();

    expect(mockFn).toHaveBeenCalledTimes(0);
  });

  it('should call after deps changed and component mount', () => {
    const mockFn = jest.fn(() => {});
    const { rerender } = getHook({ fn: mockFn, deps: ['idle'] });

    rerender({ fn: mockFn, deps: ['ready'] });

    expect(mockFn).toHaveBeenCalledTimes(1);
  });
});
