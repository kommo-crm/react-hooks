import { renderHook } from '@testing-library/react-hooks';
import { useConst } from '../useConst';

describe('useConst', () => {
  it('should be defined', () => {
    expect(useConst).toBeDefined();
  });

  it('should return same value after rerender', () => {
    const valueFn = jest.fn(() => 'test value');
    const { result, rerender } = renderHook(() => useConst(valueFn));

    expect(result.current).toBe('test value');

    rerender();

    expect(result.current).toBe('test value');
    expect(valueFn).toHaveBeenCalledTimes(1);
  });
});
