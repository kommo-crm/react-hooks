# `usePrevious`

React hook that returns the previous value of a prop or state. Useful for comparing current and previous values to detect changes, disable repositioning, or implement transition logic.

## Usage

```jsx
import React, { useState } from 'react';
import { usePrevious } from '@packages/react-hooks';

const Demo: React.FC = () => {
  const [count, setCount] = useState(0);
  const previousCount = usePrevious(count);

  const handleClick = () => {
    setCount(count + 1);
  };

  return (
    <div>
      <p>Current: {count}</p>
      <p>Previous: {previousCount ?? 'N/A'}</p>
      <button onClick={handleClick}>Increment</button>
    </div>
  );
};
```

## Reference

```ts
const previousValue = usePrevious(value: T);
```

- **`previousValue`**_`: T | undefined`_ - the previous value from the last render, or `undefined` on the first render;
- **`value`**_`: T`_ - the current value to track;
