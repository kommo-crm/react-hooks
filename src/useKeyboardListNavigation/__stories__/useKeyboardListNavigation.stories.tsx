import React, { useRef, useState } from 'react';
import { StoryFn, Meta } from '@storybook/react';
import { useKeyboardListNavigation } from '../useKeyboardListNavigation';

interface TemplateArgs {
  /**
   * A list of items to display.
   */
  items: string[];
  /**
   * The initial index of the item to be hovered when the component is first rendered.
   */
  hoveredIndex: number;
  /**
   * A boolean that determines whether the list is open or closed.
   * When true, the list is shown, and when false, the list is hidden.
   */
  isOpened: boolean;
}

export default {
  title: 'Hooks/useKeyboardListNavigation',
  component: useKeyboardListNavigation as unknown,
} as Meta;

const Template: StoryFn<TemplateArgs> = ({
  items,
  hoveredIndex,
  isOpened,
}: TemplateArgs) => {
  const [open, setOpen] = useState(isOpened);
  const listRef = useRef<HTMLUListElement>(null);

  const { currentHoveredIndex, onKeyDown } = useKeyboardListNavigation({
    itemsLength: items.length,
    hoveredIndex,
    isOpened: open,
    onSelect: (index) => alert(`Selected: ${items[index]}`),
    onToggle: () => setOpen((prev) => !prev),
    listRef: listRef,
  });

  return (
    <div onKeyDown={onKeyDown} tabIndex={0}>
      <h1>useKeyboardListNavigation Demo</h1>
      <button onClick={() => setOpen((prev) => !prev)}>
        {open ? 'Close' : 'Open'} List
      </button>
      {open && (
        <ul ref={listRef}>
          {items.map((item, index) => (
            <li
              key={item}
              style={{
                padding: '5px',
                background:
                  currentHoveredIndex === index ? 'lightblue' : 'transparent',
              }}
            >
              {item}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export const Demo = {
  args: {
    items: ['Item 1', 'Item 2', 'Item 3', 'Item 4'],
    hoveredIndex: 0,
    isOpened: true,
  },
  render: ({ items, hoveredIndex, isOpened }) => (
    <Template items={items} hoveredIndex={hoveredIndex} isOpened={isOpened} />
  ),
};
