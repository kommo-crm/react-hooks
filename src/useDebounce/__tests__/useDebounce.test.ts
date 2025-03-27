import { renderHook, act } from '@testing-library/react-hooks';
import { useDebounce } from '../useDebounce';

interface GetHookParams<T> {
  /**
   * value, the change of which triggers the delay
   */
  value: T;
  /**
   * delay in milliseconds;
   */
  delay: number;
}

const getHook = <T>(params: Partial<GetHookParams<T>> | undefined) => {
  return renderHook(({ value, delay }) => useDebounce(value, delay), {
    initialProps: { value: params?.value || '', delay: params?.delay || 500 },
  });
};

describe('useDebounce', () => {
  beforeAll(() => {
    jest.useFakeTimers();
    jest.spyOn(global, 'setTimeout');
    jest.spyOn(global, 'clearTimeout');
  });

  afterEach(() => {
    jest.clearAllTimers();
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  it('should be defined', () => {
    expect(useDebounce).toBeDefined();
  });

  it('should return correct values', () => {
    const hook = getHook({ value: 'test', delay: 500 });
    const hook2 = getHook({ value: 1111, delay: 500 });

    expect(hook.result.current).toEqual('test');
    expect(hook2.result.current).toEqual(1111);
  });

  it('should change value after 500ms timeout', () => {
    const { result, rerender } = getHook({});

    rerender({ value: 'Hello World', delay: 500 });

    expect(result.current).toBe('');
    act(() => jest.advanceTimersByTime(498));
    expect(result.current).toBe('');
    act(() => jest.advanceTimersByTime(3));
    expect(result.current).toBe('Hello World');
  });

  it('should clear previous timer after new value', () => {
    const { rerender } = getHook({});

    rerender({ value: 'Hello World', delay: 500 });

    expect(clearTimeout).toHaveBeenCalledTimes(1);
  });

  it('should clear timeout after unmount ', () => {
    const { unmount } = getHook({});

    unmount();

    expect(clearTimeout).toHaveBeenCalledTimes(1);
  });
});
