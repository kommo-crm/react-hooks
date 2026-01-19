import { renderHook, act } from '@testing-library/react-hooks';
import { useIsTouchDevice } from '../useIsTouchDevice';

type PointerDownHandler = (event: Partial<PointerEvent>) => void;

describe('useIsTouchDevice', () => {
  let addEventListenerSpy: jest.SpyInstance;
  let removeEventListenerSpy: jest.SpyInstance;
  let pointerDownHandler: PointerDownHandler | null = null;

  beforeEach(() => {
    pointerDownHandler = null;

    addEventListenerSpy = jest
      .spyOn(window, 'addEventListener')
      .mockImplementation((type, handler) => {
        if (type === 'pointerdown') {
          pointerDownHandler = handler as PointerDownHandler;
        }
      });

    removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');
  });

  afterEach(() => {
    addEventListenerSpy.mockRestore();
    removeEventListenerSpy.mockRestore();
  });

  const simulatePointerDown = (pointerType: string) => {
    if (pointerDownHandler) {
      act(() => {
        pointerDownHandler!({ pointerType } as Partial<PointerEvent>);
      });
    }
  };

  it('should be defined', () => {
    expect(useIsTouchDevice).toBeDefined();
  });

  it('should return a boolean', () => {
    const { result } = renderHook(() => useIsTouchDevice());

    expect(typeof result.current).toBe('boolean');
  });

  it('should switch to touch mode on touch pointerdown event', () => {
    const { result } = renderHook(() => useIsTouchDevice());

    simulatePointerDown('touch');

    expect(result.current).toBe(true);
  });

  it('should switch to mouse mode on mouse pointerdown event', () => {
    const { result } = renderHook(() => useIsTouchDevice());

    simulatePointerDown('touch');
    expect(result.current).toBe(true);

    simulatePointerDown('mouse');
    expect(result.current).toBe(false);
  });

  it('should add event listener on mount', () => {
    renderHook(() => useIsTouchDevice());

    expect(addEventListenerSpy).toHaveBeenCalledWith(
      'pointerdown',
      expect.any(Function)
    );
  });

  it('should remove event listener on unmount', () => {
    const { unmount } = renderHook(() => useIsTouchDevice());

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      'pointerdown',
      expect.any(Function)
    );
  });

  it('should not change state for pen pointerdown event', () => {
    const { result } = renderHook(() => useIsTouchDevice());

    simulatePointerDown('touch');
    const valueBeforePen = result.current;

    simulatePointerDown('pen');

    expect(result.current).toBe(valueBeforePen);
  });
});
