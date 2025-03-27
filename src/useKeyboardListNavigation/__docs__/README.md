# `useKeyboardListNavigation`

React hook that manages keyboard navigation for a list of items. It provides functionality to navigate up and down the list using arrow keys, select an item and toggle a state.

## Usage

```jsx
import React, { useState } from 'react';
import { useKeyboardListNavigation } from '@packages/react-hooks';

const Demo: React.FC = () => {
  const items = ['Item 1', 'Item 2', 'Item 3'];
  const [isOpen, setIsOpen] = useState(true);

  const { currentHoveredIndex, onKeyDown, updateListPosition } = useKeyboardListNavigation({
    itemsLength: items.length,
    isOpened: isOpen,
    hoveredIndex: 0,
    onSelect: (index) => alert(`Selected: ${items[index]}`),
    onToggle: () => setIsOpen((prev) => !prev),
  });

  return (
    <div onKeyDown={onKeyDown} tabIndex={0}>
      <h1>Keyboard Navigation</h1>
      {isOpen && (
        <ul>
          {items.map((item, index) => (
            <li
              key={item}
              style={{
                background: index === currentHoveredIndex ? 'lightblue' : 'transparent',
              }}
            >
              {item}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

```

## Reference

```ts
const { currentHoveredIndex, onKeyDown, updateListPosition, updateListPosition } = useKeyboardListNavigation(
  options: UseKeyboardListNavigationOptions);
```

- **`currentHoveredIndex`**_`: number`_ - the index of the currently hovered item;
- **`onKeyDown`**_`: (event: KeyboardEvent) => void`_ - handler function for keyboard events;
- **`updateHoveredIndex`**_`: (index: number) => void`_ - Function for update hovered index;
- **`updateListPosition`**_`: (index: number) => void`_ - Function for update hovered index and list position;
