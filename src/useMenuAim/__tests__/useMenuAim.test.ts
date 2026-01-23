import { renderHook, act } from '@testing-library/react-hooks';
import { useMenuAim } from '../useMenuAim';
import { MenuAimDirection } from '../useMenuAim.types';

describe('useMenuAim', () => {
  beforeAll(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.clearAllTimers();
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  it('should be defined', () => {
    expect(useMenuAim).toBeDefined();
  });

  it('should return correct structure', () => {
    const { result } = renderHook(() =>
      useMenuAim({ direction: MenuAimDirection.RIGHT })
    );

    expect(result.current).toHaveProperty('contentRef');
    expect(result.current).toHaveProperty('isAiming');
    expect(result.current).toHaveProperty('switchDelay');
  });

  it('should use default values', () => {
    const { result } = renderHook(() =>
      useMenuAim({ direction: MenuAimDirection.RIGHT })
    );

    expect(result.current.switchDelay).toBe(200);
    expect(result.current.isAiming()).toBe(false);
  });

  it('should respect custom switchDelay', () => {
    const { result } = renderHook(() =>
      useMenuAim({ direction: MenuAimDirection.RIGHT, switchDelay: 500 })
    );

    expect(result.current.switchDelay).toBe(500);
  });

  it('should add mousemove event listener when enabled', () => {
    const addEventListenerSpy = jest.spyOn(document, 'addEventListener');

    renderHook(() => useMenuAim({ direction: MenuAimDirection.RIGHT }));

    expect(addEventListenerSpy).toHaveBeenCalledWith(
      'mousemove',
      expect.any(Function)
    );

    addEventListenerSpy.mockRestore();
  });

  it('should not add event listener when disabled', () => {
    const addEventListenerSpy = jest.spyOn(document, 'addEventListener');
    addEventListenerSpy.mockClear();

    renderHook(() =>
      useMenuAim({ direction: MenuAimDirection.RIGHT, isEnabled: false })
    );

    expect(addEventListenerSpy).not.toHaveBeenCalledWith(
      'mousemove',
      expect.any(Function)
    );

    addEventListenerSpy.mockRestore();
  });

  it('should remove event listener on unmount', () => {
    const removeEventListenerSpy = jest.spyOn(document, 'removeEventListener');

    const { unmount } = renderHook(() =>
      useMenuAim({ direction: MenuAimDirection.RIGHT })
    );

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      'mousemove',
      expect.any(Function)
    );

    removeEventListenerSpy.mockRestore();
  });

  it('should reset isAiming when isEnabled changes to false', () => {
    const handler = jest.fn();

    const { rerender } = renderHook(
      function renderMenuAim(props: {
        /**
         * Whether the hook is enabled.
         */
        isEnabled: boolean;
      }) {
        return useMenuAim({
          direction: MenuAimDirection.RIGHT,
          isEnabled: props.isEnabled,
          handler,
        });
      },
      { initialProps: { isEnabled: true } }
    );

    rerender({ isEnabled: false });

    expect(handler).toHaveBeenCalledWith(false);
  });

  it('should call handler when isAiming changes', () => {
    const handler = jest.fn();

    renderHook(() =>
      useMenuAim({
        direction: MenuAimDirection.RIGHT,
        handler,
      })
    );

    expect(handler).not.toHaveBeenCalled();
  });

  it('should clear cursor refs when isEnabled changes to false', () => {
    const handler = jest.fn();

    const { rerender } = renderHook(
      function renderMenuAim(props: {
        /**
         * Whether the hook is enabled.
         */
        isEnabled: boolean;
      }) {
        return useMenuAim({
          direction: MenuAimDirection.RIGHT,
          isEnabled: props.isEnabled,
          handler,
        });
      },
      { initialProps: { isEnabled: true } }
    );

    rerender({ isEnabled: false });

    expect(handler).toHaveBeenCalledWith(false);
  });

  it('should handle all direction options', () => {
    const directions = [
      MenuAimDirection.TOP,
      MenuAimDirection.RIGHT,
      MenuAimDirection.BOTTOM,
      MenuAimDirection.LEFT,
    ];

    directions.forEach((direction) => {
      const { result } = renderHook(() => useMenuAim({ direction }));

      expect(result.current.contentRef).toBeDefined();
      expect(result.current.isAiming()).toBe(false);
    });
  });
});

