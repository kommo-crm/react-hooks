import { act, renderHook } from '@testing-library/react-hooks';
import { Breakpoints, useContainerSize } from '../useContainerSize';

describe('useContainerSize', () => {
  /**
   * Map to store element -> callbacks relationships.
   * This allows us to find all callbacks for a specific element
   * when manually invoking callbacks in tests to simulate element size changes.
   * Uses an array to support multiple ResizeObserver instances observing the same element,
   * which matches the real ResizeObserver API behavior.
   * Every time observe() is called with an element, the callback is added to the array.
   */
  const elementCallbacks = new Map<HTMLElement, ResizeObserverCallback[]>();

  beforeAll(() => {
    /**
     * Mock for ResizeObserver API.
     * ResizeObserver may not be available in test environment (e.g., in jsdom),
     * so we create a mock that mimics the behavior of the real ResizeObserver.
     *
     * How it works:
     * 1. When the hook creates ResizeObserver, constructor is called with a callback
     * 2. When observe(element) is called, callback is added to elementCallbacks array for that element
     * 3. Callback is invoked immediately (for initial measurement)
     * 4. In tests, we can manually invoke all callbacks via updateElementWidth to simulate resize
     * 5. Supports multiple observers for the same element (each observer has its own callback)
     */
    class ResizeObserverMock implements ResizeObserver {
      private readonly callback: ResizeObserverCallback;
      private readonly observedElements = new Set<HTMLElement>();

      /**
       * Stores callback for later use when observe() is called.
       * @param {Function} callback - Callback function that will be called when element size changes
       */
      constructor(callback: ResizeObserverCallback) {
        this.callback = callback;
      }

      /**
       * Simulates subscription to element size changes.
       * Adds the callback to the array for this element and immediately invokes callback
       * for initial element size measurement.
       * In real ResizeObserver, callback is invoked automatically when size changes.
       * Supports multiple observers for the same element by storing callbacks in an array.
       * @param {HTMLElement} element - Element to observe
       */
      observe(element: HTMLElement) {
        this.observedElements.add(element);
        const callbacks = elementCallbacks.get(element) || [];
        if (!callbacks.includes(this.callback)) {
          callbacks.push(this.callback);
          elementCallbacks.set(element, callbacks);
        }
        this.callback([], this);
      }

      /**
       * Simulates unsubscribing from observing a specific element.
       * Removes only this observer's callback from the array.
       * If no callbacks remain, removes the element from the mapping.
       * @param {HTMLElement} element - Element to stop observing
       */
      unobserve(element: HTMLElement) {
        this.observedElements.delete(element);
        const callbacks = elementCallbacks.get(element);
        if (!callbacks) {
          return;
        }
        const index = callbacks.indexOf(this.callback);
        if (index > -1) {
          callbacks.splice(index, 1);
          if (callbacks.length === 0) {
            elementCallbacks.delete(element);
          }
        }
      }

      /**
       * Simulates disconnecting observer and removes this observer's callbacks
       * from all observed elements.
       * This is called during cleanup in useLayoutEffect.
       */
      disconnect() {
        this.observedElements.forEach((element) => {
          const callbacks = elementCallbacks.get(element);
          if (!callbacks) {
            return;
          }
          const index = callbacks.indexOf(this.callback);
          if (index > -1) {
            callbacks.splice(index, 1);
            if (callbacks.length === 0) {
              elementCallbacks.delete(element);
            }
          }
        });
        this.observedElements.clear();
      }
    }

    /**
     * Replace global ResizeObserver with our mock for all tests
     */
    global.ResizeObserver = ResizeObserverMock;
  });

  const createElement = (
    width: number,
    boundingWidth?: number
  ): HTMLElement => {
    const element = document.createElement('div');
    Object.defineProperty(element, 'offsetWidth', {
      configurable: true,
      get: () => width,
    });

    if (boundingWidth !== undefined) {
      element.getBoundingClientRect = jest.fn(() => ({
        width: boundingWidth,
        height: 0,
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
        x: 0,
        y: 0,
        toJSON: () => ({}),
      })) as () => DOMRect;
    }

    return element;
  };

  const updateElementWidth = (
    element: HTMLElement,
    newWidth: number,
    boundingWidth?: number
  ): void => {
    Object.defineProperty(element, 'offsetWidth', {
      configurable: true,
      get: () => newWidth,
    });

    if (boundingWidth !== undefined) {
      element.getBoundingClientRect = jest.fn(() => ({
        width: boundingWidth,
        height: 0,
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
        x: 0,
        y: 0,
        toJSON: () => ({}),
      })) as () => DOMRect;
    }

    const callbacks = elementCallbacks.get(element);
    if (callbacks) {
      callbacks.forEach((callback) => {
        act(() => {
          callback([], {} as ResizeObserver);
        });
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

    const element = createElement(500);

    await act(async () => {
      result.current.ref(element);
      await waitForNextUpdate();
    });

    expect(result.current.size).toBe('md');
    expect(result.current.width).toBe(500);

    /**
     * Verify that changes are not tracked when isEnabled is false
     */
    updateElementWidth(element, 300);

    expect(result.current.size).toBe('md');
    expect(result.current.width).toBe(500);
  });

  it('should throttle resize events with custom throttleTime', async () => {
    const breakpoints = {
      sm: 0,
      md: 400,
      lg: 800,
    } as const;

    const { result, waitForNextUpdate } = renderHook(() =>
      useContainerSize({
        breakpoints,
        throttleTime: 1000,
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

    /**
     * After 100ms, throttle should not have processed the event yet
     * (throttleTime is 1000ms, so we're still within the throttle window)
     */
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 100));
    });

    expect(result.current.size).toBe('md');
    expect(result.current.width).toBe(500);

    /**
     * After 1100ms, throttle should have processed the event
     * (throttleTime is 1000ms, so we've passed the throttle window)
     */
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    });

    expect(result.current.size).toBe('lg');
    expect(result.current.width).toBe(900);
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
    /**
     * Wait for throttle to process the resize event.
     */
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(result.current.size).toBe('lg');
    expect(result.current.width).toBe(900);

    updateElementWidth(element, 300);
    /**
     * Wait for throttle to process the resize event.
     */
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

  describe('calcWidth', () => {
    it('should use offsetWidth by default when calcWidth is not provided', async () => {
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

      expect(result.current.width).toBe(500);
      expect(result.current.size).toBe('md');
    });

    it('should use custom function when calcWidth is a function', async () => {
      const breakpoints = {
        sm: 0,
        md: 400,
        lg: 800,
      } as const;

      const customCalcWidth = jest.fn((element: HTMLElement) => {
        /**
         * Custom logic: return offsetWidth * 2
         */
        return element.offsetWidth * 2;
      });

      const { result, waitForNextUpdate } = renderHook(() =>
        useContainerSize({
          breakpoints,
          calcWidth: customCalcWidth,
        })
      );

      await act(async () => {
        const element = createElement(500);
        result.current.ref(element);
        await waitForNextUpdate();
      });

      expect(customCalcWidth).toHaveBeenCalled();
      /**
       * Expected width: 500 * 2 = 1000
       */
      expect(result.current.width).toBe(1000);
      /**
       * Expected size: 'lg' because 1000 >= 800
       */
      expect(result.current.size).toBe('lg');
    });

    it('should call custom function with correct element', async () => {
      const breakpoints = {
        sm: 0,
        md: 400,
      } as const;

      const customCalcWidth = jest.fn((element: HTMLElement) => {
        return element.offsetWidth;
      });

      const { result, waitForNextUpdate } = renderHook(() =>
        useContainerSize({
          breakpoints,
          calcWidth: customCalcWidth,
        })
      );

      const element = createElement(500);

      await act(async () => {
        result.current.ref(element);
        await waitForNextUpdate();
      });

      expect(customCalcWidth).toHaveBeenCalledWith(element);
      expect(result.current.width).toBe(500);
    });

    it('should update width when using custom function and element size changes', async () => {
      const breakpoints = {
        sm: 0,
        md: 400,
        lg: 800,
      } as const;

      const customCalcWidth = jest.fn((element: HTMLElement) => {
        /**
         * Return offsetWidth minus 100
         */
        return element.offsetWidth - 100;
      });

      const { result, waitForNextUpdate } = renderHook(() =>
        useContainerSize({
          breakpoints,
          calcWidth: customCalcWidth,
          throttleTime: 0,
        })
      );

      const element = createElement(500);

      await act(async () => {
        result.current.ref(element);
        await waitForNextUpdate();
      });

      /**
       * Expected width: 500 - 100 = 400
       */
      expect(result.current.width).toBe(400);
      /**
       * Expected size: 'md' because 400 >= 400
       */
      expect(result.current.size).toBe('md');

      updateElementWidth(element, 900);
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      /**
       * Expected width: 900 - 100 = 800
       */
      expect(result.current.width).toBe(800);
      /**
       * Expected size: 'lg' because 800 >= 800
       */
      expect(result.current.size).toBe('lg');
    });

    it('should work with custom function when breakpoints is null', async () => {
      const customCalcWidth = jest.fn((element: HTMLElement) => {
        return element.offsetWidth + 50;
      });

      const { result, waitForNextUpdate } = renderHook(() =>
        useContainerSize({
          breakpoints: null,
          calcWidth: customCalcWidth,
        })
      );

      await act(async () => {
        const element = createElement(500);
        result.current.ref(element);
        await waitForNextUpdate();
      });

      expect(customCalcWidth).toHaveBeenCalled();
      /**
       * Expected width: 500 + 50 = 550
       */
      expect(result.current.width).toBe(550);
      expect(result.current.size).toBeNull();
    });
  });

  describe('breakpoints = null', () => {
    it('should return only width when breakpoints is null', async () => {
      const { result, waitForNextUpdate } = renderHook(() =>
        useContainerSize({ breakpoints: null })
      );

      await act(async () => {
        const element = createElement(500);
        result.current.ref(element);
        await waitForNextUpdate();
      });

      expect(result.current.width).toBe(500);
      expect(result.current.size).toBeNull();
    });

    it('should return null size and width when breakpoints is null and element is not attached', () => {
      const { result } = renderHook(() =>
        useContainerSize({ breakpoints: null })
      );

      expect(result.current.size).toBeNull();
      expect(result.current.width).toBeNull();
    });

    it('should update width when breakpoints is null and element size changes', async () => {
      const { result, waitForNextUpdate } = renderHook(() =>
        useContainerSize({
          breakpoints: null,
          throttleTime: 0,
        })
      );

      const element = createElement(500);

      await act(async () => {
        result.current.ref(element);
        await waitForNextUpdate();
      });

      expect(result.current.width).toBe(500);
      expect(result.current.size).toBeNull();

      updateElementWidth(element, 900);
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      expect(result.current.width).toBe(900);
      expect(result.current.size).toBeNull();
    });

    it('should work with custom function when breakpoints is null', async () => {
      const customCalcWidth = jest.fn((element: HTMLElement) => {
        return element.getBoundingClientRect().width;
      });

      const { result, waitForNextUpdate } = renderHook(() =>
        useContainerSize({
          breakpoints: null,
          calcWidth: customCalcWidth,
        })
      );

      await act(async () => {
        const element = createElement(500, 600);
        result.current.ref(element);
        await waitForNextUpdate();
      });

      expect(customCalcWidth).toHaveBeenCalled();
      expect(result.current.width).toBe(600);
      expect(result.current.size).toBeNull();
    });

    it('should reset to null when element is detached and breakpoints is null', async () => {
      const { result, waitForNextUpdate } = renderHook(() =>
        useContainerSize({ breakpoints: null })
      );

      const element = createElement(500);

      await act(async () => {
        result.current.ref(element);
        await waitForNextUpdate();
      });

      expect(result.current.width).toBe(500);
      expect(result.current.size).toBeNull();

      act(() => {
        result.current.ref(null);
      });

      expect(result.current.width).toBeNull();
      expect(result.current.size).toBeNull();
    });
  });
});
