import { Meta, StoryFn } from '@storybook/react';
import React, { useState } from 'react';
import { useContainerSize } from '../useContainerSize';

export default {
  title: 'Hooks/useContainerSize',
} as Meta;

const Template: StoryFn = () => {
  const [containerWidth, setContainerWidth] = useState(320);
  const [throttleTime, setThrottleTime] = useState(100);

  const breakpoints = {
    mobile: 0,
    tablet: 768,
    desktop: 1200,
  } as const;

  const { ref, size, width } = useContainerSize({
    breakpoints,
    throttleTime,
  });

  return (
    <div style={{ padding: 16, maxWidth: 1200 }}>
      <label style={{ display: 'block', marginBottom: 12 }}>
        Width:
        <input
          type="range"
          min={200}
          max={1900}
          value={containerWidth}
          onChange={(event) => setContainerWidth(Number(event.target.value))}
          style={{ marginLeft: 8, width: 240 }}
        />
        <span style={{ marginLeft: 8 }}>{containerWidth}px</span>
      </label>

      <label style={{ display: 'block', marginBottom: 12 }}>
        Throttle time:
        <input
          type="number"
          min={0}
          value={throttleTime}
          onChange={(event) => setThrottleTime(Number(event.target.value))}
          style={{ marginLeft: 8, width: 100 }}
        />
        <span style={{ marginLeft: 8 }}>ms</span>
      </label>

      <div
        ref={ref}
        style={{
          marginTop: 16,
          width: containerWidth,
          border: '1px solid #ccc',
          padding: 16,
          boxSizing: 'border-box',
        }}
      >
        <p>
          Current breakpoint: <strong>{size ?? 'none'}</strong>
        </p>
        <p>
          Container width: <strong>{width ?? 'N/A'}px</strong>
        </p>
        <p>Resize this box using the slider to see breakpoint changes.</p>
        <p style={{ marginTop: 8, color: '#666', fontSize: 14 }}>
          Throttle time: {throttleTime}ms
        </p>
      </div>
    </div>
  );
};

export const Demo = Template.bind({});
Demo.args = {};
