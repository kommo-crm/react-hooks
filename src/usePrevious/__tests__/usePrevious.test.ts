import { renderHook } from '@testing-library/react-hooks';
import { usePrevious } from '../usePrevious';

describe('usePrevious', () => {
  it('should be defined', () => {
    expect(usePrevious).toBeDefined();
  });

  it('should return undefined on first render', () => {
    const { result } = renderHook(() => usePrevious('initial'));

    expect(result.current).toBeUndefined();
  });

  it('should return previous value after rerender with new value', () => {
    const { result, rerender } = renderHook(({ value }) => usePrevious(value), {
      initialProps: { value: 'first' },
    });

    rerender({ value: 'second' });

    expect(result.current).toBe('first');
  });

  it('should not update previous value if value stays the same', () => {
    const { result, rerender } = renderHook(({ value }) => usePrevious(value), {
      initialProps: { value: 'same' },
    });

    rerender({ value: 'same' });

    expect(result.current).toBeUndefined();
  });

  it('should work with objects using reference equality', () => {
    const obj1 = { a: 1 };
    const obj2 = { a: 1 };

    const { result, rerender } = renderHook(({ value }) => usePrevious(value), {
      initialProps: { value: obj1 },
    });

    // Different object reference, even with same content
    rerender({ value: obj2 });

    expect(result.current).toBe(obj1);
  });
});
