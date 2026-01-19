import { renderHook } from '@testing-library/react-hooks';
import { useOnOutsideMouseMove } from '../useOnOutsideMouseMove';

describe('useOnOutsideMouseMove', () => {
  let container: HTMLDivElement;
  let outsideElement: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    outsideElement = document.createElement('div');
    document.body.appendChild(container);
    document.body.appendChild(outsideElement);
  });

  afterEach(() => {
    document.body.removeChild(container);
    document.body.removeChild(outsideElement);
  });

  it('should be defined', () => {
    expect(useOnOutsideMouseMove).toBeDefined();
  });

  it('should add mousemove event listener on mount', () => {
    const addEventListenerSpy = jest.spyOn(document, 'addEventListener');
    const ref = { current: container };
    const callback = jest.fn();

    renderHook(() => useOnOutsideMouseMove(ref, callback));

    expect(addEventListenerSpy).toHaveBeenCalledWith(
      'mousemove',
      expect.any(Function)
    );

    addEventListenerSpy.mockRestore();
  });

  it('should remove mousemove event listener on unmount', () => {
    const removeEventListenerSpy = jest.spyOn(document, 'removeEventListener');
    const ref = { current: container };
    const callback = jest.fn();

    const { unmount } = renderHook(() => useOnOutsideMouseMove(ref, callback));

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      'mousemove',
      expect.any(Function)
    );

    removeEventListenerSpy.mockRestore();
  });

  it('should call callback when mouse moves outside element', () => {
    const ref = { current: container };
    const callback = jest.fn();

    renderHook(() => useOnOutsideMouseMove(ref, callback));

    const event = new MouseEvent('mousemove', {
      bubbles: true,
    });
    Object.defineProperty(event, 'target', {
      value: outsideElement,
      writable: false,
    });

    document.dispatchEvent(event);

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith(event);
  });

  it('should not call callback when mouse moves inside element', () => {
    const ref = { current: container };
    const callback = jest.fn();

    renderHook(() => useOnOutsideMouseMove(ref, callback));

    const event = new MouseEvent('mousemove', {
      bubbles: true,
    });
    Object.defineProperty(event, 'target', {
      value: container,
      writable: false,
    });

    document.dispatchEvent(event);

    expect(callback).not.toHaveBeenCalled();
  });

  it('should not call callback when ref.current is null', () => {
    const ref = { current: null };
    const callback = jest.fn();

    renderHook(() => useOnOutsideMouseMove(ref, callback));

    const event = new MouseEvent('mousemove', {
      bubbles: true,
    });

    document.dispatchEvent(event);

    expect(callback).not.toHaveBeenCalled();
  });

  it('should not call callback when mouse moves over child element', () => {
    const childElement = document.createElement('span');
    container.appendChild(childElement);

    const ref = { current: container };
    const callback = jest.fn();

    renderHook(() => useOnOutsideMouseMove(ref, callback));

    const event = new MouseEvent('mousemove', {
      bubbles: true,
    });
    Object.defineProperty(event, 'target', {
      value: childElement,
      writable: false,
    });

    document.dispatchEvent(event);

    expect(callback).not.toHaveBeenCalled();
  });

  it('should update callback when it changes', () => {
    const ref = { current: container };
    const callback1 = jest.fn();
    const callback2 = jest.fn();

    const { rerender } = renderHook(
      ({ callback }) => useOnOutsideMouseMove(ref, callback),
      { initialProps: { callback: callback1 } }
    );

    rerender({ callback: callback2 });

    const event = new MouseEvent('mousemove', {
      bubbles: true,
    });
    Object.defineProperty(event, 'target', {
      value: outsideElement,
      writable: false,
    });

    document.dispatchEvent(event);

    expect(callback1).not.toHaveBeenCalled();
    expect(callback2).toHaveBeenCalledTimes(1);
  });
});
