import React, { useRef } from 'react';
import { useOnOutsideClick } from '../../useOnOutsideClick';

type TestComponentProps = {
  /**
   * Callback when clicking outside
   */
  onOutsideClick: (event: MouseEvent) => void;
  /**
   * Context for grouping handlers and tracked items.
   *
   * - If specified, handlers and links will be grouped within the specified context.
   * - Handlers of one context will not affect handlers of other contexts.
   * @default 'global' - General context used by default.
   */
  context?: string;
};

const TestComponent = (props: TestComponentProps) => {
  const { onOutsideClick, context } = props;
  const ref = useRef<HTMLDivElement>(null);

  const handleOutsideClick = (event: MouseEvent) => {
    onOutsideClick(event);
  };

  useOnOutsideClick({
    ref,
    handler: handleOutsideClick,
    context,
  });

  return (
    <div>
      <div ref={ref} data-testid={`inside-${context || 'default'}`}>
        Inside
      </div>
      <div data-testid={`context-${context || 'default'}`}>
        {context || 'default'}
      </div>
    </div>
  );
};

export default TestComponent;
