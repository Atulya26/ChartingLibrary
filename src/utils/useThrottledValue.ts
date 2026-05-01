import { useEffect, useState } from 'react';

export function useThrottledValue<T>(value: T, delayMs: number): T {
  const [throttledValue, setThrottledValue] = useState(value);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setThrottledValue(value);
    }, delayMs);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [delayMs, value]);

  return throttledValue;
}
