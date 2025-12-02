import { act, renderHook } from '@testing-library/react-hooks';
import { Breakpoints, useContainerSize } from '../useContainerSize';

describe('useContainerSize', () => {
  /**
   * Array to store all ResizeObserver callbacks.
   * This allows us to manually invoke callbacks in tests to simulate element size changes.
   * Every time the hook creates a new ResizeObserver, its callback is added to this array.
   */
  const observerCallbacks: ResizeObserverCallback[] = [];

  beforeAll(() => {
    /**
     * Mock for ResizeObserver API.
     * ResizeObserver may not be available in test environment (e.g., in jsdom),
     * so we create a mock that mimics the behavior of the real ResizeObserver.
     *
     * How it works:
     * 1. When the hook creates ResizeObserver, constructor is called with a callback
     * 2. Callback is stored in observerCallbacks for manual invocation in tests
     * 3. When observe() is called, callback is invoked immediately (for initial measurement)
     * 4. In tests we can manually invoke callback via updateElementWidth to simulate resize
     */
    class ResizeObserverMock implements ResizeObserver {
      private readonly callback: ResizeObserverCallback;

      /**
       * Stores callback and adds it to observerCallbacks for manual invocation
       * in tests via updateElementWidth.
       * @param {Function} callback - Callback function that will be called when element size changes
       */
      constructor(callback: ResizeObserverCallback) {
        this.callback = callback;
        observerCallbacks.push(callback);
      }

      /**
       * Simulates subscription to element size changes.
       * Immediately invokes callback for initial element size measurement.
       * In real ResizeObserver, callback is invoked automatically when size changes.
       */
      observe() {
        this.callback([], this);
      }

      /**
       * Simulates unsubscribing from observing a specific element.
       * Not used in tests, so left empty.
       * Required by ResizeObserver interface, otherwise linter will complain.
       */
      unobserve() {
        // noop
      }

      /**
       * Simulates disconnecting observer and removes callback from observerCallbacks.
       * This is called during cleanup in useLayoutEffect.
       */
      disconnect() {
        const index = observerCallbacks.indexOf(this.callback);
        if (index > -1) {
          observerCallbacks.splice(index, 1);
        }
      }
    }

    // Replace global ResizeObserver with our mock for all tests
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

  it('should measure size when isEnabled is false but not listen to changes', async () => {
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

    expect(result.current.size).toBe('md');
    expect(result.current.width).toBe(500);
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
    // Wait for throttle to process
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(result.current.size).toBe('lg');
    expect(result.current.width).toBe(900);

    updateElementWidth(element, 300);
    // Wait for throttle to process
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

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

    expect(result.current.size).toBe('md');
    expect(result.current.width).toBe(500);

    updateElementWidth(element, 900);

    expect(result.current.size).toBe('md');
    expect(result.current.width).toBe(500);

    updateElementWidth(element, 300);

    expect(result.current.size).toBe('md');
    expect(result.current.width).toBe(500);
  });
});
