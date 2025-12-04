import { act, renderHook } from '@testing-library/react-hooks';
import { Breakpoints, useContainerSize } from '../useContainerSize';

describe('useContainerSize', () => {
  /**
   * Interface representing a pair of element and its associated callback.
   * This allows us to find the correct callback for a specific element
   * when manually invoking callbacks in tests to simulate element size changes.
   * @property {HTMLElement} element - The element being observed.
   * @property {ResizeObserverCallback} callback - The callback function for this element.
   */
  interface ElementCallbackPair {
    /**
     * The element being observed.
     */
    element: HTMLElement;
    /**
     * The callback function for this element.
     */
    callback: ResizeObserverCallback;
  }
  const elementCallbacks: ElementCallbackPair[] = [];

  beforeAll(() => {
    /**
     * Mock for ResizeObserver API.
     * ResizeObserver may not be available in test environment (e.g., in jsdom),
     * so we create a mock that mimics the behavior of the real ResizeObserver.
     *
     * How it works:
     * 1. When the hook creates ResizeObserver, constructor is called with a callback
     * 2. When observe(element) is called, callback is stored in elementCallbacks array
     * 3. Callback is invoked immediately (for initial measurement)
     * 4. In tests we can manually invoke callback via updateElementWidth to simulate resize
     */
    class ResizeObserverMock implements ResizeObserver {
      private readonly callback: ResizeObserverCallback;
      private readonly observedElements: HTMLElement[] = [];

      /**
       * Stores callback for later use when observe() is called.
       * @param {Function} callback - Callback function that will be called when element size changes
       */
      constructor(callback: ResizeObserverCallback) {
        this.callback = callback;
      }

      /**
       * Simulates subscription to element size changes.
       * Stores the element -> callback mapping and immediately invokes callback
       * for initial element size measurement.
       * In real ResizeObserver, callback is invoked automatically when size changes.
       * @param {HTMLElement} element - Element to observe
       */
      observe(element: HTMLElement) {
        this.observedElements.push(element);
        elementCallbacks.push({ element, callback: this.callback });
        this.callback([], this);
      }

      /**
       * Simulates unsubscribing from observing a specific element.
       * Removes the element from the mapping.
       * @param {HTMLElement} element - Element to stop observing
       */
      unobserve(element: HTMLElement) {
        const index = this.observedElements.indexOf(element);
        if (index > -1) {
          this.observedElements.splice(index, 1);
        }
        const callbackIndex = elementCallbacks.findIndex(
          (pair) => pair.element === element
        );
        if (callbackIndex > -1) {
          elementCallbacks.splice(callbackIndex, 1);
        }
      }

      /**
       * Simulates disconnecting observer and removes all element mappings.
       * This is called during cleanup in useLayoutEffect.
       */
      disconnect() {
        this.observedElements.forEach((element) => {
          const callbackIndex = elementCallbacks.findIndex(
            (pair) => pair.element === element
          );
          if (callbackIndex > -1) {
            elementCallbacks.splice(callbackIndex, 1);
          }
        });
        this.observedElements.length = 0;
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

    const pair = elementCallbacks.find((pair) => pair.element === element);
    if (pair) {
      act(() => {
        pair.callback([], {} as ResizeObserver);
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
