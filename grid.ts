import { Point } from "./point2d.ts";
import { Map, Seq } from "immutable";

export class Grid<T> {
  private _data: Map<Point, T>;

  constructor() {
    this._data = Map<Point, T>();
  }

  getOrElse(point: Point, sentinel: T): T {
    if (this._data.has(point)) {
      return this._data.get(point)!;
    } else {
      return sentinel;
    }
  }

  set(point: Point, value: T): void {
    this._data = this._data.set(point, value);
  }

  has(point: Point): boolean {
    return this._data.has(point);
  }

  delete(point: Point): void {
    this._data = this._data.delete(point);
  }

  keys(): Iterable<Point> {
    return this._data.keys();
  }

  values(): Iterable<T> {
    return this._data.values();
  }

  entries(): Iterable<[Point, T]> {
    return this._data.entries();
  }

  static fromMappedLines<T>(
    lines: string[],
    mapper: (char: string, x: number, y: number) => T
  ): Grid<T> {
    let grid = new Grid<T>();
    lines.map((line, y) => {
      line.split("").map((char, x) => {
        grid.set(Point({ x, y }), mapper(char, x, y));
      });
    });
    return grid;
  }

  static fromLines(lines: string[]): Grid<string> {
    let grid = new Grid<string>();
    lines.forEach((line, y) => {
      line.split("").forEach((char, x) => {
        grid.set(Point({ x, y }), char);
      });
    });
    return grid;
  }

  width(): number {
    const [min, max] = Seq(this._data.keys())
      .map((p) => p.x)
      .reduce(
        (acc, x) => [Math.min(acc[0], x), Math.max(acc[0], x)],
        [Infinity, -Infinity]
      );
    return max - min + 1;
  }

  height(): number {
    const [min, max] = Seq(this._data.keys())
      .map((p) => p.y)
      .reduce(
        (acc, x) => [Math.min(acc[0], x), Math.max(acc[0], x)],
        [Infinity, -Infinity]
      );
    return max - min + 1;
  }

  minX(): number {
    return Seq(this._data.keys())
      .map((p) => p.x)
      .reduce((acc, x) => Math.min(acc, x), Infinity);
  }

  minY(): number {
    return Seq(this._data.keys())
      .map((p) => p.y)
      .reduce((acc, x) => Math.min(acc, x), Infinity);
  }
}
