type ThrottleOptions = {
  /**
   * If true, the throttled function will be invoked on the leading edge of the timeout.
   */
  leading?: boolean;
  /**
   * If true, the throttled function will be invoked on the trailing edge of the timeout.
   */
  trailing?: boolean;
};

type Throttled<T extends (...args: never[]) => unknown> = ((
  ...args: Parameters<T>
) => ReturnType<T> | undefined) & {
  /**
   * Cancels any pending throttled function calls and resets the throttle state.
   * This method clears any scheduled timeouts and resets internal state.
   */
  cancel: () => void;
};

const now = () => Date.now();

export function throttle<T extends (...args: never[]) => unknown>(
  func: T,
  wait: number,
  options: ThrottleOptions = {}
): Throttled<T> {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  let context: ThisParameterType<T> | null = null;
  let args: Parameters<T> | null = null;
  let result: ReturnType<T> | undefined;
  let previous = 0;

  const later = () => {
    previous = options.leading === false ? 0 : now();
    timeout = null;
    if (args !== null && context !== null) {
      result = func.apply(context, args) as ReturnType<T>;
    }
    context = null;
    args = null;
  };

  const throttled = function throttledFn(
    this: ThisParameterType<T>,
    ...innerArgs: Parameters<T>
  ): ReturnType<T> | undefined {
    const current = now();

    if (!previous && options.leading === false) {
      previous = current;
    }

    const remaining = wait - (current - previous);

    // eslint-disable-next-line @typescript-eslint/no-this-alias
    context = this;
    args = innerArgs;

    if (remaining <= 0 || remaining > wait) {
      if (timeout) {
        clearTimeout(timeout);
        timeout = null;
      }
      previous = current;
      result = func.apply(context, args) as ReturnType<T>;
      context = null;
      args = null;
    } else if (!timeout && options.trailing !== false) {
      timeout = setTimeout(later, remaining);
    }

    return result;
  } as Throttled<T>;

  throttled.cancel = () => {
    if (timeout) {
      clearTimeout(timeout);
    }
    previous = 0;
    timeout = null;
    context = null;
    args = null;
  };

  return throttled;
}
