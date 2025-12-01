import { act, renderHook } from '@testing-library/react-hooks';
import { Breakpoints, useContainerSize } from '../useContainerSize';

describe('useContainerSize', () => {
  const observerCallbacks: ResizeObserverCallback[] = [];

  beforeAll(() => {
    class ResizeObserverMock implements ResizeObserver {
      private readonly callback: ResizeObserverCallback;

      constructor(callback: ResizeObserverCallback) {
        this.callback = callback;
        observerCallbacks.push(callback);
      }

      observe() {
        this.callback([], this);
      }

      unobserve() {
        // noop
      }

      disconnect() {
        const index = observerCallbacks.indexOf(this.callback);
        if (index > -1) {
          observerCallbacks.splice(index, 1);
        }
      }
    }

    global.ResizeObserver = ResizeObserverMock;
  });

  const createElement = (width: number): HTMLElement => {
    const element = document.createElement('div');
    Object.defineProperty(element, 'offsetWidth', {
      configurable: true,
      get: () => width,
    });
    return element;
  };

  const updateElementWidth = (element: HTMLElement, newWidth: number): void => {
    Object.defineProperty(element, 'offsetWidth', {
      configurable: true,
      get: () => newWidth,
    });
  };

  const simulateResize = (): void => {
    const callback = observerCallbacks[observerCallbacks.length - 1];
    if (callback) {
      act(() => {
        callback([], {} as ResizeObserver);
      });
    }
  };

  it('should be defined', () => {
    expect(useContainerSize).toBeDefined();
  });

  it('should return null when element is not attached', () => {
    const breakpoints: Breakpoints = {
      sm: 0,
      md: 400,
    };

    const { result } = renderHook(() => useContainerSize({ breakpoints }));

    expect(result.current.size).toBeNull();
    expect(result.current.width).toBeNull();
  });

  it('should return correct breakpoint for container width', async () => {
    const breakpoints = {
      sm: 0,
      md: 400,
      lg: 800,
    } as const;

    const { result, waitForNextUpdate } = renderHook(() =>
      useContainerSize({ breakpoints })
    );

    await act(async () => {
      const element = createElement(500);
      result.current.ref(element);
      await waitForNextUpdate();
    });

    expect(result.current.size).toBe('md');
    expect(result.current.width).toBe(500);
  });

  it('should return null when isEnabled is false', async () => {
    const breakpoints = {
      sm: 0,
      md: 400,
    } as const;

    const { result, waitForNextUpdate } = renderHook(() =>
      useContainerSize({
        breakpoints,
        isEnabled: false,
      })
    );

    await act(async () => {
      const element = createElement(500);
      result.current.ref(element);
      await waitForNextUpdate();
    });

    expect(result.current.size).toBeNull();
    expect(result.current.width).toBeNull();
  });

  it('should use custom throttleTime when provided', async () => {
    const breakpoints = {
      sm: 0,
      md: 400,
      lg: 800,
    } as const;

    const { result, waitForNextUpdate } = renderHook(() =>
      useContainerSize({
        breakpoints,
        throttleTime: 50,
      })
    );

    await act(async () => {
      const element = createElement(500);
      result.current.ref(element);
      await waitForNextUpdate();
    });

    expect(result.current.size).toBe('md');
  });

  it('should use default throttleTime when not provided', async () => {
    const breakpoints = {
      sm: 0,
      md: 400,
    } as const;

    const { result, waitForNextUpdate } = renderHook(() =>
      useContainerSize({ breakpoints })
    );

    await act(async () => {
      const element = createElement(500);
      result.current.ref(element);
      await waitForNextUpdate();
    });

    expect(result.current.size).toBe('md');
  });

  it('should update size when element width changes and isEnabled is true', async () => {
    const breakpoints = {
      sm: 0,
      md: 400,
      lg: 800,
    } as const;

    const { result, waitForNextUpdate } = renderHook(() =>
      useContainerSize({
        breakpoints,
        isEnabled: true,
        throttleTime: 0,
      })
    );

    const element = createElement(500);

    await act(async () => {
      result.current.ref(element);
      await waitForNextUpdate();
    });

    expect(result.current.size).toBe('md');
    expect(result.current.width).toBe(500);

    updateElementWidth(element, 900);
    simulateResize();

    expect(result.current.size).toBe('lg');
    expect(result.current.width).toBe(900);

    updateElementWidth(element, 300);
    simulateResize();

    expect(result.current.size).toBe('sm');
    expect(result.current.width).toBe(300);
  });

  it('should not update size when element width changes and isEnabled is false', () => {
    const breakpoints = {
      sm: 0,
      md: 400,
      lg: 800,
    } as const;

    const { result } = renderHook(() =>
      useContainerSize({
        breakpoints,
        isEnabled: false,
      })
    );

    const element = createElement(500);

    act(() => {
      result.current.ref(element);
    });

    expect(result.current.size).toBeNull();
    expect(result.current.width).toBeNull();

    updateElementWidth(element, 900);
    simulateResize();

    expect(result.current.size).toBeNull();
    expect(result.current.width).toBeNull();

    updateElementWidth(element, 300);
    simulateResize();

    expect(result.current.size).toBeNull();
    expect(result.current.width).toBeNull();
  });
});
