export function sumBy<T>(arr: readonly T[], fn: (x: T) => number): number {
  let total = 0;
  for (let i = 0, len = arr.length; i < len; i++) {
	total += fn(arr[i]);
  }
  return total;
}

export function median(arr: readonly number[]) {
  if (arr.length === 0) {
    return null;
  }
  const sorted = arr.toSorted((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 1) {
    return sorted[mid];
  } else {
    return (sorted[mid - 1] + sorted[mid]) / 2;
  }
}