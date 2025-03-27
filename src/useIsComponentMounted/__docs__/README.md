# `useIsComponentMounted`

> This hook designed to be used to avoid state updates on unmounted components.

React hook providing ability to check component's mount state.
Returns a function that will return `true` if component mounted and `false` otherwise.

## Usage

```jsx
import React from 'react';
import { useIsComponentMounted } from '@packages/react-hooks';

const Demo: React.FC = () => {
  const isMounted = useIsComponentMounted();

  useEffect(() => {
    setTimeout(() => {
      if (isMounted()) {
        // ...
      } else {
        // ...
      }
    }, 1000);
  });
};
```

## Reference

```ts
const isMounted = useIsComponentMounted(): (() => boolean);
```

- **`isMounted`**_`: Function`_ - function that will return `true` if component mounted and `false` otherwise;
