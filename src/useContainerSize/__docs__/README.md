##

`useContainerSize`

React hook that tracks the width of a container element and returns the name of the current breakpoint based on a provided map of breakpoints. This is useful when you want to build container-based responsive behaviour instead of relying only on global window breakpoints.

**Note:** This hook uses `ResizeObserver` API under the hood. If you need to support browsers that don't have native `ResizeObserver` support, you must provide a polyfill on your own.

### Options

- `breakpoints` (required): A map where keys are breakpoint names and values are minimum container widths in pixels. Can be `null` to return only width without breakpoint matching.
- `isEnabled` (optional, default: `true`): Flag that enables or disables hook logic.
- `throttleTime` (optional, default: `10`): Throttle time in milliseconds for resize events.
- `calcWidth` (optional): Custom function to measure container width. If not provided, defaults to `element.offsetWidth`. The function receives the element and should return width in pixels.

Usage

JSX

```tsx
import React from 'react';
import { useContainerSize } from '@kommo-crm/react-hooks';

const breakpoints = {
  mobile: 0,
  tablet: 768,
  desktop: 1024,
} as const;

const Demo: React.FC = () => {
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

### Examples

#### Basic usage with breakpoints

```tsx
const { ref, size, width } = useContainerSize({
  breakpoints,
  throttleTime: 50,
});
```

#### Using custom width calculation

```tsx
// Using getBoundingClientRect for more accurate width
const { ref, size, width } = useContainerSize({
  breakpoints,
  calcWidth: (element) => element.getBoundingClientRect().width,
});

// Custom calculation with offset
const { ref, size, width } = useContainerSize({
  breakpoints,
  calcWidth: (element) => element.offsetWidth - 20, // Subtract padding
});

// Using scrollWidth
const { ref, size, width } = useContainerSize({
  breakpoints,
  calcWidth: (element) => element.scrollWidth,
});
```

#### Using without breakpoints (only width)

```tsx
// When breakpoints is null, only width is returned (size is always null)
const { ref, size, width } = useContainerSize({
  breakpoints: null,
  calcWidth: (element) => element.getBoundingClientRect().width,
});

// size will always be null, width will contain the measured width
```
