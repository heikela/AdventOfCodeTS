import { Record, RecordOf } from "immutable";

type PointProps = { x: number; y: number };
export const Point = Record({ x: 0, y: 0 });
export type Point = RecordOf<PointProps>;

export function addPoints(a: Point, b: Point): Point {
  return Point({ x: a.x + b.x, y: a.y + b.y });
}

export function subtractPoints(a: Point, b: Point): Point {
  return Point({ x: a.x - b.x, y: a.y - b.y });
}

export function turnRight(dir: Point): Point {
  return Point({ x: -dir.y, y: dir.x });
}

export function turnLeft(dir: Point): Point {
  return Point({ x: dir.y, y: -dir.x });
}

export const up = Point({ x: 0, y: -1 });
export const down = Point({ x: 0, y: 1 });
export const left = Point({ x: -1, y: 0 });
export const right = Point({ x: 1, y: 0 });

export const orthogonalNeighbours = [up, right, down, left];

export const mooreNeighbours = [
  Point({ x: -1, y: -1 }),
  Point({ x: 0, y: -1 }),
  Point({ x: 1, y: -1 }),
  Point({ x: -1, y: 0 }),
  Point({ x: 1, y: 0 }),
  Point({ x: -1, y: 1 }),
  Point({ x: 0, y: 1 }),
  Point({ x: 1, y: 1 }),
];

// Manhattan distance?
// Negation?
// Scalar multiplication?
