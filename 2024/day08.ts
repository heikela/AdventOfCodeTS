import { getInput, getTestBlock } from "../inputs.ts";
import * as Utils from "../utils.ts";
import { Record, RecordOf, Map, Set } from "immutable";

const input = await getInput(2024, 8);
//const input = await getTestBlock(2024, 8);

const lines = Utils.lines(input);

type PointProps = { x: number; y: number };
const Point = Record({ x: 0, y: 0 });
type Point = RecordOf<PointProps>;

function addPoints(a: Point, b: Point): Point {
  return Point({ x: a.x + b.x, y: a.y + b.y });
}

function subtractPoints(a: Point, b: Point): Point {
  return Point({ x: a.x - b.x, y: a.y - b.y });
}

function negate(p: Point): Point {
  return Point({ x: -p.x, y: -p.y });
}

let antennae = Map<string, Point[]>();

let letters = Map<Point, string>();

lines.map((line, y) => {
  line.split("").map((char, x) => {
    letters = letters.set(Point({ x, y }), char);
    if (char != ".") {
      let entry: Point[] = antennae.has(char) ? antennae.get(char)! : [];
      entry.push(Point({ x, y }));
      antennae = antennae.set(char, entry);
    }
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

let antiNodes = Set<Point>();

for (const [antenna, points] of antennae) {
  console.log(`Processing ${points.length} antennae of type ${antenna}`);
  for (let i = 0; i < points.length; i++) {
    for (let j = 0; j < points.length; j++) {
      if (i == j) {
        continue;
      }
      const vector = subtractPoints(points[j], points[i]);
      let antiNode = points[i];
      while (
        antiNode.x >= 0 &&
        antiNode.y >= 0 &&
        antiNode.x < W &&
        antiNode.y < H
      ) {
        antiNodes = antiNodes.add(antiNode);
        antiNode = addPoints(antiNode, vector);
      }
    }
  }
}

console.log(`${antiNodes.size}`);
