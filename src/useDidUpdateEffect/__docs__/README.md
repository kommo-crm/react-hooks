# `useDidUpdateEffect`

React hook which allows you to execute an effect only after the first render and all next renders. This hook emulates the behavior of `componentDidUpdate`

## Usage

```jsx
import React from 'react';
import { useDidUpdateEffect } from '@packages/react-hooks';

const Demo: React.FC = () => {
  const [count, setCount] = useState(0);

  useDidUpdateEffect(() => {
    console.log("Effect triggered after initial render");
  }, [count]);

  return (
    <div>
      <h1>useDidUpdateEffect Example</h1>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment Count</button>
    </div>
  )
};
```

## Reference

```ts
useDidUpdateEffect(fn: Function, inputs?: React.DependencyList): void;
```

- **`fn`**_`: Function`_ - function that will be called;
- **`inputs`**_`: DependencyList`_ - array of values that the function call depends on, in the same manner as `useEffect`;
