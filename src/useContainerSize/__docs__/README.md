##

`useContainerSize`

React hook that tracks the width of a container element and returns the name of the current breakpoint based on a provided map of breakpoints. This is useful when you want to build container-based responsive behaviour instead of relying only on global window breakpoints.

### Options

- `breakpoints` (required): A map where keys are breakpoint names and values are minimum container widths in pixels.
- `isEnabled` (optional, default: `true`): Flag that enables or disables hook logic.
- `throttleTime` (optional, default: `10`): Throttle time in milliseconds for resize events.

Usage

JSX

```tsx
import React from 'react';
import { useContainerSize } from '@kommo-crm/react-hooks';

const Demo: React.FC = () => {
  const breakpoints = {
    mobile: 0,
    tablet: 768,
    desktop: 1024,
  } as const;

  const { ref, size, width } = useContainerSize({ breakpoints });

  return (
    <div>
      <div
        ref={ref}
        style={{ width: 600, border: '1px solid #ccc', padding: 16 }}
      >
        <p>Current breakpoint: {size ?? 'none'}</p>
        <p>Container width: {width ?? 'N/A'}px</p>
      </div>
    </div>
  );
};
```

### Demo

```tsx
const { ref, size, width } = useContainerSize({
  breakpoints,
  throttleTime: 50,
});
```
