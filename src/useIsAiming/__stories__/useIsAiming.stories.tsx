import React, { useState, useCallback, useEffect, useRef } from 'react';
import { StoryFn, Meta } from '@storybook/react';
import { useIsAiming } from '../useIsAiming';
import { Point } from '../useIsAiming.types';
import {
  getElementVertices,
  findBestIntentEdge,
  pointInRectangle,
} from '../useIsAiming';

export default {
  title: 'Hooks/useIsAiming',
  component: useIsAiming as unknown,
} as Meta;

interface TemplateArgs {
  /**
   * Pixel tolerance for movement detection.
   */
  tolerance: number;
  /**
   * Timeout in milliseconds after which isAiming is set to false
   * if the cursor remains idle.
   */
  idleTimeout: number;
}

// Visualization utilities (using internal functions from hook)
interface VisualizationState {
  /**
   * The vertices of the element.
   */
  vertices: [Point, Point, Point, Point] | null;
  /**
   * The best edge of the element.
   */
  edge: [Point, Point] | null;
  /**
   * The current cursor position.
   */
  cursor: Point | null;
  /**
   * The previous cursor position.
   */
  prevCursor: Point | null;
  /**
   * The aiming state.
   */
  isAiming: boolean;
}

const createVisualizationCanvas = (): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');

  canvas.style.position = 'fixed';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  canvas.style.pointerEvents = 'none';
  canvas.style.zIndex = '999999';
  canvas.id = 'useIsAiming-visualization-canvas';

  const dpr = window.devicePixelRatio || 1;

  canvas.width = window.innerWidth * dpr;
  canvas.height = window.innerHeight * dpr;

  const ctx = canvas.getContext('2d');

  if (ctx) {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  document.body.appendChild(canvas);

  return canvas;
};

const removeVisualizationCanvas = (): void => {
  const canvas = document.getElementById('useIsAiming-visualization-canvas');

  if (canvas) {
    canvas.remove();
  }
};

