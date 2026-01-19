import React, { useState, useCallback } from 'react';
import { StoryFn, Meta } from '@storybook/react';
import { useMenuAim } from '../useMenuAim';
import { MenuAimDirection } from '../useMenuAim.types';

export default {
  title: 'Hooks/useMenuAim',
  component: useMenuAim as unknown,
} as Meta;

interface TemplateArgs {
  /**
   * Direction in which the submenu opens.
   */
  direction: MenuAimDirection;
  /**
   * Pixel tolerance added to menu bounds.
   */
  tolerance: number;
  /**
   * Delay before switching items when aiming.
   */
  switchDelay: number;
}

const menuItems = ['Dashboard', 'Products', 'Orders', 'Customers', 'Settings'];

const Template: StoryFn<TemplateArgs> = (args: TemplateArgs) => {
  const { direction, tolerance, switchDelay } = args;

  const [activeItem, setActiveItem] = useState<string | null>(null);

  const { contentRef, isAimingRef, reset } = useMenuAim<HTMLDivElement>({
    direction,
    tolerance,
    switchDelay,
    enabled: true,
  });

  const handleItemHover = useCallback(
    (item: string) => {
      if (!isAimingRef.current) {
        setActiveItem(item);
      }
    },
    [isAimingRef]
  );

  const handleMenuLeave = useCallback(() => {
    setActiveItem(null);
    reset();
  }, [reset]);

  return (
    <div>
      <h1>useMenuAim Demo</h1>

      <p style={{ color: '#666', fontSize: '14px', marginBottom: '20px' }}>
        Hover over menu items and try moving diagonally toward the submenu. The
        hook prevents premature item switching when you&apos;re aiming toward
        the submenu.
      </p>

      <div
        style={{
          display: 'flex',
          gap: '0',
          position: 'relative',
        }}
        onMouseLeave={handleMenuLeave}
      >
        <ul
          style={{
            listStyle: 'none',
            padding: 0,
            margin: 0,
            backgroundColor: '#f5f5f5',
            borderRadius: '8px 0 0 8px',
            width: '200px',
          }}
        >
          {menuItems.map((item) => {
            return (
              <li
                key={item}
                onMouseEnter={() => {
                  handleItemHover(item);
                }}
                style={{
                  padding: '12px 16px',
                  cursor: 'pointer',
                  backgroundColor:
                    activeItem === item ? '#1976d2' : 'transparent',
                  color: activeItem === item ? 'white' : 'inherit',
                  transition: 'background-color 0.15s ease',
                }}
              >
                {item}
              </li>
            );
          })}
        </ul>

        {activeItem && (
          <div
            ref={contentRef}
            style={{
              backgroundColor: '#e3f2fd',
              padding: '20px',
              borderRadius: '0 8px 8px 0',
              minWidth: '250px',
              minHeight: '200px',
            }}
          >
            <h3 style={{ margin: '0 0 12px 0' }}>{activeItem}</h3>

            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              <li style={{ padding: '8px 0' }}>Submenu Item 1</li>
              <li style={{ padding: '8px 0' }}>Submenu Item 2</li>
              <li style={{ padding: '8px 0' }}>Submenu Item 3</li>
            </ul>
          </div>
        )}
      </div>

      <div
        style={{
          marginTop: '20px',
          padding: '12px',
          backgroundColor: '#fff3e0',
          borderRadius: '4px',
          fontSize: '14px',
        }}
      >
        <strong>Status:</strong> Active item: {activeItem ?? 'none'}
      </div>
    </div>
  );
};

export const Demo = {
  args: {
    direction: MenuAimDirection.RIGHT,
    tolerance: 40,
    switchDelay: 200,
  },
  render: ({ direction, tolerance, switchDelay }: TemplateArgs) => (
    <Template
      direction={direction}
      tolerance={tolerance}
      switchDelay={switchDelay}
    />
  ),
};
