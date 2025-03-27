import React, { useEffect } from 'react';
import { reject } from '@utils/reject';

type UseOnOutsideClickOptions = {
  /**
   * Ref of the tracked item
   */
  ref: React.MutableRefObject<HTMLElement | null>;
  /**
   * A callback that will work when clicked from outside the ref element.
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
  Record<string, Pick<UseOnOutsideClickOptions, 'ref' | 'handler'>[]>
> = {};

const handleOutsideClick = (event: MouseEvent) => {
  for (const context in configs) {
    const group = configs[context]!;

    for (let i = group.length - 1; i > -1; i--) {
      const { ref, handler } = group[i];

      const domElement = ref.current;

      if (!domElement) {
        continue;
      }

      if (domElement.contains(event.target as HTMLElement)) {
        break;
      } else {
        handler(event);

        break;
      }
    }
  }
};

document.addEventListener('click', handleOutsideClick);

export const useOnOutsideClick = (options: UseOnOutsideClickOptions): void => {
  const { handler, ref, context = 'global' } = options;

  useEffect(() => {
    if (!configs[context]) {
      configs[context] = [];
    }

    const option = { handler, ref };

    /**
     * It is necessary so that we don't have 'handleOutsideClick' called immediately
     * after rendering the component because of 'bubbling'
     */
    setTimeout(() => {
      configs[context]?.push(option);
    });

    return () => {
      configs[context] = reject(configs[context]!, option);
    };
  }, [handler, ref, context]);
};
