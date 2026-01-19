import React, { useCallback, useState } from 'react';
import { StoryFn, Meta } from '@storybook/react';
import { usePrevious } from '../usePrevious';

export default {
  title: 'Hooks/usePrevious',
  component: usePrevious,
} as Meta;

const Template: StoryFn = () => {
  const [count, setCount] = useState(0);
  const previousCount = usePrevious(count);

  const handleIncrement = useCallback(() => {
    setCount((prev) => {
      return prev + 1;
    });
  }, []);

  const handleDecrement = useCallback(() => {
    setCount((prev) => {
      return prev - 1;
    });
  }, []);

  return (
    <div>
      <h1>usePrevious Demo</h1>

      <p>Current value: {count}</p>
      <p>Previous value: {previousCount ?? 'N/A'}</p>

      <button onClick={handleIncrement}>Increment</button>
      <button onClick={handleDecrement}>Decrement</button>
    </div>
  );
};

export const Demo = Template.bind({});
Demo.args = {};
