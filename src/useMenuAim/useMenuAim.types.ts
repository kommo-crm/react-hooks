/**
 * A simple 2D point.
 */
export type Point = {
  /**
   * The x coordinate of the point.
   */
  x: number;
  /**
   * The y coordinate of the point.
   */
  y: number;
};

/**
 * Valid menu aim directions.
 */
export const enum MenuAimDirection {
  /**
   * Menu aims up.
   */
  TOP = 'top',
  /**
   * Menu aims right.
   */
  RIGHT = 'right',
  /**
   * Menu aims down.
   */
  BOTTOM = 'bottom',
  /**
   * Menu aims left.
   */
  LEFT = 'left',
}

/**
 * Options for the useMenuAim hook.
 */
export interface UseMenuAimOptions {
  /**
   * Direction in which the submenu opens.
   * This affects which menu corners are used to build
   * the "aim triangle".
   */
  direction: MenuAimDirection;
  /**
   * Delay (in ms) before allowing menu switching
   * when the cursor is moving toward the submenu.
   * @default 200
   */
  switchDelay?: number;
  /**
   * Pixel tolerance added to menu bounds.
   * @default 40
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
  handler?: (isAiming: boolean) => void;
}

/**
 * Result returned by the useMenuAim hook.
 */
export interface UseMenuAimResult<T extends HTMLElement = HTMLElement> {
  /**
   * Returns whether the mouse is currently moving toward the menu/submenu.
   */
  isAiming: () => boolean;
  /**
   * The delay that should be applied when movement
   * toward the menu is detected.
   */
  switchDelay: number;
  /**
   * Ref to the menu DOM element (menu content container).
   * Used to calculate the edges of the menu.
   */
  contentRef: React.RefObject<T>;
}
