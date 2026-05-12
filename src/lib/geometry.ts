import { sumBy } from "./util";

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

function is_in_circle(p: Point, d: Disk) {
  return dist(p, d.center) <= d.radius + EPS
}

function trivial_circle(points: readonly Point[]): Disk {
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
    return trivial_circle(rs)
  }

  const p = ps[n - 1];
  const disk = welzl(ps, rs, n - 1);

  if (is_in_circle(p, disk)) {
    return disk;
  }

  return welzl(ps, rs.concat([p]), n - 1);
}

export function minimum_enclosing_circle(points: readonly Point[]): Disk | null {
  if (points.length === 0) {
    return null;
  }
  return welzl(points, [], points.length)
}

export function geometric_median(points: readonly Point[], eps=1e-5, maxIter=500) {
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