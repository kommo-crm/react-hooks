import { renderHook, act } from '@testing-library/react-hooks';
import { useIsAiming } from '../useIsAiming';

describe('useIsAiming', () => {
  beforeAll(() => {
    jest.useFakeTimers();
    Object.defineProperty(window, 'scrollX', { value: 0, writable: true });
    Object.defineProperty(window, 'scrollY', { value: 0, writable: true });
  });

  afterEach(() => {
    jest.clearAllTimers();
  });

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

  describe('basic functionality', () => {
    it('should be defined', () => {
      expect(useIsAiming).toBeDefined();
    });

    it('should return correct structure', () => {
      const { result } = renderHook(() => useIsAiming({}));

      expect(result.current).toHaveProperty('ref');
      expect(result.current).toHaveProperty('isAiming');
      expect(typeof result.current.isAiming).toBe('function');
    });

    it('should use default values', () => {
      const { result } = renderHook(() => useIsAiming({}));

      expect(result.current.isAiming()).toBe(false);
    });

    it('should add mousemove event listener when enabled', () => {
      const addEventListenerSpy = jest.spyOn(document, 'addEventListener');

      renderHook(() => useIsAiming({}));

      expect(addEventListenerSpy).toHaveBeenCalledWith(
        'mousemove',
        expect.any(Function)
      );

      addEventListenerSpy.mockRestore();
    });

    it('should not add event listener when disabled', () => {
      const addEventListenerSpy = jest.spyOn(document, 'addEventListener');
      addEventListenerSpy.mockClear();

      renderHook(() => useIsAiming({ isEnabled: false }));

      expect(addEventListenerSpy).not.toHaveBeenCalledWith(
        'mousemove',
        expect.any(Function)
      );

      addEventListenerSpy.mockRestore();
    });

    it('should remove event listener on unmount', () => {
      const removeEventListenerSpy = jest.spyOn(
        document,
        'removeEventListener'
      );

      const { unmount } = renderHook(() => useIsAiming({}));

      unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        'mousemove',
        expect.any(Function)
      );

      removeEventListenerSpy.mockRestore();
    });
  });

  describe('onChange callback', () => {
    it('should call onChange when isAiming changes from false to true', () => {
      const onChange = jest.fn();

      const { result } = renderHook(() =>
        useIsAiming({
          onChange,
          tolerance: 50,
        })
      );

      const mockElement = createMockElement({
        left: 200,
        right: 300,
        top: 100,
        bottom: 300,
      });
      (result.current.ref as React.MutableRefObject<HTMLElement>).current =
        mockElement;

      act(() => {
        simulateMouseMove(50, 150);
      });

      act(() => {
        simulateMouseMove(100, 160);
      });

      // Advance timer to trigger the animation frame
      act(() => {
        jest.advanceTimersByTime(16);
      });

      expect(onChange).toHaveBeenCalledWith(true);
    });

    it('should call onChange when isAiming changes from true to false', () => {
      const onChange = jest.fn();

      const { result } = renderHook(() =>
        useIsAiming({
          onChange,
          tolerance: 10, // Small tolerance to allow state change
        })
      );

      const mockElement = createMockElement({
        left: 200,
        right: 300,
        top: 100,
        bottom: 300,
      });
      (result.current.ref as React.MutableRefObject<HTMLElement>).current =
        mockElement;

      // Move toward menu to set isAiming to true
      act(() => {
        simulateMouseMove(50, 150);
      });

      act(() => {
        simulateMouseMove(100, 160);
      });

      // Advance timer to trigger the animation frame
      act(() => {
        jest.advanceTimersByTime(16);
      });

      expect(result.current.isAiming()).toBe(true);

      onChange.mockClear();

      // Move away from menu with enough movement to trigger state change
      act(() => {
        simulateMouseMove(10, 10); // Move far away from menu
      });

      // Advance timer to trigger the animation frame
      act(() => {
        jest.advanceTimersByTime(16);
      });

      expect(result.current.isAiming()).toBe(false);
      expect(onChange).toHaveBeenCalledWith(false);
    });

    it('should not call onChange when value does not change', () => {
      const onChange = jest.fn();

      const { result } = renderHook(() =>
        useIsAiming({
          onChange,
          tolerance: 50, // Large tolerance to prevent state changes
        })
      );

      const mockElement = createMockElement({
        left: 200,
        right: 300,
        top: 100,
        bottom: 300,
      });
      (result.current.ref as React.MutableRefObject<HTMLElement>).current =
        mockElement;

      // First move - establishes previous position (far from menu)
      act(() => {
        simulateMouseMove(50, 150);
      });

      // Second move - move toward menu to establish aiming state
      act(() => {
        simulateMouseMove(100, 160); // Move toward menu
      });

      // Advance timer to trigger the animation frame
      act(() => {
        jest.advanceTimersByTime(16);
      });

      // Verify we're in aiming state
      expect(result.current.isAiming()).toBe(true);

      // Clear onChange calls from initialization and setup moves
      onChange.mockClear();

      // Third move - small movement that keeps aiming state true
      // This movement should not trigger onChange because state remains true
      act(() => {
        simulateMouseMove(110, 170); // Continue moving toward menu
      });

      // Advance timer to trigger the animation frame
      act(() => {
        jest.advanceTimersByTime(16);
      });

      // State should remain true
      expect(result.current.isAiming()).toBe(true);
      // onChange should not be called because state didn't change (remained true)
      expect(onChange).not.toHaveBeenCalled();
    });
  });

  describe('tolerance behavior', () => {
    it('should allow transition from false to true with small threshold', () => {
      const onChange = jest.fn();

      const { result } = renderHook(() =>
        useIsAiming({
          onChange,
          tolerance: 1000, // Very high tolerance
        })
      );

      const mockElement = createMockElement({
        left: 200,
        right: 300,
        top: 100,
        bottom: 300,
      });
      (result.current.ref as React.MutableRefObject<HTMLElement>).current =
        mockElement;

      act(() => {
        simulateMouseMove(50, 150);
      });

      // Small movement (less than 5px threshold) - should not trigger transition
      act(() => {
        simulateMouseMove(51, 151); // ~1.4px movement
      });

      // Advance timer to trigger the animation frame
      act(() => {
        jest.advanceTimersByTime(16);
      });

      expect(result.current.isAiming()).toBe(false);
      expect(onChange).not.toHaveBeenCalled();

      // Larger movement (more than 5px threshold) - should trigger transition
      act(() => {
        simulateMouseMove(60, 160); // ~12.7px movement from previous position
      });

      // Advance timer to trigger the animation frame
      act(() => {
        jest.advanceTimersByTime(16);
      });

      // Should transition to true with sufficient movement
      expect(result.current.isAiming()).toBe(true);
      expect(onChange).toHaveBeenCalledWith(true);
    });

    it('should respect tolerance when transitioning from true to false', () => {
      const onChange = jest.fn();

      const { result } = renderHook(() =>
        useIsAiming({
          onChange,
          tolerance: 100,
        })
      );

      const mockElement = createMockElement({
        left: 200,
        right: 300,
        top: 100,
        bottom: 300,
      });
      (result.current.ref as React.MutableRefObject<HTMLElement>).current =
        mockElement;

      // Move toward menu to set isAiming to true
      act(() => {
        simulateMouseMove(50, 150);
      });

      act(() => {
        simulateMouseMove(100, 160);
      });

      // Advance timer to trigger the animation frame
      act(() => {
        jest.advanceTimersByTime(16);
      });

      expect(result.current.isAiming()).toBe(true);

      onChange.mockClear();

      // Small movement away (less than tolerance)
      // When moving away but accumulated movement is less than tolerance,
      // the function returns early without calling setIsAiming
      // So onChange should not be called
      act(() => {
        simulateMouseMove(101, 161); // ~1.4px movement - less than tolerance
      });

      // Advance timer to trigger the animation frame
      act(() => {
        jest.advanceTimersByTime(16);
      });

      // Should still be true because movement is less than tolerance
      expect(result.current.isAiming()).toBe(true);
      // onChange should not be called because state didn't change (remained true)
      expect(onChange).not.toHaveBeenCalled();

      // Large movement away (more than tolerance)
      act(() => {
        simulateMouseMove(200, 200); // ~141px movement
      });

      // Advance timer to trigger the animation frame
      act(() => {
        jest.advanceTimersByTime(16);
      });

      // Should now be false
      expect(result.current.isAiming()).toBe(false);
      expect(onChange).toHaveBeenCalledWith(false);
    });
  });

  describe('idleTimeout behavior', () => {
    it('should set isAiming to false after idle timeout', () => {
      const onChange = jest.fn();

      const { result } = renderHook(() =>
        useIsAiming({
          onChange,
          idleTimeout: 500,
        })
      );

      const mockElement = createMockElement({
        left: 200,
        right: 300,
        top: 100,
        bottom: 300,
      });
      (result.current.ref as React.MutableRefObject<HTMLElement>).current =
        mockElement;

      // Move toward menu
      act(() => {
        simulateMouseMove(50, 150);
      });

      act(() => {
        simulateMouseMove(100, 160);
      });

      // Advance timer to trigger the animation frame
      act(() => {
        jest.advanceTimersByTime(16);
      });

      expect(result.current.isAiming()).toBe(true);
      onChange.mockClear();

      // Advance time past idle timeout without moving
      act(() => {
        jest.advanceTimersByTime(500);
      });

      expect(result.current.isAiming()).toBe(false);
      expect(onChange).toHaveBeenCalledWith(false);
    });

    it('should reset idle timeout on mouse movement', () => {
      const onChange = jest.fn();

      const { result } = renderHook(() =>
        useIsAiming({
          onChange,
          idleTimeout: 500,
        })
      );

      const mockElement = createMockElement({
        left: 200,
        right: 300,
        top: 100,
        bottom: 300,
      });
      (result.current.ref as React.MutableRefObject<HTMLElement>).current =
        mockElement;

      // Move toward menu
      act(() => {
        simulateMouseMove(50, 150);
      });

      act(() => {
        simulateMouseMove(100, 160);
      });

      // Advance timer to trigger the animation frame
      act(() => {
        jest.advanceTimersByTime(16);
      });

      expect(result.current.isAiming()).toBe(true);

      onChange.mockClear();

      // Advance time but not past timeout
      act(() => {
        jest.advanceTimersByTime(400);
      });

      // Move again - should reset timeout
      // Use a movement that continues aiming toward menu
      act(() => {
        simulateMouseMove(110, 170);
      });

      // Advance time again (but not past timeout)
      act(() => {
        jest.advanceTimersByTime(400);
      });

      // Should still be true because timeout was reset
      expect(result.current.isAiming()).toBe(true);
      // onChange should not be called because state didn't change (remained true)
      expect(onChange).not.toHaveBeenCalled();

      // Now advance past timeout
      act(() => {
        jest.advanceTimersByTime(200);
      });

      expect(result.current.isAiming()).toBe(false);
      expect(onChange).toHaveBeenCalledWith(false);
    });

    it('should use custom idleTimeout value', () => {
      const onChange = jest.fn();

      const { result } = renderHook(() =>
        useIsAiming({
          onChange,
          idleTimeout: 1000,
        })
      );

      const mockElement = createMockElement({
        left: 200,
        right: 300,
        top: 100,
        bottom: 300,
      });
      (result.current.ref as React.MutableRefObject<HTMLElement>).current =
        mockElement;

      act(() => {
        simulateMouseMove(50, 150);
      });

      act(() => {
        simulateMouseMove(100, 160);
      });

      // Advance timer to trigger the animation frame
      act(() => {
        jest.advanceTimersByTime(16);
      });

      expect(result.current.isAiming()).toBe(true);
      onChange.mockClear();

      // Advance time less than custom timeout
      act(() => {
        jest.advanceTimersByTime(500);
      });

      expect(result.current.isAiming()).toBe(true);
      expect(onChange).not.toHaveBeenCalled();

      // Advance past custom timeout
      act(() => {
        jest.advanceTimersByTime(600);
      });

      expect(result.current.isAiming()).toBe(false);
      expect(onChange).toHaveBeenCalledWith(false);
    });
  });

  describe('cursor inside element', () => {
    it('should set isAiming to false when cursor is inside element', () => {
      const onChange = jest.fn();

      const { result } = renderHook(() =>
        useIsAiming({
          onChange,
        })
      );

      const mockElement = createMockElement({
        left: 200,
        right: 300,
        top: 100,
        bottom: 300,
      });
      (result.current.ref as React.MutableRefObject<HTMLElement>).current =
        mockElement;

      // Move toward menu
      act(() => {
        simulateMouseMove(50, 150);
      });

      act(() => {
        simulateMouseMove(100, 160);
      });

      // Advance timer to trigger the animation frame
      act(() => {
        jest.advanceTimersByTime(16);
      });

      expect(result.current.isAiming()).toBe(true);
      onChange.mockClear();

      // Move cursor inside element
      act(() => {
        simulateMouseMove(250, 200);
      });

      // Advance timer to trigger the animation frame
      act(() => {
        jest.advanceTimersByTime(16);
      });

      expect(result.current.isAiming()).toBe(false);
      expect(onChange).toHaveBeenCalledWith(false);
    });

    it('should keep isAiming false when cursor moves inside element', () => {
      const onChange = jest.fn();

      const { result } = renderHook(() =>
        useIsAiming({
          onChange,
        })
      );

      const mockElement = createMockElement({
        left: 200,
        right: 300,
        top: 100,
        bottom: 300,
      });
      (result.current.ref as React.MutableRefObject<HTMLElement>).current =
        mockElement;

      // Start inside element
      act(() => {
        simulateMouseMove(250, 200);
      });

      // Clear onChange calls from initialization
      onChange.mockClear();

      // Move slightly inside element - should not change aiming state (still false)
      act(() => {
        simulateMouseMove(251, 201);
      });

      // Advance timer to trigger the animation frame
      act(() => {
        jest.advanceTimersByTime(16);
      });

      expect(result.current.isAiming()).toBe(false);
      // onChange should not be called because state didn't change (remained false)
      expect(onChange).not.toHaveBeenCalled();
    });
  });

  describe('aiming detection', () => {
    it('should detect aiming when moving toward menu from left', () => {
      const { result } = renderHook(() =>
        useIsAiming({
          tolerance: 50,
        })
      );

      const mockElement = createMockElement({
        left: 200,
        right: 300,
        top: 100,
        bottom: 300,
      });
      (result.current.ref as React.MutableRefObject<HTMLElement>).current =
        mockElement;

      act(() => {
        simulateMouseMove(50, 150);
      });

      act(() => {
        simulateMouseMove(100, 160);
      });

      // Advance timer to trigger the animation frame
      act(() => {
        jest.advanceTimersByTime(16);
      });

      expect(result.current.isAiming()).toBe(true);
    });

    it('should detect aiming when moving toward menu from top', () => {
      const { result } = renderHook(() =>
        useIsAiming({
          tolerance: 50,
        })
      );

      const mockElement = createMockElement({
        left: 100,
        right: 300,
        top: 200,
        bottom: 400,
      });
      (result.current.ref as React.MutableRefObject<HTMLElement>).current =
        mockElement;

      act(() => {
        simulateMouseMove(150, 50);
      });

      act(() => {
        simulateMouseMove(160, 100);
      });

      // Advance timer to trigger the animation frame
      act(() => {
        jest.advanceTimersByTime(16);
      });

      expect(result.current.isAiming()).toBe(true);
    });

    it('should detect aiming when moving toward menu from bottom', () => {
      const { result } = renderHook(() =>
        useIsAiming({
          tolerance: 50,
        })
      );

      const mockElement = createMockElement({
        left: 100,
        right: 300,
        top: 50,
        bottom: 150,
      });
      (result.current.ref as React.MutableRefObject<HTMLElement>).current =
        mockElement;

      act(() => {
        simulateMouseMove(150, 300);
      });

      act(() => {
        simulateMouseMove(160, 200);
      });

      // Advance timer to trigger the animation frame
      act(() => {
        jest.advanceTimersByTime(16);
      });

      expect(result.current.isAiming()).toBe(true);
    });

    it('should not detect aiming when moving away from menu', () => {
      const { result } = renderHook(() =>
        useIsAiming({
          tolerance: 50,
        })
      );

      const mockElement = createMockElement({
        left: 200,
        right: 300,
        top: 100,
        bottom: 300,
      });
      (result.current.ref as React.MutableRefObject<HTMLElement>).current =
        mockElement;

      act(() => {
        simulateMouseMove(100, 150);
      });

      act(() => {
        simulateMouseMove(50, 150);
      });

      // Advance timer to trigger the animation frame
      act(() => {
        jest.advanceTimersByTime(16);
      });

      expect(result.current.isAiming()).toBe(false);
    });

    it('should not detect aiming when ref is not attached', () => {
      const { result } = renderHook(() =>
        useIsAiming({
          tolerance: 50,
        })
      );

      act(() => {
        simulateMouseMove(50, 150);
      });

      act(() => {
        simulateMouseMove(100, 160);
      });

      // Advance timer to trigger the animation frame
      act(() => {
        jest.advanceTimersByTime(16);
      });

      expect(result.current.isAiming()).toBe(false);
    });

    it('should update aiming state when cursor changes direction', () => {
      const onChange = jest.fn();

      const { result } = renderHook(() =>
        useIsAiming({
          onChange,
          tolerance: 10, // Small tolerance to allow state change
        })
      );

      const mockElement = createMockElement({
        left: 200,
        right: 300,
        top: 100,
        bottom: 300,
      });
      (result.current.ref as React.MutableRefObject<HTMLElement>).current =
        mockElement;

      // Move toward menu
      act(() => {
        simulateMouseMove(50, 150);
      });

      act(() => {
        simulateMouseMove(100, 160);
      });

      // Advance timer to trigger the animation frame
      act(() => {
        jest.advanceTimersByTime(16);
      });

      expect(result.current.isAiming()).toBe(true);
      onChange.mockClear();

      // Move away from menu with enough movement to trigger state change
      act(() => {
        simulateMouseMove(10, 10); // Move far away from menu
      });

      // Advance timer to trigger the animation frame
      act(() => {
        jest.advanceTimersByTime(16);
      });

      expect(result.current.isAiming()).toBe(false);
      expect(onChange).toHaveBeenCalledWith(false);
    });
  });
});
