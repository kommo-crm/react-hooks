# `useOnOutsideMouseMove`

React hook that tracks mouse movements outside of a specified element. Useful for detecting when the cursor leaves a component area, such as resetting pseudo-focus states or triggering hover-out behaviors.

Uses a subscribe/unsubscribe pattern with a single global event listener for optimal performance.

## Usage

```jsx
import React, { useRef, useState, useCallback } from 'react';
import { useOnOutsideMouseMove } from '@packages/react-hooks';

const Demo: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const handleOutsideMove = useCallback(() => {
    setIsHovered(false);
  }, []);

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  useOnOutsideMouseMove({
    ref: containerRef,
    handler: handleOutsideMove,
  });

  return (
    <div
      ref={containerRef}
      onMouseEnter={handleMouseEnter}
      style={{
        padding: '20px',
        background: isHovered ? 'lightblue' : 'lightgray',
      }}
    >
      {isHovered ? 'Mouse is inside!' : 'Mouse is outside'}
    </div>
  );
};
```

## Reference

```ts
useOnOutsideMouseMove(options);
```

### Options

- **`ref`**_`: React.MutableRefObject<HTMLElement | null>`_ - ref to the element to track mouse movements outside of;
- **`handler`**_`: (event: MouseEvent) => unknown`_ - function called when mouse moves outside the referenced element;
- **`context`**_`: string`_ - context for grouping handlers (default: `'global'`). Handlers of one context will not affect handlers of other contexts;
