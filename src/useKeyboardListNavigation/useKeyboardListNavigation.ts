import {
  KeyboardEvent,
  KeyboardEventHandler,
  MutableRefObject,
  useCallback,
  useEffect,
  useState,
} from 'react';

interface UseKeyboardListNavigationOptions {
  /**
   * The total number of items available for navigation.
   */
  itemsLength: number;
  /**
   * A boolean indicating whether the navigation context is currently open.
   */
  isOpened?: boolean;
  /**
   * Callback triggered when an item is selected, with the selected index as an argument.
   */
  onSelect: (index: number) => void;
  /**
   * Callback triggered when toggling the navigation context.
   */
  onToggle: (isOpened: boolean) => void;
  /**
   * Callback triggered when hoveredIndex changes.
   */
  onHoveredIndexChange?: (index: number) => void;
  /**
   * The index of the initially hovered item.
   */
  hoveredIndex?: number;
  /**
   * The ref to the navigation context.
   */
  listRef: MutableRefObject<HTMLUListElement | null> | null;
}

interface UseKeyboardListNavigationResult {
  /**
   * The index of the currently hovered item.
   */
  currentHoveredIndex: number;
  /**
   * Function to change the hoveredIndex programmatically.
   */
  updateHoveredIndex: (index: number) => void;
  /**
   * Function to change the hoveredIndex programmatically.
   */
  updateListPosition: (index: number) => void;
  /**
   * Keyboard event handler for the navigation context.
   */
  onKeyDown: KeyboardEventHandler<HTMLElement>;
}

const UP_KEY = 'ArrowUp';
const DOWN_KEY = 'ArrowDown';
const ESCAPE = 'Escape';
const ENTER = 'Enter';
const SPACEBAR = 'Space';

const PREVENTABLE_KEYS = [UP_KEY, DOWN_KEY, ENTER, SPACEBAR];

export const useKeyboardListNavigation = (
  options: UseKeyboardListNavigationOptions
): UseKeyboardListNavigationResult => {
  const {
    itemsLength,
    onSelect,
    onToggle,
    onHoveredIndexChange = () => undefined,
    isOpened = false,
    hoveredIndex = 0,
    listRef,
  } = options;

  const [currentHoveredIndex, setCurrentHoveredIndex] = useState(hoveredIndex);

  useEffect(() => {
    setCurrentHoveredIndex(hoveredIndex);
  }, [hoveredIndex]);

  const updateHoveredIndex = (index: number) => {
    setCurrentHoveredIndex(index);

    onHoveredIndexChange(index);
  };

  const updateListPosition = useCallback((newIndex: number) => {
    if (!listRef || !listRef.current) {
      return;
    }

    const listElement = listRef.current;
    const listItem = listElement.querySelector<HTMLElement>(
      `li:nth-child(${newIndex + 1})`
    );

    if (!listItem) {
      return;
    }

    const listTop = listElement.getBoundingClientRect().top;
    const itemTop = listItem.getBoundingClientRect().top;

    const newScrollTop =
      listElement.scrollTop +
      (itemTop - listTop) -
      listElement.offsetHeight / 2 +
      listItem.offsetHeight / 2;

    listElement.scrollTop = newScrollTop;

    updateHoveredIndex(newIndex);
  }, []);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (PREVENTABLE_KEYS.includes(e.code)) {
        e.preventDefault();
      }

      switch (e.code) {
        case ESCAPE:
          if (isOpened) {
            onToggle(false);
          }
          break;

        case UP_KEY:
          if (isOpened) {
            updateListPosition(
              currentHoveredIndex > 0
                ? currentHoveredIndex - 1
                : itemsLength - 1
            );
          }
          break;

        case DOWN_KEY:
          if (isOpened) {
            updateListPosition(
              currentHoveredIndex < itemsLength - 1
                ? currentHoveredIndex + 1
                : 0
            );
          }
          break;

        case ENTER:
        case SPACEBAR:
          if (
            isOpened &&
            currentHoveredIndex >= 0 &&
            currentHoveredIndex < itemsLength
          ) {
            onSelect(currentHoveredIndex);
          } else {
            onToggle(true);
          }
          break;

        default:
          break;
      }
    },
    [currentHoveredIndex, isOpened, itemsLength, onSelect, onToggle]
  );

  useEffect(() => {
    if (isOpened) {
      updateHoveredIndex(currentHoveredIndex);
      updateListPosition(currentHoveredIndex);
    }
  }, [isOpened]);

  return {
    currentHoveredIndex,
    updateHoveredIndex,
    updateListPosition,
    onKeyDown: handleKeyDown,
  };
};
