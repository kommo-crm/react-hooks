# `useOnOutsideMouseMove`

React hook that tracks mouse movements outside of a specified element. Useful for detecting when the cursor leaves a component area, such as resetting pseudo-focus states or triggering hover-out behaviors.

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

  useOnOutsideMouseMove(containerRef, handleOutsideMove);

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
useOnOutsideMouseMove(ref, callback);
```

- **`ref`**_`: React.RefObject<HTMLElement>`_ - ref to the element to track mouse movements outside of;
- **`callback`**_`: (event: MouseEvent) => void`_ - function called when mouse moves outside the referenced element;
