import { Profiler, useSyncExternalStore } from 'react';
import type { ProfilerOnRenderCallback, ReactNode } from 'react';

interface ProfiledChartProps {
  label: string;
  children: ReactNode;
}

interface MetricSnapshot {
  commits: number;
  actualDuration: number;
  lastPhase: 'mount' | 'update' | 'nested-update' | '-';
}

const EMPTY_SNAPSHOT: MetricSnapshot = {
  commits: 0,
  actualDuration: 0,
  lastPhase: '-'
};

const metrics = new Map<string, MetricSnapshot>();
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function notify() {
  listeners.forEach((listener) => listener());
}

function getSnapshot(label: string) {
  return metrics.get(label) ?? EMPTY_SNAPSHOT;
}

function recordMetric(label: string, phase: MetricSnapshot['lastPhase'], actualDuration: number) {
  const previous = metrics.get(label) ?? EMPTY_SNAPSHOT;

  metrics.set(label, {
    commits: previous.commits + 1,
    actualDuration: previous.actualDuration + actualDuration,
    lastPhase: phase
  });
  notify();
}

function ProfilerBadge({ label }: { label: string }) {
  const snapshot = useSyncExternalStore(
    subscribe,
    () => getSnapshot(label),
    () => EMPTY_SNAPSHOT
  );

  return (
    <div
      aria-label={`${label} profiler commits`}
      style={{
        position: 'absolute',
        top: 8,
        right: 8,
        zIndex: 2,
        borderRadius: 999,
        background: 'rgba(17, 24, 39, 0.74)',
        color: '#fff',
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: 0.2,
        lineHeight: '16px',
        padding: '0 6px',
        pointerEvents: 'none'
      }}
    >
      {snapshot.commits} / {snapshot.actualDuration.toFixed(1)}ms
    </div>
  );
}

export function ProfiledChart({ label, children }: ProfiledChartProps) {
  const handleRender: ProfilerOnRenderCallback = (_id, phase, actualDuration) => {
    recordMetric(label, phase, actualDuration);
  };

  return (
    <div style={{ position: 'relative' }}>
      <ProfilerBadge label={label} />
      <Profiler id={label} onRender={handleRender}>
        {children}
      </Profiler>
    </div>
  );
}
