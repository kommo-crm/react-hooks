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

  it('should call handler when mouse moves outside element', () => {
    const ref = { current: container };
    const handler = jest.fn();

    renderHook(() => useOnOutsideMouseMove({ ref, handler }));

    const event = new MouseEvent('mousemove', {
      bubbles: true,
    });
    Object.defineProperty(event, 'target', {
      value: outsideElement,
      writable: false,
    });

    document.dispatchEvent(event);

    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler).toHaveBeenCalledWith(event);
  });

  it('should not call handler when mouse moves inside element', () => {
    const ref = { current: container };
    const handler = jest.fn();

    renderHook(() => useOnOutsideMouseMove({ ref, handler }));

    const event = new MouseEvent('mousemove', {
      bubbles: true,
    });
    Object.defineProperty(event, 'target', {
      value: container,
      writable: false,
    });

    document.dispatchEvent(event);

    expect(handler).not.toHaveBeenCalled();
  });

  it('should not call handler when ref.current is null', () => {
    const ref = { current: null };
    const handler = jest.fn();

    renderHook(() => useOnOutsideMouseMove({ ref, handler }));

    const event = new MouseEvent('mousemove', {
      bubbles: true,
    });

    document.dispatchEvent(event);

    expect(handler).not.toHaveBeenCalled();
  });

  it('should not call handler when mouse moves over child element', () => {
    const childElement = document.createElement('span');
    container.appendChild(childElement);

    const ref = { current: container };
    const handler = jest.fn();

    renderHook(() => useOnOutsideMouseMove({ ref, handler }));

    const event = new MouseEvent('mousemove', {
      bubbles: true,
    });
    Object.defineProperty(event, 'target', {
      value: childElement,
      writable: false,
    });

    document.dispatchEvent(event);

    expect(handler).not.toHaveBeenCalled();
  });

  it('should update handler when it changes', () => {
    const ref = { current: container };
    const handler1 = jest.fn();
    const handler2 = jest.fn();

    const { rerender } = renderHook(
      function renderHookFn(props: {
        /**
         * Handler to be called when mouse moves outside the element.
         */
        handler: (event: MouseEvent) => void;
      }) {
        return useOnOutsideMouseMove({ ref, handler: props.handler });
      },
      { initialProps: { handler: handler1 } }
    );

    rerender({ handler: handler2 });

    const event = new MouseEvent('mousemove', {
      bubbles: true,
    });

    Object.defineProperty(event, 'target', {
      value: outsideElement,
      writable: false,
    });

    document.dispatchEvent(event);

    expect(handler1).not.toHaveBeenCalled();
    expect(handler2).toHaveBeenCalledTimes(1);
  });

  it('should unsubscribe handler on unmount', () => {
    const ref = { current: container };
    const handler = jest.fn();

    const { unmount } = renderHook(() => {
      return useOnOutsideMouseMove({ ref, handler });
    });

    unmount();

    const event = new MouseEvent('mousemove', {
      bubbles: true,
    });

    Object.defineProperty(event, 'target', {
      value: outsideElement,
      writable: false,
    });

    document.dispatchEvent(event);

    expect(handler).not.toHaveBeenCalled();
  });

  it('should support context for grouping handlers', () => {
    const ref1 = { current: container };
    const ref2 = { current: outsideElement };
    const handler1 = jest.fn();
    const handler2 = jest.fn();

    renderHook(() =>
      useOnOutsideMouseMove({
        ref: ref1,
        handler: handler1,
        context: 'context1',
      })
    );

    renderHook(() =>
      useOnOutsideMouseMove({
        ref: ref2,
        handler: handler2,
        context: 'context2',
      })
    );

    const event = new MouseEvent('mousemove', {
      bubbles: true,
    });

    Object.defineProperty(event, 'target', {
      value: document.body,
      writable: false,
    });

    document.dispatchEvent(event);

    expect(handler1).toHaveBeenCalledTimes(1);
    expect(handler2).toHaveBeenCalledTimes(1);
  });
});
