# `useOnOutsideClick`

> This hook is designed to track a click outside of the passed DOM element.

React hook providing ability to check component's mount state.
Returns a function that will return `true` if component mounted and `false` otherwise.

## Usage

```jsx
import React, { useRef } from 'react';
import useOnOutsideClick from '@packages/react-hooks';

const Demo: React.FC = () => {
  const ref = useRef<HTMLDivElement>(null);

  useOnOutsideClick({
    ref,
    handler: (event) => {
      console.log('Clicked outside the element', event);
    },
  });

  return (
    <div>
      <div ref={ref} style={{ padding: '20px', background: '#f0f0f0' }}>
        Click inside this box
      </div>
      <p>Click outside the box to trigger the handler.</p>
    </div>
  );
};

```

## Reference

```ts
const useOnOutsideClick: ({
  ref,
  handler,
  context,
}: UseOnOutsideClickOptions) => void;
```

- **`ref`**_`: MutableRefObject<HTMLElement>`_ - ref DOM element, click outside of which will be tracked and processed `handler`;
- **`handler`**_`: Function`_ - function that will be called when clicking outside the `ref`;
- **`context`**_`: string`_ - context for grouping handlers and tracked items. If specified, handlers and links will be grouped within the specified context. Handlers of one context will not affect handlers of other contexts. `global` - General context used by default.;
