import React, { useEffect, useState } from 'react';
import { StoryFn, Meta } from '@storybook/react';
import { useDidUpdateEffect } from '../useDidUpdateEffect';

export default {
  title: 'Hooks/useDidUpdateEffect',
  component: useDidUpdateEffect,
} as Meta;

const Template: StoryFn = () => {
  const [count, setCount] = useState(0);
  const [useEffectTriggerTimes, setUseEffectTriggerTimes] = useState(0);
  const [eventTriggerTimes, setEventTriggerTimes] = useState(0);

  useDidUpdateEffect(() => {
    setEventTriggerTimes((prev) => prev + 1);
  }, [count]);

  useEffect(() => {
    setUseEffectTriggerTimes((prev) => prev + 1);
  }, [count]);

  return (
    <div>
      <h1>useDidUpdateEffect Demo</h1>
      <p>Count: {count}</p>
      <p>useDidUpdateEffect Trigger Times: {eventTriggerTimes}</p>
      <p>useEffect Trigger Times: {useEffectTriggerTimes}</p>
      <button onClick={() => setCount(count + 1)}>
        Increment Count (ReRender)
      </button>
    </div>
  );
};

export const Demo = Template.bind({});
Demo.args = {};
