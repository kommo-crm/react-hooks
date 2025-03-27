# `useConst`

> This component designed to be used to use instead of `useMemo` with an empty array of dependencies

React hook that memoize the value returned by the `fn` function each time the `Component` is called. It ensures that the value is saved between renderings of the component to avoid recalculating and recreating the value each time the component is updated.

## Usage

```jsx
import React from 'react';
import { useConst } from '@packages/react-hooks';

const Demo: React.FC = () => {
  const value = useConst<number>(() => {
    console.log("Calculating expensive value...");
    return Math.random();
  });

  return (
    <div>
      <p>Value: {value}</p>
    </div>
  );
};
```

## Reference

```ts
const value = useConst(fn: Function);
```

- **`value`** - immutable value obtained from a function call;
- **`fn`**_`: Function`_ - function that will be called and return value;
