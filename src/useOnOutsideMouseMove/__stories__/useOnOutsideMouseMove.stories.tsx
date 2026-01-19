import React, { useRef, useState, useCallback } from 'react';
import { StoryFn, Meta } from '@storybook/react';
import { useOnOutsideMouseMove } from '../useOnOutsideMouseMove';

export default {
  title: 'Hooks/useOnOutsideMouseMove',
  component: useOnOutsideMouseMove,
} as Meta;

const Template: StoryFn = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [moveCount, setMoveCount] = useState(0);

  const handleOutsideMove = useCallback(() => {
    setIsHovered(false);
    setMoveCount((prev) => {
      return prev + 1;
    });
  }, []);

  useOnOutsideMouseMove(containerRef, handleOutsideMove);

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
  }, []);

  return (
    <div>
      <h1>useOnOutsideMouseMove Demo</h1>

      <p style={{ color: '#666', fontSize: '14px', marginBottom: '20px' }}>
        Move your mouse inside and outside the box below. The hook detects when
        the mouse moves outside the referenced element.
      </p>

      <div
        ref={containerRef}
        onMouseEnter={handleMouseEnter}
        style={{
          padding: '60px',
          backgroundColor: isHovered ? '#c8e6c9' : '#ffcdd2',
          borderRadius: '12px',
          textAlign: 'center',
          transition: 'background-color 0.2s ease',
          cursor: 'pointer',
          border: `2px solid ${isHovered ? '#4caf50' : '#f44336'}`,
        }}
      >
        <div style={{ fontSize: '18px', fontWeight: 'bold' }}>
          {isHovered ? 'Mouse is inside!' : 'Mouse is outside'}
        </div>
      </div>

      <div
        style={{
          marginTop: '20px',
          padding: '12px',
          backgroundColor: '#e3f2fd',
          borderRadius: '4px',
          fontSize: '14px',
        }}
      >
        <strong>Outside move events detected:</strong> {moveCount}
      </div>
    </div>
  );
};

export const Demo = Template.bind({});
Demo.args = {};
