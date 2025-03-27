import React, { useState } from 'react';
import { StoryFn, Meta } from '@storybook/react';
import { useConst } from '../useConst';

export default {
  title: 'Hooks/useConst',
  component: useConst,
} as Meta;

const Template: StoryFn = () => {
  const [, setState] = useState(0);
  const value = useConst(() => Math.random());

  return (
    <div>
      <h1>useConst Demo</h1>
      <p>useConst Value: {value}</p>
      <button onClick={() => setState((prev) => prev + 1)}>ReRender</button>
    </div>
  );
};

export const Demo = Template.bind({});
Demo.args = {};
