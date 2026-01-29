# `useIsTouchDevice`

React hook that detects whether the current device supports touch input. The hook dynamically updates based on user interaction, switching between touch and mouse modes as the user interacts with the page.

## Usage

```jsx
import React from 'react';
import { useIsTouchDevice } from '@packages/react-hooks';

const Demo: React.FC = () => {
  const isTouch = useIsTouchDevice();

  return (
    <div>
      <p>Device type: {isTouch ? 'Touch' : 'Mouse'}</p>
      {isTouch ? (
        <p>Tap to interact</p>
      ) : (
        <p>Click to interact</p>
      )}
    </div>
  );
};
```

## Reference

```ts
const isTouch = useIsTouchDevice();
```

- **`isTouch`**_`: boolean`_ - `true` if the device supports touch input and the last interaction was touch, `false` otherwise;
