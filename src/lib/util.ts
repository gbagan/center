export function sumBy<T>(arr: readonly T[], fn: (x: T) => number): number {
  let total = 0;
  for (let i = 0, len = arr.length; i < len; i++) {
	  total += fn(arr[i]);
  }
  return total;
}

export function median(arr: readonly number[]): number | null{
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

export function minBy<A>(arr: readonly A[], fn: (x: A) => number): A | null {
  let min = null;
  let bestScore = Infinity;
  const n = arr.length;
  for (let i = 0; i < n; i++) {
    const x = arr[i];
    const score = fn(x);
    if (score < bestScore) {
      bestScore = score;
      min = x;
    } 
  }
  return min;
}

export function prefixSumsBy<A>(arr: readonly A[], fn: (x: A) => number): number[] {
  const result: number[] = [0];
  let sum = 0;

  for (const value of arr) {
    sum += fn(value);
    result.push(sum);
  }

  return result;
}