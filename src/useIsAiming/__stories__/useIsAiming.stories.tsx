import React, { useState, useCallback, useEffect, useRef } from 'react';
import { StoryFn, Meta } from '@storybook/react';
import { useIsAiming } from '../useIsAiming';
import { Point } from '../useIsAiming.types';

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

// Visualization utilities (copied from hook for visualization)
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

const getElementVertices = (el: HTMLElement): [Point, Point, Point, Point] => {
  const rect = el.getBoundingClientRect();
  const scrollX = window.pageXOffset;
  const scrollY = window.pageYOffset;

  return [
    {
      x: rect.left + scrollX,
      y: rect.top + scrollY,
    },
    {
      x: rect.right + scrollX,
      y: rect.top + scrollY,
    },
    {
      x: rect.right + scrollX,
      y: rect.bottom + scrollY,
    },
    {
      x: rect.left + scrollX,
      y: rect.bottom + scrollY,
    },
  ];
};

const cross = (o: Point, a: Point, b: Point): number => {
  return (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
};

const triangleArea = (a: Point, b: Point, c: Point): number => {
  return Math.abs(cross(a, b, c)) / 2;
};

const pointInRectangle = (
  p: Point,
  rectVertices: [Point, Point, Point, Point]
): boolean => {
  const [tl, tr, br, bl] = rectVertices;
  const minX = Math.min(tl.x, bl.x);
  const maxX = Math.max(tr.x, br.x);
  const minY = Math.min(tl.y, tr.y);
  const maxY = Math.max(bl.y, br.y);

  return p.x >= minX && p.x <= maxX && p.y >= minY && p.y <= maxY;
};

const polygonArea = (points: Point[]): number => {
  if (points.length < 3) {
    return 0;
  }

  let area = 0;

  for (let i = 0; i < points.length; i++) {
    const j = (i + 1) % points.length;

    area += points[i].x * points[j].y;
    area -= points[j].x * points[i].y;
  }

  return Math.abs(area) / 2;
};

const lineSegmentIntersection = (
  p1: Point,
  p2: Point,
  p3: Point,
  p4: Point
): Point | null => {
  const denom = (p4.y - p3.y) * (p2.x - p1.x) - (p4.x - p3.x) * (p2.y - p1.y);

  if (Math.abs(denom) < 1e-10) {
    return null;
  }

  const ua =
    ((p4.x - p3.x) * (p1.y - p3.y) - (p4.y - p3.y) * (p1.x - p3.x)) / denom;
  const ub =
    ((p2.x - p1.x) * (p1.y - p3.y) - (p2.y - p1.y) * (p1.x - p3.x)) / denom;

  if (ua < 0 || ua > 1 || ub < 0 || ub > 1) {
    return null;
  }

  return {
    x: p1.x + ua * (p2.x - p1.x),
    y: p1.y + ua * (p2.y - p1.y),
  };
};

const clipTriangleByRectangle = (
  triangleVertices: [Point, Point, Point],
  rectVertices: [Point, Point, Point, Point]
): Point[] => {
  const [a, b, c] = triangleVertices;

  const points: Point[] = [];

  for (const p of [a, b, c]) {
    if (pointInRectangle(p, rectVertices)) {
      points.push(p);
    }
  }

  const rectEdges: Array<[Point, Point]> = [
    [rectVertices[0], rectVertices[1]],
    [rectVertices[1], rectVertices[2]],
    [rectVertices[2], rectVertices[3]],
    [rectVertices[3], rectVertices[0]],
  ];

  const triangleEdges: Array<[Point, Point]> = [
    [a, b],
    [b, c],
    [c, a],
  ];

  for (const triEdge of triangleEdges) {
    for (const rectEdge of rectEdges) {
      const intersection = lineSegmentIntersection(
        triEdge[0],
        triEdge[1],
        rectEdge[0],
        rectEdge[1]
      );

      if (intersection) {
        points.push(intersection);
      }
    }
  }

  const uniquePoints: Point[] = [];

  for (const p of points) {
    const isDuplicate = uniquePoints.some(
      (existing) =>
        Math.abs(existing.x - p.x) < 1e-6 && Math.abs(existing.y - p.y) < 1e-6
    );

    if (!isDuplicate) {
      uniquePoints.push(p);
    }
  }

  if (uniquePoints.length < 3) {
    return [];
  }

  const centroid = {
    x:
      uniquePoints.reduce(function sumX(acc, p) {
        return acc + p.x;
      }, 0) / uniquePoints.length,
    y:
      uniquePoints.reduce(function sumY(acc, p) {
        return acc + p.y;
      }, 0) / uniquePoints.length,
  };

  uniquePoints.sort(function compareByAngle(p1, p2) {
    const angle1 = Math.atan2(p1.y - centroid.y, p1.x - centroid.x);
    const angle2 = Math.atan2(p2.y - centroid.y, p2.x - centroid.x);

    return angle1 - angle2;
  });

  return uniquePoints;
};

const triangleRectangleOverlapArea = (
  cursor: Point,
  a: Point,
  b: Point,
  rectVertices: [Point, Point, Point, Point]
): number => {
  const triangle: [Point, Point, Point] = [cursor, a, b];
  const intersectionPolygon = clipTriangleByRectangle(triangle, rectVertices);

  if (intersectionPolygon.length < 3) {
    return 0;
  }

  return polygonArea(intersectionPolygon);
};

const findBestIntentEdge = (
  cursor: Point,
  vertices: [Point, Point, Point, Point]
): [Point, Point] | null => {
  const pairs: Array<[number, number]> = [
    [0, 1],
    [0, 2],
    [0, 3],
    [1, 2],
    [1, 3],
    [2, 3],
  ];

  let bestEdge: [Point, Point] | null = null;
  let maxOutsideArea = -1;

  for (const [i, j] of pairs) {
    const a = vertices[i];
    const b = vertices[j];

    const triangleAreaValue = triangleArea(cursor, a, b);
    const overlapArea = triangleRectangleOverlapArea(cursor, a, b, vertices);
    const outsideArea = triangleAreaValue - overlapArea;

    if (outsideArea > maxOutsideArea) {
      maxOutsideArea = outsideArea;
      bestEdge = [a, b];
    }
  }

  return bestEdge;
};

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
    handler: setIsAimingValue,
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
    handler: (value) => {
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
