import type { ReactNode } from 'react';

interface RenderCounterProps {
  label: string;
  children?: ReactNode;
}

const renderCounts = new Map<string, number>();

export function RenderCounter({ label, children }: RenderCounterProps) {
  const count = (renderCounts.get(label) ?? 0) + 1;
  renderCounts.set(label, count);

  return (
    <div style={{ position: 'relative' }}>
      <div
        aria-label={`${label} render count`}
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
        {count}
      </div>
      {children}
    </div>
  );
}
