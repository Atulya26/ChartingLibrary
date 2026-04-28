import type { ReactNode } from 'react';
import { Button, EmptyState } from '@innovaccer/design-system';

import { ChartCard } from './ChartCard';
import { cx } from '../utils/cx';
import type { ChartStateCardProps, ChartStateVariant } from '../types';

const defaultsByVariant: Record<
  ChartStateVariant,
  {
    title: string;
    headline: string;
    description: string;
    primaryActionLabel?: string;
  }
> = {
  empty: {
    title: 'Chart',
    headline: 'No data to show',
    description: 'Try a different time range or adjust your filters.'
  },
  error: {
    title: 'Chart',
    headline: 'Couldn’t load this chart',
    description: 'Please try again. If the issue persists, contact support.',
    primaryActionLabel: 'Retry'
  }
};

/**
 * MDS-styled empty illustration: a card-shaped frame with a faded chart silhouette
 * inside, drawn with the same flat, muted palette MDS uses for its empty-state art.
 */
function EmptyIllustration() {
  return (
    <svg
      width="160"
      height="120"
      viewBox="0 0 160 120"
      role="presentation"
      aria-hidden="true"
      className="cl-chart-state__illustration"
    >
      <rect x="20" y="14" width="120" height="86" rx="6" fill="#eef0f5" />
      <rect
        x="20"
        y="14"
        width="120"
        height="86"
        rx="6"
        fill="none"
        stroke="#d0d4dd"
        strokeWidth="1.5"
        strokeDasharray="4 4"
      />
      <line x1="32" y1="80" x2="128" y2="80" stroke="#bcc1cc" strokeWidth="1.5" />
      <rect x="40" y="60" width="14" height="20" rx="2" fill="#cdd2dd" />
      <rect x="62" y="48" width="14" height="32" rx="2" fill="#cdd2dd" />
      <rect x="84" y="56" width="14" height="24" rx="2" fill="#cdd2dd" />
      <rect x="106" y="40" width="14" height="40" rx="2" fill="#cdd2dd" />
      <circle cx="118" cy="36" r="14" fill="#ffffff" stroke="#bcc1cc" strokeWidth="1.5" />
      <line
        x1="128"
        y1="46"
        x2="138"
        y2="56"
        stroke="#bcc1cc"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

/**
 * MDS-styled error illustration: same card silhouette, but the chart is "broken"
 * with a disconnected line and a soft accent dot — signals failure without alarm.
 */
function ErrorIllustration() {
  return (
    <svg
      width="160"
      height="120"
      viewBox="0 0 160 120"
      role="presentation"
      aria-hidden="true"
      className="cl-chart-state__illustration"
    >
      <rect x="20" y="14" width="120" height="86" rx="6" fill="#fdecec" />
      <rect
        x="20"
        y="14"
        width="120"
        height="86"
        rx="6"
        fill="none"
        stroke="#f1b8b8"
        strokeWidth="1.5"
      />
      <line x1="32" y1="80" x2="128" y2="80" stroke="#e89595" strokeWidth="1.5" />
      <path
        d="M 36 70 L 56 50 L 70 60"
        fill="none"
        stroke="#d13438"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M 88 56 L 104 68 L 124 44"
        fill="none"
        stroke="#d13438"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="2 4"
      />
      <circle cx="80" cy="36" r="13" fill="#ffffff" stroke="#d13438" strokeWidth="1.8" />
      <line
        x1="80"
        y1="30"
        x2="80"
        y2="38"
        stroke="#d13438"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="80" cy="42" r="1.5" fill="#d13438" />
    </svg>
  );
}

function resolveImage(
  variant: ChartStateVariant,
  imageNode: ReactNode,
  imageSrc: string | undefined
): ReactNode {
  if (imageNode) return imageNode;
  if (imageSrc) {
    return <EmptyState.Image src={imageSrc} alt="" height="120px" />;
  }
  return variant === 'empty' ? <EmptyIllustration /> : <ErrorIllustration />;
}

export function ChartStateCard({
  variant,
  title,
  headline,
  description,
  imageSrc,
  image,
  primaryActionLabel,
  onPrimaryAction,
  secondaryActionLabel,
  onSecondaryAction,
  width = 502,
  bodyHeight = 232,
  showCardBackground = true
}: ChartStateCardProps) {
  const defaults = defaultsByVariant[variant];
  const resolvedTitle = title ?? defaults.title;
  const resolvedHeadline = headline ?? defaults.headline;
  const resolvedDescription = description ?? defaults.description;
  const resolvedPrimary =
    primaryActionLabel === undefined ? defaults.primaryActionLabel : primaryActionLabel;
  const showActions = Boolean(resolvedPrimary || secondaryActionLabel);
  const illustration = resolveImage(variant, image, imageSrc);

  return (
    <ChartCard
      width={width}
      surface={showCardBackground ? 'card' : 'plain'}
      className={cx('cl-chart-card', 'cl-chart-state', `cl-chart-state--${variant}`)}
    >
      <figure
        className="cl-chart-shell"
        aria-label={`${resolvedTitle} — ${resolvedHeadline}`}
      >
        <h3 className="cl-header__title">{resolvedTitle}</h3>
        <div
          className="cl-chart-state__body"
          style={{ minHeight: bodyHeight }}
          role={variant === 'error' ? 'alert' : 'status'}
        >
          <EmptyState size="small" className="cl-chart-state__empty-state">
            <EmptyState.Image>{illustration}</EmptyState.Image>
            <EmptyState.Title>{resolvedHeadline}</EmptyState.Title>
            <EmptyState.Description>{resolvedDescription}</EmptyState.Description>
            {showActions ? (
              <EmptyState.Actions>
                {resolvedPrimary ? (
                  <Button
                    appearance={variant === 'error' ? 'primary' : 'basic'}
                    type="button"
                    size="tiny"
                    onClick={onPrimaryAction}
                  >
                    {resolvedPrimary}
                  </Button>
                ) : null}
                {secondaryActionLabel ? (
                  <Button
                    appearance="transparent"
                    type="button"
                    size="tiny"
                    onClick={onSecondaryAction}
                  >
                    {secondaryActionLabel}
                  </Button>
                ) : null}
              </EmptyState.Actions>
            ) : null}
          </EmptyState>
        </div>
      </figure>
    </ChartCard>
  );
}
