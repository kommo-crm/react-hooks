# `useMenuAim`

React hook that tracks whether the cursor is moving toward a menu or submenu using geometric calculations based on the "menu aim" algorithm.

This implementation prevents menus from closing prematurely when the user is navigating toward a submenu by tracking cursor movement within an "intent triangle" formed between the previous cursor position and the menu's active edge.

## How it works

The algorithm works by:

1. **Tracking cursor positions** as the mouse moves across the document
2. **Creating an intent triangle** from the previous cursor position to the menu's active edge
3. **Checking if the current cursor position** is within this triangle
4. **Verifying that the cursor is moving** in the direction of the menu
5. **Updating a ref** with the result to avoid unnecessary re-renders

This improves UX by allowing smooth navigation between parent menus and submenus without accidental closures, similar to [Amazon's mega dropdown implementation](https://bjk5.com/post/44698559168/breaking-down-amazons-mega-dropdown).

## Usage

```jsx
import React, { useState, useCallback } from 'react';
import { useMenuAim, MenuAimDirection } from '@packages/react-hooks';

const Demo: React.FC = () => {
  const [activeItem, setActiveItem] = useState<string | null>(null);

  const { contentRef, isAimingRef, reset } = useMenuAim({
    direction: MenuAimDirection.RIGHT,
    tolerance: 40,
    switchDelay: 200,
  });

  const handleItemHover = useCallback(
    (item: string) => {
      // Don't switch when user is aiming toward submenu
      if (!isAimingRef.current) {
        setActiveItem(item);
      }
    },
    [isAimingRef]
  );

  const handleMenuLeave = useCallback(() => {
    setActiveItem(null);
    reset();
  }, [reset]);

  const handleFirstItemMouseEnter = () => {
    return handleItemHover('item1');
  };

  const handleSecondItemMouseEnter = () => {
    return handleItemHover('item2');
  };

  return (
    <div className="menu" onMouseLeave={handleMenuLeave}>
      <ul>
        <li onMouseEnter={handleFirstItemMouseEnter}>Item 1</li>
        <li onMouseEnter={handleSecondItemMouseEnter}>Item 2</li>
      </ul>

      {activeItem && (
        <div ref={contentRef} className="submenu">
          Submenu for {activeItem}
        </div>
      )}
    </div>
  );
};
```

## Reference

```ts
const { contentRef, isAimingRef, switchDelay, reset } = useMenuAim(options);
```

### Options

- **`direction`**_`: MenuAimDirection`_ - direction in which the submenu opens (`'top'`, `'right'`, `'bottom'`, `'left'`);
- **`tolerance`**_`: number`_ - pixel tolerance added to menu bounds (default: `40`);
- **`switchDelay`**_`: number`_ - delay in ms before allowing menu switching when aiming (default: `200`);
- **`enabled`**_`: boolean`_ - enables or disables the menu aim logic (default: `true`);
- **`externalAimingRef`**_`: React.MutableRefObject<boolean>`_ - optional external ref to use instead of creating a new one;

### Return Value

- **`contentRef`**_`: React.RefObject<T>`_ - ref to attach to the submenu DOM element;
- **`isAimingRef`**_`: React.MutableRefObject<boolean>`_ - ref containing whether the mouse is currently moving toward the menu;
- **`switchDelay`**_`: number`_ - the configured delay value;
- **`reset`**_`: () => void`_ - function to reset all internal tracking state;
