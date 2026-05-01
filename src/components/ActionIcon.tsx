import type { SVGProps } from 'react';

import type { ChartActionId } from '../types';

interface ActionIconProps extends SVGProps<SVGSVGElement> {
  action: ChartActionId;
}

export function ActionIcon({ action, ...props }: ActionIconProps) {
  const common = {
    fill: 'none',
    stroke: 'currentColor',
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    strokeWidth: 1.4
  };

  return (
    <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true" {...props}>
      {action === 'restore' && (
        <>
          <path d="M4 4V1.75" {...common} />
          <path d="M4 1.75L1.75 4" {...common} />
          <path d="M4 1.75L6.25 4" {...common} />
          <path d="M4 8a4.5 4.5 0 1 0 1.43-3.26" {...common} />
        </>
      )}
      {action === 'line-view' && <path d="M2 11l3-3 2 1 4-5 3 2" {...common} />}
      {action === 'bar-view' && (
        <>
          <path d="M3 13V7" {...common} />
          <path d="M8 13V4" {...common} />
          <path d="M13 13V9" {...common} />
        </>
      )}
      {action === 'data-view' && (
        <>
          <rect x="3" y="2.5" width="9.5" height="11" rx="1.2" {...common} />
          <path d="M5.25 6h5.5" {...common} />
          <path d="M5.25 8.75h5.5" {...common} />
          <path d="M5.25 11.5h4.2" {...common} />
        </>
      )}
      {action === 'zoom-in' && (
        <>
          <circle cx="6.5" cy="6.5" r="3.75" {...common} />
          <path d="M12 12l-2.25-2.25" {...common} />
          <path d="M6.5 4.75v3.5" {...common} />
          <path d="M4.75 6.5h3.5" {...common} />
        </>
      )}
      {action === 'zoom-out' && (
        <>
          <circle cx="6.5" cy="6.5" r="3.75" {...common} />
          <path d="M12 12l-2.25-2.25" {...common} />
          <path d="M4.75 6.5h3.5" {...common} />
        </>
      )}
      {action === 'save-image' && (
        <>
          <rect x="2.5" y="3" width="11" height="9.5" rx="1.4" {...common} />
          <path d="M5 9.5l1.75-1.75L8.5 9.5 10 8l1.5 1.5" {...common} />
          <circle cx="6" cy="5.75" r=".75" fill="currentColor" stroke="none" />
        </>
      )}
    </svg>
  );
}
