import { Point } from "./point2d.ts";
import { Map, Set, Seq } from "immutable";

export class Grid<T> {
  private _data: Map<Point, T>;

  constructor() {
    this._data = Map<Point, T>();
  }

  static fromSet<T>(set: Set<Point>, value: T): Grid<T> {
    let grid = new Grid<T>();
    grid._data = Map(set.toArray().map((p) => [p, value]));
    return grid;
  }

  getOrElse(point: Point, sentinel: T): T {
    if (this._data.has(point)) {
      return this._data.get(point)!;
    } else {
      return sentinel;
    }
  }

  get(point: Point): T | undefined {
    return this._data.get(point);
  }

  set(point: Point, value: T): Grid<T> {
    const newGrid = new Grid<T>();
    newGrid._data = this._data.set(point, value);
    return newGrid;
  }

  has(point: Point): boolean {
    return this._data.has(point);
  }

  delete(point: Point): Grid<T> {
    const newGrid = new Grid<T>();
    newGrid._data = this._data.delete(point);
    return newGrid;
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
    grid._data = Map(
      lines.flatMap((line, y) =>
        line
          .split("")
          .map<[Point, T]>((char, x) => [Point({ x, y }), mapper(char, x, y)])
      )
    );
    return grid;
  }

  static fromLines(lines: string[]): Grid<string> {
    let grid = new Grid<string>();
    grid._data = Map(
      lines.flatMap((line, y) =>
        line
          .split("")
          .map<[Point, string]>((char, x) => [Point({ x, y }), char])
      )
    );
    return grid;
  }

  width(): number {
    const [min, max] = Seq(this._data.keys())
      .map((p) => p.x)
      .reduce(
        (acc, x) => [Math.min(acc[0], x), Math.max(acc[1], x)],
        [Infinity, -Infinity]
      );
    return max - min + 1;
  }

  height(): number {
    const [min, max] = Seq(this._data.keys())
      .map((p) => p.y)
      .reduce(
        (acc, x) => [Math.min(acc[0], x), Math.max(acc[1], x)],
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

  print(mapper: (elem: T) => string): void {
    const W = this.width();
    const H = this.height();
    const minX = this.minX();
    const minY = this.minY();
    console.log(`Grid: ${W}x${H}`);
    for (let y = 0; y < H; y++) {
      let line = "";
      for (let x = 0; x < W; x++) {
        if (this._data.has(Point({ x: x + minX, y: y + minY }))) {
          line += mapper(this._data.get(Point({ x: x + minX, y: y + minY }))!);
        } else {
          line += " ";
        }
      }
      console.log(line);
    }
  }
}
