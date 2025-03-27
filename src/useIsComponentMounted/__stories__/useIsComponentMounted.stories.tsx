import React, { FC, useEffect, useState } from 'react';
import { StoryFn, Meta } from '@storybook/react';
import { useIsComponentMounted } from '../useIsComponentMounted';

export default {
  title: 'Hooks/useIsComponentMounted',
  component: useIsComponentMounted as unknown,
} as Meta;

interface TemplateArgs {
  /**
   * Timeout in ms
   */
  timeout: number;
}

interface ChildComponentArgs extends TemplateArgs {
  /**
   * Callback to mount the element.
   */
  onMount: (value: boolean) => void;
}

const ChildComponent: FC<ChildComponentArgs> = ({ onMount, timeout }) => {
  const isComponentMounted = useIsComponentMounted();

  useEffect(() => {
    setTimeout(() => {
      if (isComponentMounted()) {
        onMount(true);
      } else {
        onMount(false);
      }
    }, timeout);
  }, []);

  return <div>Child Component</div>;
};

const Template: StoryFn<TemplateArgs> = ({ timeout }: TemplateArgs) => {
  const [isChildVisible, setIsChildVisible] = useState(true);

  const [isMounted, setIsMounted] = useState(false);

  return (
    <div>
      <h1>useIsComponentMounted Demo</h1>

      <p>
        Controlled by <b>useIsComponentMounted</b> with {timeout}ms timeout:
      </p>
      <p>{isMounted ? 'Component still mounted' : 'Component is unmounted'}</p>

      {isChildVisible && (
        <ChildComponent
          timeout={timeout}
          onMount={(value: boolean) => setIsMounted(value)}
        />
      )}

      <button onClick={() => setIsChildVisible((prev) => !prev)}>
        Toggle Child Component
      </button>
    </div>
  );
};

export const Demo = {
  args: {
    timeout: 1000,
  },
  render: ({ timeout }) => <Template timeout={timeout} />,
};
