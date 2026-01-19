import React from 'react';
import { StoryFn, Meta } from '@storybook/react';
import { useIsTouchDevice } from '../useIsTouchDevice';

export default {
  title: 'Hooks/useIsTouchDevice',
  component: useIsTouchDevice as unknown,
} as Meta;

const Template: StoryFn = () => {
  const isTouch = useIsTouchDevice();

  return (
    <div>
      <h1>useIsTouchDevice Demo</h1>

      <p>
        Device type: <strong>{isTouch ? 'Touch' : 'Mouse'}</strong>
      </p>

      <p style={{ color: '#666', fontSize: '14px' }}>
        Try switching between touch and mouse input to see the value change.
      </p>

      <div
        style={{
          marginTop: '20px',
          padding: '40px',
          backgroundColor: isTouch ? '#e3f2fd' : '#f3e5f5',
          borderRadius: '8px',
          textAlign: 'center',
          transition: 'background-color 0.3s ease',
        }}
      >
        {isTouch ? 'Touch mode active' : 'Mouse mode active'}
      </div>
    </div>
  );
};

export const Demo = Template.bind({});
Demo.args = {};