const drawVisualization = (
  canvas: HTMLCanvasElement,
  state: VisualizationState
): void => {
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    return;
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (!state.vertices || !state.edge || !state.cursor || !state.prevCursor) {
    return;
  }

  const vertices = state.vertices;
  const edge = state.edge;
  const cursor = state.cursor;
  const prevCursor = state.prevCursor;

  // Draw rectangle vertices
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(vertices[0].x, vertices[0].y);
  ctx.lineTo(vertices[1].x, vertices[1].y);
  ctx.lineTo(vertices[2].x, vertices[2].y);
  ctx.lineTo(vertices[3].x, vertices[3].y);
  ctx.closePath();
  ctx.stroke();

  // Draw all vertices as small dots
  ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';

  for (const v of vertices) {
    ctx.beginPath();
    ctx.arc(v.x, v.y, 3, 0, Math.PI * 2);
    ctx.fill();
  }

  // Highlight selected edge vertices
  ctx.fillStyle = '#ff6b6b';
  ctx.beginPath();
  ctx.arc(edge[0].x, edge[0].y, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(edge[1].x, edge[1].y, 8, 0, Math.PI * 2);
  ctx.fill();

  // Draw triangle (prevCursor, edge[0], edge[1])
  ctx.beginPath();
  ctx.moveTo(prevCursor.x, prevCursor.y);
  ctx.lineTo(edge[0].x, edge[0].y);
  ctx.lineTo(edge[1].x, edge[1].y);
  ctx.closePath();

  // Fill triangle with semi-transparent color
  ctx.fillStyle = state.isAiming
    ? 'rgba(78, 205, 196, 0.2)'
    : 'rgba(0, 0, 0, 0.1)';
  ctx.fill();

  // Stroke triangle outline
  ctx.strokeStyle = state.isAiming ? '#4ecdc4' : 'rgba(0, 0, 0, 0.3)';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Draw cursor positions
  ctx.fillStyle = state.isAiming ? '#4ecdc4' : 'yellow';
  ctx.beginPath();
  ctx.arc(cursor.x, cursor.y, 6, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
  ctx.beginPath();
  ctx.arc(prevCursor.x, prevCursor.y, 4, 0, Math.PI * 2);
  ctx.fill();

  // Draw line from prev to current cursor
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(prevCursor.x, prevCursor.y);
  ctx.lineTo(cursor.x, cursor.y);
  ctx.stroke();
};

const menuItems = ['Dashboard', 'Products', 'Orders', 'Customers', 'Settings'];

const MenuTemplate: StoryFn<TemplateArgs> = function MenuTemplate(
  args: TemplateArgs
) {
  const { tolerance, idleTimeout } = args;

  const [activeItem, setActiveItem] = useState<string | null>(null);
  const [isAimingValue, setIsAimingValue] = useState(false);

  const { ref } = useIsAiming<HTMLDivElement>({
    tolerance,
    idleTimeout,
    isEnabled: true,
    onChange: setIsAimingValue,
  });

  const handleItemHover = useCallback(
    function onItemHover(item: string) {
      if (!isAimingValue) {
        setActiveItem(item);
      }
    },
    [isAimingValue]
  );

  const handleMenuLeave = function onMenuLeave() {
    setActiveItem(null);
  };

  return (
    <div>
      <h1>useIsAiming Menu Demo</h1>

      <p style={{ color: '#666', fontSize: '14px', marginBottom: '20px' }}>
        Hover over menu items and try moving diagonally toward the submenu. The
        hook automatically detects direction and prevents premature item
        switching when you&apos;re aiming toward the submenu.
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
          {menuItems.map(function renderMenuItem(item) {
            const handleMouseEnter = function onMouseEnter() {
              handleItemHover(item);
            };

            const handleMouseMove = function onMouseMove() {
              handleItemHover(item);
            };

            return (
              <li
                key={item}
                onMouseEnter={handleMouseEnter}
                onMouseMove={handleMouseMove}
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
            ref={ref}
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
        <strong>Status:</strong> Active item: {activeItem ?? 'none'} | Aiming:{' '}
        {isAimingValue ? 'Yes' : 'No'}
      </div>
    </div>
  );
};

function DemoComponent(args: TemplateArgs) {
  const { tolerance, idleTimeout } = args;

  const [isAimingValue, setIsAimingValue] = useState(false);
  const visualizationCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const visualizationStateRef = useRef<VisualizationState>({
    vertices: null,
    edge: null,
    cursor: null,
    prevCursor: null,
    isAiming: false,
  });
  const lastCursorRef = useRef<Point | null>(null);
  const prevCursorRef = useRef<Point | null>(null);

  const { ref, isAiming } = useIsAiming<HTMLDivElement>({
    tolerance,
    idleTimeout,
    onChange: (value) => {
      setIsAimingValue(value);
      // Update visualization when aiming state changes
      if (visualizationStateRef.current && visualizationCanvasRef.current) {
        visualizationStateRef.current.isAiming = value;
        drawVisualization(
          visualizationCanvasRef.current,
          visualizationStateRef.current
        );
      }
    },
  });

  // Visualization
  useEffect(() => {
    visualizationCanvasRef.current = createVisualizationCanvas();

    const handleResize = () => {
      if (visualizationCanvasRef.current) {
        const dpr = window.devicePixelRatio || 1;

        visualizationCanvasRef.current.width = window.innerWidth * dpr;
        visualizationCanvasRef.current.height = window.innerHeight * dpr;

        const ctx = visualizationCanvasRef.current.getContext('2d');

        if (ctx) {
          ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        }

        drawVisualization(
          visualizationCanvasRef.current,
          visualizationStateRef.current
        );
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      removeVisualizationCanvas();
      visualizationCanvasRef.current = null;
    };
  }, []);

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      const currentCursor = { x: e.pageX, y: e.pageY };
      const el = ref.current;

      if (!el) {
        return;
      }

      const vertices = getElementVertices(el);

      // If cursor is inside the element, clear visualization
      if (pointInRectangle(currentCursor, vertices)) {
        if (visualizationCanvasRef.current) {
          const ctx = visualizationCanvasRef.current.getContext('2d');
          if (ctx) {
            ctx.clearRect(
              0,
              0,
              visualizationCanvasRef.current.width,
              visualizationCanvasRef.current.height
            );
          }
        }
        prevCursorRef.current = lastCursorRef.current;
        lastCursorRef.current = currentCursor;
        return;
      }

      const edge = findBestIntentEdge(currentCursor, vertices);

      prevCursorRef.current = lastCursorRef.current;
      lastCursorRef.current = currentCursor;

      visualizationStateRef.current = {
        vertices,
        edge,
        cursor: currentCursor,
        prevCursor: prevCursorRef.current,
        isAiming: isAiming(),
      };

      if (visualizationCanvasRef.current) {
        drawVisualization(
          visualizationCanvasRef.current,
          visualizationStateRef.current
        );
      }
    };

    document.addEventListener('mousemove', onMouseMove);

    return () => {
      document.removeEventListener('mousemove', onMouseMove);
    };
  }, [ref, isAiming]);

  // Update visualization when aiming state changes (e.g., after idle timeout)
  useEffect(() => {
    const el = ref.current;
    const cursor = lastCursorRef.current;

    // Don't show visualization if cursor is inside the element
    if (el && cursor && pointInRectangle(cursor, getElementVertices(el))) {
      if (visualizationCanvasRef.current) {
        const ctx = visualizationCanvasRef.current.getContext('2d');
        if (ctx) {
          ctx.clearRect(
            0,
            0,
            visualizationCanvasRef.current.width,
            visualizationCanvasRef.current.height
          );
        }
      }
      return;
    }

    if (visualizationStateRef.current && visualizationCanvasRef.current) {
      visualizationStateRef.current.isAiming = isAimingValue;
      drawVisualization(
        visualizationCanvasRef.current,
        visualizationStateRef.current
      );
    }
  }, [isAimingValue, ref]);

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
      }}
    >
      <div
        style={{
          marginBottom: '20px',
          padding: '12px',
          backgroundColor: '#fff3e0',
          fontSize: '14px',
        }}
      >
        <strong>Status:</strong> Aiming:{' '}
        <span
          style={{
            color: isAimingValue ? '#4ecdc4' : '#ff6b6b',
            fontWeight: 'bold',
          }}
        >
          {isAimingValue ? 'YES' : 'NO'}
        </span>
      </div>

      <div
        ref={ref}
        style={{
          width: '300px',
          height: '300px',
          backgroundColor: '#e3f2fd',
          border: '2px solid #1976d2',
          borderRadius: '50px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '16px',
          color: '#1976d2',
        }}
      >
        Move your mouse toward this div
      </div>
    </div>
  );
}

export const Demo = {
  args: {
    tolerance: 20,
    idleTimeout: 500,
  },
  render: function render(args: TemplateArgs) {
    return (
      <DemoComponent
        tolerance={args.tolerance}
        idleTimeout={args.idleTimeout}
      />
    );
  },
};

export const Menu = {
  args: {
    tolerance: 20,
    idleTimeout: 500,
  },
  render: function render(args: TemplateArgs) {
    return (
      <MenuTemplate tolerance={args.tolerance} idleTimeout={args.idleTimeout} />
    );
  },
};
