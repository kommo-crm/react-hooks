import { KeyboardEvent } from 'react';
import { renderHook, act } from '@testing-library/react-hooks';
import { useKeyboardListNavigation } from '../useKeyboardListNavigation';

describe('useKeyboardListNavigation', () => {
  const onSelect = jest.fn();
  const onToggle = jest.fn();
  const onHoveredIndexChange = jest.fn();

  afterEach(() => {
    jest.clearAllMocks();
  });

  const createMockEvent = <T extends HTMLElement>(
    code: string
  ): Partial<KeyboardEvent<T>> &
    Pick<KeyboardEvent<T>, 'code' | 'preventDefault'> => ({
    code,
    preventDefault: jest.fn(),
  });

  const createListRef = (itemsLength: number) => {
    const container = document.createElement('div');
    const list = document.createElement('ul');
    for (let i = 0; i < itemsLength; i++) {
      const listItem = document.createElement('li');
      listItem.textContent = `Item ${i + 1}`;
      list.appendChild(listItem);
    }
    container.appendChild(list);
    return { current: list };
  };

  it('should initialize currentHoveredIndex with hoveredIndex', () => {
    const listRef = createListRef(5);

    const { result } = renderHook(() =>
      useKeyboardListNavigation({
        itemsLength: 5,
        isOpened: true,
        onSelect,
        onHoveredIndexChange,
        onToggle,
        hoveredIndex: 2,
        listRef,
      })
    );

    expect(result.current.currentHoveredIndex).toBe(2);
  });

  it('should navigate up with UP_KEY', () => {
    const listRef = createListRef(3);

    const { result } = renderHook(() =>
      useKeyboardListNavigation({
        itemsLength: 3,
        isOpened: true,
        onSelect,
        onHoveredIndexChange,
        onToggle,
        hoveredIndex: 1,
        listRef,
      })
    );

    act(() => {
      result.current.onKeyDown(
        createMockEvent<HTMLDivElement>(
          'ArrowUp'
        ) as KeyboardEvent<HTMLDivElement>
      );
    });

    expect(result.current.currentHoveredIndex).toBe(0);
  });

  it('should navigate down with DOWN_KEY', () => {
    const listRef = createListRef(3);

    const { result } = renderHook(() =>
      useKeyboardListNavigation({
        itemsLength: 3,
        isOpened: true,
        onSelect,
        onHoveredIndexChange,
        onToggle,
        hoveredIndex: 0,
        listRef,
      })
    );

    act(() => {
      result.current.onKeyDown(
        createMockEvent<HTMLDivElement>(
          'ArrowDown'
        ) as KeyboardEvent<HTMLDivElement>
      );
    });

    expect(result.current.currentHoveredIndex).toBe(1);
  });

  it('should call onSelect with hoveredIndex on ENTER', () => {
    const listRef = createListRef(3);

    const { result } = renderHook(() =>
      useKeyboardListNavigation({
        itemsLength: 3,
        isOpened: true,
        onSelect,
        onHoveredIndexChange,
        onToggle,
        hoveredIndex: 1,
        listRef,
      })
    );

    act(() => {
      result.current.onKeyDown(
        createMockEvent<HTMLDivElement>(
          'Enter'
        ) as KeyboardEvent<HTMLDivElement>
      );
    });

    expect(onSelect).toHaveBeenCalledWith(1);
  });

  it('should wrap currentHoveredIndex to 0 when pressing DOWN_KEY from the last index', () => {
    const listRef = createListRef(3);

    const { result } = renderHook(() =>
      useKeyboardListNavigation({
        itemsLength: 3,
        isOpened: true,
        onSelect,
        onHoveredIndexChange,
        onToggle,
        hoveredIndex: 2,
        listRef,
      })
    );

    act(() => {
      result.current.onKeyDown(
        createMockEvent<HTMLDivElement>(
          'ArrowDown'
        ) as KeyboardEvent<HTMLDivElement>
      );
    });

    expect(result.current.currentHoveredIndex).toBe(0);
  });

  it('should wrap currentHoveredIndex to the last index when pressing UP_KEY from 0', () => {
    const listRef = createListRef(3);

    const { result } = renderHook(() =>
      useKeyboardListNavigation({
        itemsLength: 3,
        isOpened: true,
        onSelect,
        onHoveredIndexChange,
        onToggle,
        hoveredIndex: 0,
        listRef,
      })
    );

    act(() => {
      result.current.onKeyDown(
        createMockEvent<HTMLDivElement>(
          'ArrowUp'
        ) as KeyboardEvent<HTMLDivElement>
      );
    });

    expect(result.current.currentHoveredIndex).toBe(2);
  });
});
