import { renderHook } from '@testing-library/react-hooks';
import { useDeepCompareEffect } from '../useDeepCompareEffect';

describe('useDeepCompareEffect', () => {
  it('should be defined', () => {
    expect(useDeepCompareEffect).toBeDefined();
  });

  it('should execute effect on deep change', () => {
    const effect = jest.fn();
    const { rerender } = renderHook(
      ({ deps }) => useDeepCompareEffect(effect, deps),
      {
        initialProps: { deps: [{ count: 0 }] },
      }
    );

    expect(effect).toHaveBeenCalledTimes(1);

    rerender({ deps: [{ count: 0 }] });
    expect(effect).toHaveBeenCalledTimes(1);

    rerender({ deps: [{ count: 1 }] });
    expect(effect).toHaveBeenCalledTimes(2);
  });

  it('should not execute effect on shallow change', () => {
    const effect = jest.fn();
    const { rerender } = renderHook(
      ({ deps }) => useDeepCompareEffect(effect, deps),
      {
        initialProps: { deps: [{ count: 0 }] },
      }
    );

    expect(effect).toHaveBeenCalledTimes(1);

    rerender({ deps: [{ count: 0 }] });
    expect(effect).toHaveBeenCalledTimes(1);
  });

  it('should execute effect on deep change of one of the deps', () => {
    const effect = jest.fn();
    const { rerender } = renderHook(
      ({ deps }) => useDeepCompareEffect(effect, deps),
      {
        initialProps: { deps: [{ count: 0 }, { count2: 0 }] },
      }
    );

    expect(effect).toHaveBeenCalledTimes(1);

    rerender({ deps: [{ count: 0 }, { count2: 1 }] });
    expect(effect).toHaveBeenCalledTimes(2);
  });
});
