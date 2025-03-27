import React, { useState } from 'react';
import { StoryFn, Meta } from '@storybook/react';
import { useDebounce } from '../useDebounce';

interface TemplateArgs {
  /**
   * Initial value.
   */
  initialValue: string;
  /**
   * Debounce delay.
   */
  delay: number;
}

export default {
  title: 'Hooks/useDebounce',
  component: useDebounce,
} as Meta;

const Template: StoryFn<TemplateArgs> = ({
  initialValue,
  delay,
}: TemplateArgs) => {
  const [inputValue, setInputValue] = useState(initialValue);
  const debouncedValue = useDebounce(inputValue, delay);

  return (
    <div>
      <h1>useDebounce Demo</h1>
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder="Type something..."
      />
      <p>Debounced value: {debouncedValue}</p>
    </div>
  );
};

export const Demo = {
  args: {
    initialValue: 'Hello world!',
    delay: 500,
  },
  render: ({ initialValue, delay }) => (
    <Template initialValue={initialValue} delay={delay} />
  ),
};
