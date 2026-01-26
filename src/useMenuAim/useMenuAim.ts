import { useEffect, useRef, useCallback } from 'react';

import {
  MenuAimDirection,
  Point,
  UseMenuAimOptions,
  UseMenuAimResult,
} from './useMenuAim.types';

const DEFAULT_SWITCH_DELAY = 200;
const DEFAULT_TOLERANCE = 40;
const RECALC_DELAY = 100;

const pointInTriangle = (p: Point, a: Point, b: Point, c: Point): boolean => {
  const sign = (p1: Point, p2: Point, p3: Point) => {
    return (p1.x - p3.x) * (p2.y - p3.y) - (p2.x - p3.x) * (p1.y - p3.y);
  };

  const d1 = sign(p, a, b);
  const d2 = sign(p, b, c);
  const d3 = sign(p, c, a);

  const hasNeg = d1 < 0 || d2 < 0 || d3 < 0;
  const hasPos = d1 > 0 || d2 > 0 || d3 > 0;

  return !(hasNeg && hasPos);
};

const getMenuDirectionVector = (
  direction: UseMenuAimOptions['direction']
): Point => {
  switch (direction) {
    case MenuAimDirection.LEFT:
      return { x: -1, y: 0 };

    case MenuAimDirection.RIGHT:
      return { x: 1, y: 0 };

    case MenuAimDirection.TOP:
      return { x: 0, y: -1 };

    case MenuAimDirection.BOTTOM:
      return { x: 0, y: 1 };

    default:
      return { x: 0, y: 0 };
  }
};

const isAiming = (prev: Point, current: Point, dir: Point): boolean => {
  const dx = current.x - prev.x;
  const dy = current.y - prev.y;

  return dx * dir.x + dy * dir.y > 0;
};

const getContentEdge = (
  el: HTMLElement,
  direction: UseMenuAimOptions['direction'],
  tolerance: number
): [Point, Point] => {
  const r = el.getBoundingClientRect();
  const scrollX = window.pageXOffset;
  const scrollY = window.pageYOffset;

  switch (direction) {
    case MenuAimDirection.RIGHT:
      return [
        { x: r.left + scrollX, y: r.top - tolerance + scrollY },
        { x: r.left + scrollX, y: r.bottom + tolerance + scrollY },
      ];

    case MenuAimDirection.LEFT:
      return [
        { x: r.right + scrollX, y: r.top - tolerance + scrollY },
        { x: r.right + scrollX, y: r.bottom + tolerance + scrollY },
      ];

    case MenuAimDirection.BOTTOM:
      return [
        { x: r.left - tolerance + scrollX, y: r.top + scrollY },
        { x: r.right + tolerance + scrollX, y: r.top + scrollY },
      ];

    case MenuAimDirection.TOP:
      return [
        { x: r.left - tolerance + scrollX, y: r.bottom + scrollY },
        { x: r.right + tolerance + scrollX, y: r.bottom + scrollY },
      ];

    default:
      return [
        { x: 0, y: 0 },
        { x: 0, y: 0 },
      ];
  }
};

export const useMenuAim = <T extends HTMLElement = HTMLElement>(
  options: UseMenuAimOptions
): UseMenuAimResult<T> => {
  const {
    direction,
    tolerance = DEFAULT_TOLERANCE,
    switchDelay = DEFAULT_SWITCH_DELAY,
    isEnabled = true,
    handler,
  } = options;

  const contentRef = useRef<T>(null);

  /**
   * Stores whether the cursor is currently moving toward the submenu.
   * Exposed as a ref to avoid unnecessary re-renders.
   * Use external ref if provided, otherwise create a new one.
   */
  const isAimingRef = useRef(false);

  const lastCursorRef = useRef<Point | null>(null);
  const prevCursorRef = useRef<Point | null>(null);

  /**
   * Timeout used to re-run calculations after mouse movement
   */
  const timeoutRef = useRef<number | null>(null);

  /**
   * Updates the aiming state and calls handler if value changed.
   * @param {boolean} value - The new aiming state.
   */
  const setIsAiming = (value: boolean) => {
    isAimingRef.current = value;

    handler?.(value);
  };

  const getIsAiming = () => {
    return isAimingRef.current;
  };

  /**
   * Recalculates whether the cursor is moving toward the submenu.
   */
  const recalc = useCallback(() => {
    const cursor = lastCursorRef.current;
    const prev = prevCursorRef.current;
    const el = contentRef.current;

    if (!cursor || !prev || !el) {
      setIsAiming(false);

      return;
    }

    const [edgeA, edgeB] = getContentEdge(el, direction, tolerance);

    /**
     * Check if the cursor is inside the intent triangle
     */
    const inTriangle = pointInTriangle(cursor, prev, edgeA, edgeB);

    if (!inTriangle) {
      setIsAiming(false);

      return;
    }

    const dirVector = getMenuDirectionVector(direction);
    const movingToward = isAiming(prev, cursor, dirVector);

    setIsAiming(movingToward);
  }, [contentRef, direction, tolerance, setIsAiming]);

  useEffect(() => {
    if (!isEnabled) {
      setIsAiming(false);
      lastCursorRef.current = null;
      prevCursorRef.current = null;

      return;
    }

    const handleMouseMove = (e: MouseEvent) => {
      prevCursorRef.current = lastCursorRef.current;
      lastCursorRef.current = { x: e.pageX, y: e.pageY };

      /**
       * Immediate recalculation on mouse move
       */
      recalc();

      /**
       * The timeout is intentionally used for stability:
       * if the mouse suddenly stops moving, we still perform
       * one final recalculation after a short delay.
       *
       * This helps avoid stale "moving toward menu" state
       * when the cursor stops inside the intent triangle.
       */
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = window.setTimeout(recalc, RECALC_DELAY);
    };

    document.addEventListener('mousemove', handleMouseMove);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isEnabled, recalc, setIsAiming]);

  return {
    isAiming: getIsAiming,
    switchDelay,
    contentRef,
  };
};
