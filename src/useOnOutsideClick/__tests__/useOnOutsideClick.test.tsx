import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import TestComponent from './components/TestComponent';
import { useOnOutsideClick } from '../useOnOutsideClick';

describe('useOnOutsideClick', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should be defined', () => {
    expect(useOnOutsideClick).toBeDefined();
  });

  it('should call handler when clicking outside of the ref element', () => {
    const handler = jest.fn();

    render(
      <div>
        <TestComponent onOutsideClick={handler} />
        <div data-testid="outside">Outside</div>
      </div>
    );

    jest.runAllTimers();

    const outsideElement = screen.getByTestId('outside');
    fireEvent.click(outsideElement);

    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('should not call handler when clicking inside the ref element', () => {
    const handler = jest.fn();
    render(
      <div>
        <TestComponent onOutsideClick={handler} />
      </div>
    );

    jest.runAllTimers();

    const insideElement = screen.getByTestId('inside-default');
    fireEvent.click(insideElement);

    expect(handler).not.toHaveBeenCalled();
  });

  it('should call handler only for the specific context', () => {
    const handlerContext1 = jest.fn();
    const handlerContext2 = jest.fn();

    render(
      <div>
        <TestComponent onOutsideClick={handlerContext1} context="context1" />
        <TestComponent onOutsideClick={handlerContext2} context="context2" />
        <div data-testid="outside">Outside</div>
      </div>
    );

    jest.runAllTimers();

    const outsideElement = screen.getByTestId('outside');

    fireEvent.click(outsideElement);

    expect(handlerContext1).toHaveBeenCalledTimes(1);
    expect(handlerContext2).toHaveBeenCalledTimes(1);
  });

  it('should clean up handlers when unmounted in a specific context', () => {
    const handlerContext1 = jest.fn();
    const handlerContext2 = jest.fn();

    const { unmount } = render(
      <div>
        <TestComponent onOutsideClick={handlerContext1} context="context1" />
        <TestComponent onOutsideClick={handlerContext2} context="context2" />
        <div data-testid="outside">Outside</div>
      </div>
    );

    jest.runAllTimers();

    const outsideElement = screen.getByTestId('outside');

    fireEvent.click(outsideElement);
    expect(handlerContext1).toHaveBeenCalledTimes(1);
    expect(handlerContext2).toHaveBeenCalledTimes(1);

    unmount();

    fireEvent.click(outsideElement);

    expect(handlerContext1).toHaveBeenCalledTimes(1);
    expect(handlerContext2).toHaveBeenCalledTimes(1);
  });
  it('should keep other handlers in the same context working when one is unmounted', () => {
    const handler1 = jest.fn();
    const handler2 = jest.fn();

    const { rerender } = render(
      <div>
        <TestComponent onOutsideClick={handler1} context="shared" />
        <TestComponent onOutsideClick={handler2} context="shared" />
        <div data-testid="outside">Outside</div>
      </div>
    );

    jest.runAllTimers();

    const outsideElement = screen.getByTestId('outside');

    fireEvent.click(outsideElement);

    expect(handler1).not.toHaveBeenCalled();
    expect(handler2).toHaveBeenCalledTimes(1);

    rerender(
      <div>
        <TestComponent onOutsideClick={handler1} context="shared" />
        <div data-testid="outside">Outside</div>
      </div>
    );

    jest.runAllTimers();

    const rerenderOutsideElement = screen.getByTestId('outside');

    fireEvent.click(rerenderOutsideElement);
    expect(handler1).toHaveBeenCalledTimes(1);
    expect(handler2).toHaveBeenCalledTimes(1);
  });

  it('should call handler once and close only the last element in the same context when clicking outside', () => {
    const handler1 = jest.fn();
    const handler2 = jest.fn();

    render(
      <div>
        <TestComponent onOutsideClick={handler1} context="shared" />
        <TestComponent onOutsideClick={handler2} context="shared" />
        <div data-testid="outside">Outside</div>
      </div>
    );

    jest.runAllTimers();

    const outsideElement = screen.getByTestId('outside');

    fireEvent.click(outsideElement);

    // Check that only the last handler in the context was called
    expect(handler1).not.toHaveBeenCalled();
    expect(handler2).toHaveBeenCalledTimes(1);
  });
});
