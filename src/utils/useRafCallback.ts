import { useCallback, useEffect, useRef } from 'react';

export function useRafCallback<T extends (...args: never[]) => void>(callback: T): T {
  const callbackRef = useRef(callback);
  const frameRef = useRef<number | null>(null);
  const lastArgsRef = useRef<Parameters<T> | null>(null);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(
    () => () => {
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
      }
    },
    []
  );

  return useCallback((...args: Parameters<T>) => {
    lastArgsRef.current = args;

    if (frameRef.current !== null) {
      return;
    }

    frameRef.current = requestAnimationFrame(() => {
      frameRef.current = null;

      if (lastArgsRef.current) {
        callbackRef.current(...lastArgsRef.current);
      }
    });
  }, []) as T;
}
