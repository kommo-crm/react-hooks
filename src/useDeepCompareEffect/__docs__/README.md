# `useDeepCompareEffect`

React hook which allows you to execute an effect only when the dependencies deeply change. This hook is useful when you want to avoid unnecessary effect executions due to shallow comparison of dependencies.

## Usage

```jsx
import React, { useState } from 'react';
import { useDeepCompareEffect } from '@packages/react-hooks';

const Demo: React.FC = () => {
  const [data, setData] = useState({ count: 0 });

  useDeepCompareEffect(() => {
    console.log("Effect triggered due to deep change in dependencies");
  }, [data]);

  useEffect(() => {
    console.log("Effect triggered due to usual change in dependencies");
  }, [data]);

  return (
    <div>
      <h1>useDeepCompareEffect Example</h1>
      <p>Count: {data.count}</p>
      <button onClick={() => setData({ count: data.count + 1 })}>Increment Count</button>
      <button onClick={() => setData({ count: data.count })}>New object without effect</button>
    </div>
  )
};
```
