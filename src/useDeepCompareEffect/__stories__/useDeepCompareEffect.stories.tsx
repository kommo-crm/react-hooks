import React, { useEffect, useState } from 'react';
import { StoryFn, Meta } from '@storybook/react';
import { useDeepCompareEffect } from '../useDeepCompareEffect';

export default {
  title: 'Hooks/useDeepCompareEffect',
  component: useDeepCompareEffect,
} as Meta;

const Template: StoryFn = () => {
  const [data, setData] = useState({ count: 0 });

  useDeepCompareEffect(() => {
    console.log('Effect triggered due to deep change in dependencies');
  }, [data]);

  useEffect(() => {
    console.log('Effect triggered due to usual change in dependencies');
  }, [data]);

  return (
    <div>
      <h1>useDeepCompareEffect Example</h1>
      <p>Count: {data.count}</p>

      <button onClick={() => setData({ count: data.count + 1 })}>
        Increment Count
      </button>

      <button onClick={() => setData({ count: data.count })}>
        New object without effect
      </button>
    </div>
  );
};

export const Demo = Template.bind({});
Demo.args = {};
