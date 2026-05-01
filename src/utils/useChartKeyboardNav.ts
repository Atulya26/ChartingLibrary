import { useCallback, useMemo, useState } from 'react';
import type { KeyboardEvent } from 'react';

import { useThrottledValue } from './useThrottledValue';

type NavigationKey =
  | 'ArrowRight'
  | 'ArrowDown'
  | 'ArrowLeft'
  | 'ArrowUp'
  | 'Home'
  | 'End'
  | 'Enter'
  | ' '
  | 'Escape';

interface KeyboardNavOptions<T> {
  items: T[];
  enabled: boolean;
  onSelect?: (item: T, index: number) => void;
  onDismiss?: () => void;
  getAnnouncement: (item: T, index: number) => string;
  getNextIndex?: (currentIndex: number, key: NavigationKey, itemCount: number) => number;
}

interface KeyboardNavResult {
  focusedIndex: number | null;
  announcement: string;
  handlers: {
    onKeyDown: (event: KeyboardEvent<SVGSVGElement | HTMLDivElement>) => void;
    onFocus: () => void;
    onBlur: () => void;
  };
  setFocusedIndex: (index: number | null) => void;
}

function getDefaultNextIndex(currentIndex: number, key: NavigationKey, itemCount: number) {
  if (itemCount <= 0) {
    return currentIndex;
  }

  if (key === 'Home') {
    return 0;
  }

  if (key === 'End') {
    return itemCount - 1;
  }

  if (key === 'ArrowRight' || key === 'ArrowDown') {
    return (currentIndex + 1) % itemCount;
  }

  if (key === 'ArrowLeft' || key === 'ArrowUp') {
    return (currentIndex - 1 + itemCount) % itemCount;
  }

  return currentIndex;
}

export function useChartKeyboardNav<T>({
  items,
  enabled,
  onSelect,
  onDismiss,
  getAnnouncement,
  getNextIndex = getDefaultNextIndex
}: KeyboardNavOptions<T>): KeyboardNavResult {
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const rawAnnouncement = useMemo(() => {
    if (!enabled || focusedIndex === null || !items[focusedIndex]) {
      return '';
    }

    return getAnnouncement(items[focusedIndex], focusedIndex);
  }, [enabled, focusedIndex, getAnnouncement, items]);
  const announcement = useThrottledValue(rawAnnouncement, 150);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<SVGSVGElement | HTMLDivElement>) => {
      if (!enabled || items.length === 0) {
        return;
      }

      const key = event.key as NavigationKey;

      if (
        key !== 'ArrowRight' &&
        key !== 'ArrowDown' &&
        key !== 'ArrowLeft' &&
        key !== 'ArrowUp' &&
        key !== 'Home' &&
        key !== 'End' &&
        key !== 'Enter' &&
        key !== ' ' &&
        key !== 'Escape'
      ) {
        return;
      }

      if (key === 'Escape') {
        event.preventDefault();
        setFocusedIndex(null);
        onDismiss?.();
        return;
      }

      if (key === 'Enter' || key === ' ') {
        event.preventDefault();

        if (focusedIndex !== null && items[focusedIndex]) {
          onSelect?.(items[focusedIndex], focusedIndex);
        }

        return;
      }

      event.preventDefault();
      setFocusedIndex((current) => {
        const safeCurrent = current ?? 0;
        return getNextIndex(safeCurrent, key, items.length);
      });
    },
    [enabled, focusedIndex, getNextIndex, items, onDismiss, onSelect]
  );

  const handleFocus = useCallback(() => {
    if (!enabled || items.length === 0) {
      return;
    }

    setFocusedIndex((current) => current ?? 0);
  }, [enabled, items.length]);

  const handleBlur = useCallback(() => {
    setFocusedIndex(null);
    onDismiss?.();
  }, [onDismiss]);

  return {
    focusedIndex: enabled ? focusedIndex : null,
    announcement: enabled ? announcement : '',
    handlers: {
      onKeyDown: handleKeyDown,
      onFocus: handleFocus,
      onBlur: handleBlur
    },
    setFocusedIndex
  };
}
