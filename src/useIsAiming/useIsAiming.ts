import { useEffect, useRef, useCallback } from 'react';

import {
  Point,
  UseIsAimingOptions,
  UseIsAimingResult,
} from './useIsAiming.types';

const DEFAULT_TOLERANCE = 20;
const DEFAULT_IDLE_TIMEOUT = 500;

/**
 * Returns the cross product of OA and OB vectors.
 * Used to determine orientation and triangle area.
 * @param {Point} o - The origin point.
 * @param {Point} a - The first point.
 * @param {Point} b - The second point.
 * @returns {number} The cross product value.
 */
const cross = (o: Point, a: Point, b: Point): number => {
  return (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
};

/**
 * Checks whether a point lies inside a triangle
 * using sign-of-area method.
 * @param {Point} p - The point to check.
 * @param {Point} a - The first vertex of the triangle.
 * @param {Point} b - The second vertex of the triangle.
 * @param {Point} c - The third vertex of the triangle.
 * @returns {boolean} True if the point is inside the triangle.
 */
const pointInTriangle = (p: Point, a: Point, b: Point, c: Point): boolean => {
  const d1 = cross(p, a, b);
  const d2 = cross(p, b, c);
  const d3 = cross(p, c, a);

  const hasNeg = d1 < 0 || d2 < 0 || d3 < 0;
  const hasPos = d1 > 0 || d2 > 0 || d3 > 0;

  return !(hasNeg && hasPos);
};

/**
 * Computes the absolute area of a triangle.
 * @param {Point} a - The first vertex of the triangle.
 * @param {Point} b - The second vertex of the triangle.
 * @param {Point} c - The third vertex of the triangle.
 * @returns {number} The area of the triangle.
 */
const triangleArea = (a: Point, b: Point, c: Point): number => {
  return Math.abs(cross(a, b, c)) / 2;
};

/**
 * Returns rectangle vertices (actual element bounds).
 * Order: top-left, top-right, bottom-right, bottom-left
 * @param {HTMLElement} el - The HTML element to get vertices for.
 * @returns {[Point, Point, Point, Point]} Array of four vertices in page coordinates.
 */
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

/**
 * Computes polygon area using shoelace formula.
 * @param {Point[]} points - Array of polygon vertices.
 * @returns {number} The area of the polygon.
 */
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

/**
 * Finds intersection point of two line segments.
 * Returns null if segments don't intersect.
 * @param {Point} p1 - The first point of the first segment.
 * @param {Point} p2 - The second point of the first segment.
 * @param {Point} p3 - The first point of the second segment.
 * @param {Point} p4 - The second point of the second segment.
 * @returns {Point | null} The intersection point or null if segments don't intersect.
 */
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

/**
 * Checks if a point is inside a rectangle.
 * @param {Point} p - The point to check.
 * @param {[Point, Point, Point, Point]} rectVertices - The four vertices of the rectangle.
 * @returns {boolean} True if the point is inside the rectangle.
 */
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

/**
 * Clips triangle by rectangle and returns intersection polygon.
 * Collects all points inside rectangle and intersection points, then sorts them.
 * @param {[Point, Point, Point]} triangleVertices - The three vertices of the triangle.
 * @param {[Point, Point, Point, Point]} rectVertices - The four vertices of the rectangle.
 * @returns {Point[]} Array of points forming the intersection polygon.
 */
const clipTriangleByRectangle = (
  triangleVertices: [Point, Point, Point],
  rectVertices: [Point, Point, Point, Point]
): Point[] => {
  const [a, b, c] = triangleVertices;
  const [tl, tr, br, bl] = rectVertices;

  const points: Point[] = [];

  // Add triangle vertices that are inside rectangle
  for (const p of [a, b, c]) {
    if (pointInRectangle(p, rectVertices)) {
      points.push(p);
    }
  }

  // Find intersections between triangle edges and rectangle edges
  const rectEdges: Array<[Point, Point]> = [
    [tl, tr],
    [tr, br],
    [br, bl],
    [bl, tl],
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

  // Remove duplicates
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

  // Sort points by angle from centroid to form convex polygon
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

/**
 * Computes the area of triangle that overlaps with rectangle.
 * @param {Point} cursor - The cursor position (triangle vertex).
 * @param {Point} a - The first vertex of the triangle edge.
 * @param {Point} b - The second vertex of the triangle edge.
 * @param {[Point, Point, Point, Point]} rectVertices - The element vertices.
 * @returns {number} The overlap area.
 */
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

/**
 * Selects the vertex pair (including diagonals) that produces
 * the triangle with maximum "outside area" (triangle area minus overlap area).
 * @param {Point} cursor - The cursor position.
 * @param {[Point, Point, Point, Point]} vertices - The element vertices.
 * @returns {[Point, Point] | null} The best edge pair or null if not found.
 */
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

/**
 * Checks whether cursor movement is directed into
 * the triangle formed by previous position and intent edge.
 * @param {Point} prev - The previous cursor position.
 * @param {Point} current - The current cursor position.
 * @param {Point} edgeA - The first vertex of the intent edge.
 * @param {Point} edgeB - The second vertex of the intent edge.
 * @returns {boolean} True if the cursor is moving toward the triangle.
 */
const isMovingTowardTriangle = (
  prev: Point,
  current: Point,
  edgeA: Point,
  edgeB: Point
): boolean => {
  return pointInTriangle(current, prev, edgeA, edgeB);
};

export const useIsAiming = <T extends HTMLElement = HTMLElement>(
  options: UseIsAimingOptions
): UseIsAimingResult<T> => {
  const {
    tolerance = DEFAULT_TOLERANCE,
    isEnabled = true,
    handler,
    idleTimeout = DEFAULT_IDLE_TIMEOUT,
  } = options;

  const ref = useRef<T>(null);

  const isAimingRef = useRef(false);
  const lastCursorRef = useRef<Point | null>(null);
  const prevCursorRef = useRef<Point | null>(null);
  const lastRecalcCursorRef = useRef<Point | null>(null);
  const accumulatedMovementRef = useRef(0);
  const idleTimeoutRef = useRef<number | null>(null);

  /**
   * Updates aiming state and notifies consumer.
   * @param {boolean} value - The new aiming state.
   * @returns {void}
   */
  const setIsAiming = (value: boolean) => {
    isAimingRef.current = value;
    handler?.(value);
  };

  const getIsAiming = () => isAimingRef.current;

  /**
   * Re-evaluates whether the cursor is aiming
   * toward the referenced element.
   */
  const recalc = useCallback(() => {
    const cursor = lastCursorRef.current;
    const prev = prevCursorRef.current;
    const el = ref.current;

    if (!cursor || !prev || !el) {
      setIsAiming(false);
      lastRecalcCursorRef.current = null;
      accumulatedMovementRef.current = 0;
      return;
    }

    const vertices = getElementVertices(el);

    // If cursor is inside the element, aiming is always false
    if (pointInRectangle(cursor, vertices)) {
      setIsAiming(false);
      lastRecalcCursorRef.current = cursor;
      accumulatedMovementRef.current = 0;
      return;
    }

    const edge = findBestIntentEdge(cursor, vertices);

    if (!edge) {
      setIsAiming(false);
      accumulatedMovementRef.current = 0;
      lastRecalcCursorRef.current = cursor;
      return;
    }

    const aiming = isMovingTowardTriangle(prev, cursor, edge[0], edge[1]);

    // Tolerance only affects transitions when isAiming is already true
    // If transitioning from false to true, always allow it
    if (isAimingRef.current && !aiming) {
      // Currently aiming, but new calculation says not aiming
      // Check if accumulated movement is significant enough
      if (accumulatedMovementRef.current < tolerance) {
        // Movement is too small, keep current aiming state
        return;
      }
    }

    // Reset accumulated movement and update last recalculation cursor
    accumulatedMovementRef.current = 0;
    lastRecalcCursorRef.current = cursor;

    setIsAiming(aiming);
  }, [tolerance]);

  useEffect(() => {
    if (!isEnabled) {
      setIsAiming(false);
      lastCursorRef.current = null;
      prevCursorRef.current = null;
      lastRecalcCursorRef.current = null;
      accumulatedMovementRef.current = 0;
      return;
    }

    const onMouseMove = (e: MouseEvent) => {
      const newCursor = { x: e.pageX, y: e.pageY };
      const oldCursor = lastCursorRef.current;

      prevCursorRef.current = lastCursorRef.current;
      lastCursorRef.current = newCursor;

      // Accumulate movement distance
      if (oldCursor) {
        const dx = newCursor.x - oldCursor.x;
        const dy = newCursor.y - oldCursor.y;
        const movementDistance = Math.sqrt(dx * dx + dy * dy);
        accumulatedMovementRef.current += movementDistance;
      }

      // Clear idle timeout
      if (idleTimeoutRef.current) {
        clearTimeout(idleTimeoutRef.current);
        idleTimeoutRef.current = null;
      }

      // Immediate recalculation
      recalc();

      // Set idle timeout: if cursor doesn't move for specified time, set aiming to false
      idleTimeoutRef.current = window.setTimeout(() => {
        setIsAiming(false);
        accumulatedMovementRef.current = 0;
        lastRecalcCursorRef.current = null;
      }, idleTimeout);
    };

    document.addEventListener('mousemove', onMouseMove);

    return () => {
      document.removeEventListener('mousemove', onMouseMove);

      if (idleTimeoutRef.current) {
        clearTimeout(idleTimeoutRef.current);
      }
    };
  }, [isEnabled, recalc, idleTimeout]);

  return {
    isAiming: getIsAiming,
    ref,
  };
};
