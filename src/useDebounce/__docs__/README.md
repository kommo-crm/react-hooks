# `useDebounce`

React hook that delays state changes until after wait milliseconds have elapsed since the last time the debounced function was invoked. The debounce timeout will start when one of the values changes.

## Usage

```jsx
import React, { useState, ChangeEvent } from 'react';
import { useDebounce } from '@packages/react-hooks';

const Demo: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  return (
    <div>
      <h1>Debounced Search</h1>
      <input
        type="text"
        placeholder="Search..."
        value={searchTerm}
        onChange={handleChange}
      />
      <p>Searching for: {debouncedSearchTerm}</p>
    </div>
  );
};
```

## Reference

```ts
const debouncedValue = useDebounce(value: T, delay: number);
```

- **`debouncedValue`** - current delayed value;
- **`value`**_`: T`_ - value, the change of which triggers the delay;
- **`ms`**_`: number`_ - delay in milliseconds;
