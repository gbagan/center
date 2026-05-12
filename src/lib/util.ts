export function sumBy<T>(arr: readonly T[], fn: (x: T) => number): number {
  let total = 0;
  for (let i = 0, len = arr.length; i < len; i++){
	total = total + fn(arr[i]);
  }
  return total;
}