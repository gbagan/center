import { median, minBy, sumBy } from "./util";

export type Point = { readonly x: number, readonly y: number};
export type Disk = { readonly center: Point, readonly radius: number };

const EPS = 1e-9;

export function centroid(ps: readonly Point[]) {
  if (ps.length === 0) {
    return null;
  }
  return {
    x: sumBy(ps, p => p.x) / ps.length,
    y: sumBy(ps, p => p.y) / ps.length,
  }
}

function circumcenter(a: Point, b: Point, c: Point): Disk {
  const d = 2 * (
    a.x * (b.y - c.y) +
    b.x * (c.y - a.y) +
    c.x * (a.y - b.y)
  );

  const x = (
    (a.x**2 + a.y**2) * (b.y - c.y) +
    (b.x**2 + b.y**2) * (c.y - a.y) +
    (c.x**2 + c.y**2) * (a.y - b.y)
  ) / d;

  const y = (
    (a.x**2 + a.y**2) * (c.x - b.x) +
    (b.x**2 + b.y**2) * (a.x - c.x) +
    (c.x**2 + c.y**2) * (b.x - a.x)
  ) / d;

  const center = {x, y};
  return { center, radius: dist(center, a)}
}

export function dist(a: Point, b: Point) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

export function manhattan(a: Point, b: Point) {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

function insideCircle(p: Point, d: Disk) {
  return dist(p, d.center) <= d.radius + EPS
}

function trivialCircle(points: readonly Point[]): Disk {
  switch (points.length) {
    case 0:
      return {center: {x: 0, y: 0}, radius: 0};  
    case 1:
      return {center: points[0], radius: 0};
    case 2: 
      const center = {x: (points[0].x + points[1].x) / 2, y: (points[0].y + points[1].y) / 2};
      return {center, radius: dist(center, points[0]) };
    case 3:
      return circumcenter(points[0], points[1], points[2]);
    default:
      throw new Error("points.length must be 1 or 2 or 3")
  }
}

function welzl(ps: readonly Point[], rs: readonly Point[], n: number): Disk {
  if (n === 0 || rs.length === 3) {
    return trivialCircle(rs)
  }

  const p = ps[n - 1];
  const disk = welzl(ps, rs, n - 1);

  if (insideCircle(p, disk)) {
    return disk;
  }

  return welzl(ps, rs.concat([p]), n - 1);
}

export function minimumEnclosingCircle(points: readonly Point[]): Disk | null {
  if (points.length === 0) {
    return null;
  }
  return welzl(points, [], points.length)
}

export function geometricMedian(points: readonly Point[], eps=1e-5, maxIter=500) {
  if (points.length === 0) {
    return null;
  }
  let current = centroid(points)!;

  for (let iter = 0; iter < maxIter; iter++) {
    let numX = 0;
    let numY = 0;
    let den = 0;

    for (const p of points) {
      const d = dist(current, p);
      if (d < eps) return p;
      const w = 1 / d;
      numX += w * p.x;
      numY += w * p.y;
      den += w;
    }

    const next = {x: numX / den, y: numY / den};
    const move = dist(current, next);
    current = next;

    if (move < eps) {
      break
    }
  }

  return current
}

export function minimumEnclosingLosange(points: readonly Point[]): Disk | null {
  if (points.length === 0) {
    return null;
  }
  const us = points.map(p => p.x + p.y);
  const vs = points.map(p => p.x - p.y);
  const uMin = Math.min(...us);
  const uMax = Math.max(...us);
  const vMin = Math.min(...vs);
  const vMax = Math.max(...vs);
  const u = (uMin + uMax) / 2;
  const v = (vMin + vMax) / 2;
  const center = {x: (u + v) / 2, y: (u - v) / 2};
  const radius = Math.max(uMax - uMin, vMax - vMin) / 2;
  return {center, radius};  
}

export function geometricMedianL1(points: readonly Point[]): Point | null {
  if (points.length === 0) {
    return null;
  }
  const x = median(points.map(p => p.x))!;
  const y = median(points.map(p => p.y))!;
  return { x, y };
}

export function sumSquareL1(p: Point, points: readonly Point[]) {
  return sumBy(points, p2 => {
    const l1 = manhattan(p, p2);
    return l1 * l1;
  });
}

/*
function squareL1Gradient(p: Point, points: readonly Point[]): [number, number] {
  let gx = 0;
  let gy = 0;
  for (const p2 of points) {
    const l1 = manhattan(p, p2);
    gx += l1 * Math.sign(p.x - p2.x);
    gy += l1 * Math.sign(p.y - p2.y);
  }
  return [2 * gx, 2 * gy];
}

function minimizeSquareL1(points: readonly Point[], p: Point, { lr = 0.1, maxIter = 10000, tol = 1e-5 } = {}): Point {
  let {x, y} = p;
  let i = 0;
  for (i = 0; i < maxIter; i++) {
    const [gx, gy] = squareL1Gradient({x, y}, points);
    const dx = lr * gx;
    const dy = lr * gy;
    x -= dx;
    y -= dy;
    if (Math.abs(dx) < tol && Math.abs(dy) < tol) break;
  }

  console.log("i", i);

  return {x, y};
}
*/

function solve1D(sorted: {a: number, c: number}[]): number {
  const n = sorted.length;
  const meanA  = sumBy(sorted, p => p.a) / n;
  const sumC = sumBy(sorted, p => p.c);

  let sumCp = 0;
  for (let k = 0; k <= n; k++) {
    const t  = meanA + (sumC - 2 * sumCp) / n;
    const hi = k === n ? +Infinity : sorted[k].a;

    if (t <= hi) {
      const lo = k === 0 ? -Infinity : sorted[k - 1].a;
      return Math.max(t, lo);
    }

    if (k < n) sumCp += sorted[k].c;
  }
  throw new Error("unreachable");
}

export function squareCenterL1(points: Point[], maxIter = 100, tol = 1e-9) {
  if (points.length === 0) {
    return null;
  }

  const sortedByX = points.toSorted((a, b) => a.x - b.x);
  const sortedByY = points.toSorted((a, b) => a.y - b.y);

  let {x, y} = centroid(points)!;

  for (let iter = 0; iter < maxIter; iter++) {
    const xNew = solve1D(sortedByX.map(p => ({ a: p.x, c: Math.abs(y  - p.y) })));
    const yNew = solve1D(sortedByY.map(p => ({ a: p.y, c: Math.abs(xNew - p.x) })));

    let test = (Math.abs(xNew - x) < tol && Math.abs(yNew - y) < tol);
    x = xNew; y = yNew;
    if (test) {
      console.log("converged", iter);
      break;
    }
  }

  return {x, y};
}



/*
export function squareCenterL1(points: readonly Point[], nRestarts = 6) {
  if (points.length === 0) {
    return null;
  }
  
  const xs = points.map(p => p.x), ys = points.map(p => p.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const cd = centroid(points)!;

  const starts: Point[] = [cd, ...Array.from({ length: nRestarts - 1 }, () => ({
    x: minX + Math.random() * (maxX - minX),
    y: minY + Math.random() * (maxY - minY),
  }))];

  const candidates = starts.map(x0 => minimizeSquareL1(points, x0));
  return minBy(candidates, p => sumSquareL1(p, points))!;
}
*/