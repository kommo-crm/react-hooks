/**
 * A simple 2D point.
 */
export interface Point {
  /**
   * The x coordinate of the point.
   */
  x: number;
  /**
   * The y coordinate of the point.
   */
  y: number;
}

/**
 * Options for the useIsAiming hook.
 */
export interface UseIsAimingOptions {
  /**
   * Pixel tolerance for movement detection.
   * @default 20
   */
  tolerance?: number;
  /**
   * Enables or disables the menu aim logic.
   * When disabled, the hook becomes a no-op.
   * @default true
   */
  isEnabled?: boolean;
  /**
   * A callback that will work when isAiming changes.
   */
  onChange?: (isAiming: boolean) => void;
  /**
   * Timeout in milliseconds after which isAiming is set to false
   * if the cursor remains idle (doesn't move).
   * @default 500
   */
  idleTimeout?: number;
}

/**
 * Result returned by the useIsAiming hook.
 */
export interface UseIsAimingResult<T extends HTMLElement = HTMLElement> {
  /**
   * Returns whether the mouse is currently moving toward the menu/submenu.
   */
  isAiming: () => boolean;
  /**
   * Ref to the menu DOM element (menu content container).
   * Used to calculate the edges of the menu.
   */
  ref: React.RefObject<T>;
}
