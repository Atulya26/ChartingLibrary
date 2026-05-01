export interface DownsamplePoint {
  x: number;
  y: number;
}

const warningKeys = new Set<string>();

function canWarnInDevelopment() {
  const runtime = globalThis as typeof globalThis & {
    process?: { env?: { NODE_ENV?: string } };
  };

  return (
    runtime.process?.env?.NODE_ENV !== undefined && runtime.process.env.NODE_ENV !== 'production'
  );
}

function warnOnce(key: string, message: string) {
  if (!canWarnInDevelopment() || warningKeys.has(key)) {
    return;
  }

  warningKeys.add(key);
  console.warn(message);
}

function warnForUnsortedData(data: readonly DownsamplePoint[]) {
  if (!canWarnInDevelopment()) {
    return;
  }

  for (let index = 1; index < data.length; index += 1) {
    if (data[index].x < data[index - 1].x) {
      warnOnce(
        'downsample-unsorted',
        `[downsampleLttb] Data must be sorted by x ascending. Got ${data[index].x} < ${data[index - 1].x} at index ${index}. Result will be visually incorrect.`
      );
      return;
    }
  }
}

export function getDownsampleLimit(maxPoints: number | undefined, owner = 'downsample') {
  if (maxPoints === undefined) {
    return undefined;
  }

  if (!Number.isFinite(maxPoints) || maxPoints <= 0) {
    warnOnce(
      `${owner}-invalid`,
      `[${owner}] downsample must be a positive number. Received ${maxPoints}; rendering original data.`
    );
    return undefined;
  }

  if (maxPoints < 3) {
    warnOnce(
      `${owner}-too-small`,
      `[${owner}] downsample must be >= 3 for LTTB. Received ${maxPoints}; rendering original data.`
    );
    return undefined;
  }

  return Math.floor(maxPoints);
}

export function warnForLargeUndownsampledDataset(
  owner: string,
  pointCount: number,
  downsample: number | undefined
) {
  if (downsample !== undefined || pointCount <= 5000) {
    return;
  }

  const suggested = Math.min(1000, Math.max(500, Math.floor(pointCount / 5)));
  warnOnce(
    `${owner}-large-undownsampled`,
    `[${owner}] Received ${pointCount.toLocaleString('en-US')} points without \`downsample\` set. Consider \`downsample={${suggested}}\` for better rendering performance.`
  );
}

export function downsampleLttb<T extends DownsamplePoint>(
  data: readonly T[],
  maxPoints: number
): T[] {
  if (!Number.isFinite(maxPoints) || maxPoints < 3) {
    warnOnce(
      'downsample-maxpoints-invalid',
      '[downsampleLttb] maxPoints must be a finite number >= 3, returning input unchanged.'
    );
    return data as T[];
  }

  const targetPoints = Math.floor(maxPoints);

  if (data.length <= targetPoints) {
    return data as T[];
  }

  warnForUnsortedData(data);

  const sampled: T[] = [];
  const bucketSize = (data.length - 2) / (targetPoints - 2);
  let previousSelectedIndex = 0;
  sampled.push(data[previousSelectedIndex]);

  for (let bucketIndex = 0; bucketIndex < targetPoints - 2; bucketIndex += 1) {
    const nextBucketStart = Math.floor((bucketIndex + 1) * bucketSize) + 1;
    const nextBucketEnd = Math.min(Math.floor((bucketIndex + 2) * bucketSize) + 1, data.length);
    const nextBucketLength = Math.max(nextBucketEnd - nextBucketStart, 1);
    let averageX = 0;
    let averageY = 0;

    for (let index = nextBucketStart; index < nextBucketEnd; index += 1) {
      averageX += data[index].x;
      averageY += data[index].y;
    }

    averageX /= nextBucketLength;
    averageY /= nextBucketLength;

    const currentBucketStart = Math.floor(bucketIndex * bucketSize) + 1;
    const currentBucketEnd = Math.min(
      Math.floor((bucketIndex + 1) * bucketSize) + 1,
      data.length - 1
    );
    const previousPoint = data[previousSelectedIndex];
    let maxArea = -1;
    let selectedIndex = currentBucketStart;

    for (let index = currentBucketStart; index < currentBucketEnd; index += 1) {
      const area =
        Math.abs(
          (previousPoint.x - averageX) * (data[index].y - previousPoint.y) -
            (previousPoint.x - data[index].x) * (averageY - previousPoint.y)
        ) * 0.5;

      if (area > maxArea) {
        maxArea = area;
        selectedIndex = index;
      }
    }

    sampled.push(data[selectedIndex]);
    previousSelectedIndex = selectedIndex;
  }

  sampled.push(data[data.length - 1]);
  return sampled;
}
