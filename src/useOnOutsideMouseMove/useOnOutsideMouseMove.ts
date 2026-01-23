import React, { useEffect } from 'react';
import { reject } from '@utils';

type UseOnOutsideMouseMoveOptions = {
  /**
   * Ref of the tracked item
   */
  ref: React.MutableRefObject<HTMLElement | null>;
  /**
   * A callback that will work when mouse moves outside the ref element.
   */
  handler: (event: MouseEvent) => unknown;
  /**
   * Context for grouping handlers and tracked items.
   *
   * - If specified, handlers and links will be grouped within the specified context.
   * - Handlers of one context will not affect handlers of other contexts.
   * @default 'global' - General context used by default.
   */
  context?: string;
};

const configs: Partial<
  Record<string, Pick<UseOnOutsideMouseMoveOptions, 'ref' | 'handler'>[]>
> = {};

const handleOutsideMouseMove = (event: MouseEvent) => {
  for (const context in configs) {
    const group = configs[context]!;

    for (let i = group.length - 1; i > -1; i--) {
      const { ref, handler } = group[i];

      const domElement = ref.current;

      if (!domElement) {
        continue;
      }

      if (!domElement.contains(event.target as HTMLElement)) {
        handler(event);
      }
    }
  }
};

document.addEventListener('mousemove', handleOutsideMouseMove);

export const useOnOutsideMouseMove = (
  options: UseOnOutsideMouseMoveOptions
): void => {
  const { handler, ref, context = 'global' } = options;

  useEffect(() => {
    if (!configs[context]) {
      configs[context] = [];
    }

    const option = { handler, ref };

    configs[context]?.push(option);

    return () => {
      configs[context] = reject(configs[context]!, option);
    };
  }, [handler, ref, context]);
};
