import React, { useRef, useState } from 'react';
import { StoryFn, Meta } from '@storybook/react';
import { useOnOutsideClick } from '../useOnOutsideClick';

export default {
  title: 'Hooks/useOnOutsideClick',
  component: useOnOutsideClick,
} as Meta;

const ChildComponent: React.FC<{
  /**
   * Callback on click.
   */
  onOutsideClick: (value: boolean) => void;
}> = (props) => {
  const { onOutsideClick } = props;
  const ref = useRef<HTMLDivElement>(null);

  useOnOutsideClick({
    ref,
    handler: () => {
      onOutsideClick(true);
    },
  });

  return (
    <div
      ref={ref}
      style={{
        padding: '20px',
        backgroundColor: '#f0f0f0',
        display: 'inline-block',
        margin: '20px',
      }}
    >
      Child Component (click outside me)
    </div>
  );
};

const Template: StoryFn = () => {
  const [isOutsideClickDetected, setOutsideClickDetected] = useState(false);
  const [isChildVisible, setIsChildVisible] = useState(true);

  const handleClick = () => {
    setIsChildVisible((prev) => !prev);

    if (!isChildVisible) {
      setOutsideClickDetected(false);
    }
  };

  const handleOutsideClick = (value: boolean) => {
    setOutsideClickDetected(value);
  };

  return (
    <div>
      <h1>useOnOutsideClick Demo</h1>

      <p>
        This hook detects clicks outside the child component. If a click is
        detected outside, it will trigger a handler.
      </p>

      <p>
        {isOutsideClickDetected
          ? 'Click outside detected!'
          : 'No click outside yet'}
      </p>

      {isChildVisible && <ChildComponent onOutsideClick={handleOutsideClick} />}

      <button onClick={handleClick}>Toggle Child Component</button>
    </div>
  );
};

export const Demo = {
  render: () => <Template />,
};