describe('useMenuAim aiming detection', () => {
  const createMockElement = (rect: Partial<DOMRect>) => {
    return {
      getBoundingClientRect: () => ({
        top: 100,
        right: 300,
        bottom: 300,
        left: 200,
        width: 100,
        height: 200,
        x: 200,
        y: 100,
        toJSON: () => {},
        ...rect,
      }),
    } as HTMLElement;
  };

  const simulateMouseMove = (pageX: number, pageY: number) => {
    const event = new MouseEvent('mousemove', {
      bubbles: true,
      cancelable: true,
    });
    Object.defineProperty(event, 'pageX', { value: pageX });
    Object.defineProperty(event, 'pageY', { value: pageY });
    document.dispatchEvent(event);
  };

  beforeAll(() => {
    jest.useFakeTimers();
    Object.defineProperty(window, 'pageXOffset', { value: 0, writable: true });
    Object.defineProperty(window, 'pageYOffset', { value: 0, writable: true });
  });

  afterEach(() => {
    jest.clearAllTimers();
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  it('should set isAimingRef to true when moving toward menu (RIGHT direction)', () => {
    const { result } = renderHook(() =>
      useMenuAim({
        direction: MenuAimDirection.RIGHT,
        tolerance: 50,
      })
    );

    // Attach mock element to contentRef
    const mockElement = createMockElement({
      left: 200,
      right: 300,
      top: 100,
      bottom: 300,
    });
    (result.current.contentRef as React.MutableRefObject<HTMLElement>).current =
      mockElement;

    act(() => {
      // First move - establishes previous position (left of the menu)
      simulateMouseMove(50, 150);
    });

    act(() => {
      // Second move - moving right toward the menu, within intent triangle
      simulateMouseMove(100, 160);
    });

    expect(result.current.isAiming()).toBe(true);
  });

  it('should set isAimingRef to false when moving away from menu (RIGHT direction)', () => {
    const { result } = renderHook(() =>
      useMenuAim({
        direction: MenuAimDirection.RIGHT,
        tolerance: 50,
      })
    );

    const mockElement = createMockElement({
      left: 200,
      right: 300,
      top: 100,
      bottom: 300,
    });
    (result.current.contentRef as React.MutableRefObject<HTMLElement>).current =
      mockElement;

    act(() => {
      // First move
      simulateMouseMove(100, 150);
    });

    act(() => {
      // Second move - moving left, away from the menu
      simulateMouseMove(50, 150);
    });

    expect(result.current.isAiming()).toBe(false);
  });

  it('should set isAimingRef to false when moving up (perpendicular to RIGHT menu)', () => {
    const { result } = renderHook(() =>
      useMenuAim({
        direction: MenuAimDirection.RIGHT,
        tolerance: 50,
      })
    );

    const mockElement = createMockElement({
      left: 200,
      right: 300,
      top: 100,
      bottom: 300,
    });
    (result.current.contentRef as React.MutableRefObject<HTMLElement>).current =
      mockElement;

    act(() => {
      simulateMouseMove(100, 200);
    });

    act(() => {
      // Moving straight up - not toward the menu
      simulateMouseMove(100, 50);
    });

    expect(result.current.isAiming()).toBe(false);
  });

  it('should set isAimingRef to true when moving toward menu (LEFT direction)', () => {
    const { result } = renderHook(() =>
      useMenuAim({
        direction: MenuAimDirection.LEFT,
        tolerance: 50,
      })
    );

    const mockElement = createMockElement({
      left: 50,
      right: 150,
      top: 100,
      bottom: 300,
    });
    (result.current.contentRef as React.MutableRefObject<HTMLElement>).current =
      mockElement;

    act(() => {
      // Starting position to the right of the menu
      simulateMouseMove(300, 150);
    });

    act(() => {
      // Moving left toward the menu
      simulateMouseMove(200, 160);
    });

    expect(result.current.isAiming()).toBe(true);
  });

  it('should set isAimingRef to true when moving toward menu (BOTTOM direction)', () => {
    const { result } = renderHook(() =>
      useMenuAim({
        direction: MenuAimDirection.BOTTOM,
        tolerance: 50,
      })
    );

    const mockElement = createMockElement({
      left: 100,
      right: 300,
      top: 200,
      bottom: 400,
    });
    (result.current.contentRef as React.MutableRefObject<HTMLElement>).current =
      mockElement;

    act(() => {
      // Starting position above the menu
      simulateMouseMove(150, 50);
    });

    act(() => {
      // Moving down toward the menu
      simulateMouseMove(160, 100);
    });

    expect(result.current.isAiming()).toBe(true);
  });

  it('should set isAimingRef to true when moving toward menu (TOP direction)', () => {
    const { result } = renderHook(() =>
      useMenuAim({
        direction: MenuAimDirection.TOP,
        tolerance: 50,
      })
    );

    const mockElement = createMockElement({
      left: 100,
      right: 300,
      top: 50,
      bottom: 150,
    });
    (result.current.contentRef as React.MutableRefObject<HTMLElement>).current =
      mockElement;

    act(() => {
      // Starting position below the menu
      simulateMouseMove(150, 300);
    });

    act(() => {
      // Moving up toward the menu
      simulateMouseMove(160, 200);
    });

    expect(result.current.isAiming()).toBe(true);
  });

  it('should set isAimingRef to false when contentRef is not attached', () => {
    const { result } = renderHook(() =>
      useMenuAim({
        direction: MenuAimDirection.RIGHT,
        tolerance: 50,
      })
    );

    // contentRef.current is null by default

    act(() => {
      simulateMouseMove(50, 150);
    });

    act(() => {
      simulateMouseMove(100, 160);
    });

    expect(result.current.isAiming()).toBe(false);
  });

  it('should update isAimingRef when cursor changes direction', () => {
    const { result } = renderHook(() =>
      useMenuAim({
        direction: MenuAimDirection.RIGHT,
        tolerance: 50,
      })
    );

    const mockElement = createMockElement({
      left: 200,
      right: 300,
      top: 100,
      bottom: 300,
    });
    (result.current.contentRef as React.MutableRefObject<HTMLElement>).current =
      mockElement;

    // Move toward menu
    act(() => {
      simulateMouseMove(50, 150);
    });

    act(() => {
      simulateMouseMove(100, 160);
    });

    expect(result.current.isAiming()).toBe(true);

    // Now move away from menu (back to the left)
    act(() => {
      simulateMouseMove(50, 155);
    });

    expect(result.current.isAiming()).toBe(false);
  });
});
