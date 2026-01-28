# `useIsAiming`

React hook that tracks whether the cursor is moving toward a menu or submenu using geometric calculations based on the "menu aim" algorithm.

This implementation prevents menus from closing prematurely when the user is navigating toward a submenu by automatically detecting the direction and tracking cursor movement within an "intent triangle" formed between the previous cursor position and the menu's edge with maximum outside area.

## How it works

The algorithm works by:

1. **Tracking cursor positions** as the mouse moves across the document
2. **Finding the edge with maximum outside area** - for each pair of rectangle vertices (6 pairs total), calculates the convex hull area minus the rectangle area, and selects the pair with maximum outside area
3. **Creating an intent triangle** from the previous cursor position to the selected edge vertices
4. **Checking if the current cursor position** is within this triangle
5. **Updating a ref** with the result to avoid unnecessary re-renders

This improves UX by allowing smooth navigation between parent menus and submenus without accidental closures, similar to [Amazon's mega dropdown implementation](https://bjk5.com/post/44698559168/breaking-down-amazons-mega-dropdown).

## Usage

```jsx
import React, { useState, useCallback } from 'react';
import { useIsAiming } from '@packages/react-hooks';

const Demo: React.FC = () => {
  const [activeItem, setActiveItem] = useState<string | null>(null);
  const [isAimingValue, setIsAimingValue] = useState(false);

  const { ref } = useIsAiming<HTMLDivElement>({
    tolerance: 20,
    idleTimeout: 500,
    handler: setIsAimingValue,
  });

  const handleItemHover = useCallback(
    (item: string) => {
      // Don't switch when user is aiming toward submenu
      if (!isAimingValue) {
        setActiveItem(item);
      }
    },
    [isAimingValue]
  );

  const handleMenuLeave = () => {
    setActiveItem(null);
  };

  const menuItems = ['Dashboard', 'Products', 'Orders', 'Customers', 'Settings'];

  return (
    <div className="menu" onMouseLeave={handleMenuLeave}>
      <ul>
        {menuItems.map((item) => (
          <li
            key={item}
            onMouseEnter={() => handleItemHover(item)}
            onMouseMove={() => handleItemHover(item)}
          >
            {item}
          </li>
        ))}
      </ul>

      {activeItem && (
        <div ref={ref} className="submenu">
          <h3>{activeItem}</h3>
          <ul>
            <li>Submenu Item 1</li>
            <li>Submenu Item 2</li>
            <li>Submenu Item 3</li>
          </ul>
        </div>
      )}
    </div>
  );
};
```

## Reference

```ts
const { ref, isAiming } = useIsAiming(options);
```

### Options

- **`tolerance`**_`: number`_ - pixel tolerance for movement detection. When `isAiming` is `true`, the state will only update if accumulated cursor movement exceeds this threshold. Transitions from `false` to `true` are immediate and not affected by tolerance (default: `20`);
- **`isEnabled`**_`: boolean`_ - enables or disables the menu aim logic. When disabled, the hook becomes a no-op (default: `true`);
- **`handler`**_`: (isAiming: boolean) => void`_ - optional callback that is called when the aiming state changes;
- **`idleTimeout`**_`: number`_ - timeout in milliseconds after which `isAiming` is set to `false` if the cursor remains idle (doesn't move) (default: `500`);

### Return Value

- **`ref`**_`: React.RefObject<T>`_ - ref to attach to the submenu DOM element;
- **`isAiming`**_`: () => boolean`_ - function that returns whether the mouse is currently moving toward the menu;
