import { Map, Record, RecordOf } from "immutable";
import { getInput } from "../inputs.ts";
import * as Utils from "../utils.ts";

const input = await getInput(2024, 4);

const lines = Utils.lines(input);

type PointProps = { x: number; y: number };
const Point = Record({ x: 0, y: 0 });
type Point = RecordOf<PointProps>;

function addPoints(a: Point, b: Point): Point {
  return Point({ x: a.x + b.x, y: a.y + b.y });
}

const directions = [
  Point({ x: 0, y: -1 }),
  Point({ x: 1, y: 0 }),
  Point({ x: 0, y: 1 }),
  Point({ x: -1, y: 0 }),
  Point({ x: -1, y: -1 }),
  Point({ x: 1, y: -1 }),
  Point({ x: 1, y: 1 }),
  Point({ x: -1, y: 1 }),
];

let letters = Map<Point, string>();

lines.map((line, y) => {
  line.split("").map((char, x) => {
    letters = letters.set(Point({ x, y }), char);
  });
});

const H =
  Array.from(letters.keys())
    .map((p) => p.y)
    .reduce((acc, x) => Math.max(acc, x), 0) + 1;
const W =
  Array.from(letters.keys())
    .map((p) => p.x)
    .reduce((acc, x) => Math.max(acc, x), 0) + 1;

function getWord(start: Point, dir: Point, len: number = 4): string {
  let result = "";
  let p = start;
  let dist = 0;
  while (letters.has(p) && dist < len) {
    result += letters.get(p)!;
    p = addPoints(p, dir);
    dist++;
  }
  return result;
}
const result = Utils.range(0, H)
  .flatMap((y) =>
    Utils.range(0, W).flatMap((x) =>
      directions.map((dir) => {
        const word = getWord(Point({ x, y }), dir);
        return word == "XMAS" ? 1 : 0;
      })
    )
  )
  .reduce<number>((acc, x) => acc + x, 0);

console.log(result);

function detectCrossMas(p: Point): boolean {
  const topLeftWord = getWord(
    addPoints(p, Point({ x: -1, y: -1 })),
    Point({ x: 1, y: 1 }),
    3
  );
  const topRightWord = getWord(
    addPoints(p, Point({ x: 1, y: -1 })),
    Point({ x: -1, y: 1 }),
    3
  );
  if (topLeftWord != "MAS" && topLeftWord != "SAM") {
    return false;
  }
  if (topRightWord != "MAS" && topRightWord != "SAM") {
    return false;
  }
  return true;
}

const result2 = Utils.range(0, H)
  .flatMap((y) =>
    Utils.range(0, W).map((x) => {
      const p = Point({ x, y });
      return detectCrossMas(p) ? 1 : 0;
    })
  )
  .reduce<number>((acc, x) => acc + x, 0);

console.log(result2);
