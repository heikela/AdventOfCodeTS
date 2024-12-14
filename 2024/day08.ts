import { getInput, getTestBlock } from "../inputs.ts";
import * as Utils from "../utils.ts";
import { Map, Set } from "immutable";
import { Point, addPoints, subtractPoints } from "../point2d.ts";

const input = await getInput(2024, 8);
// const input = await getTestBlock(2024, 8);

const lines = Utils.lines(input);

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
let antiNodes2 = Set<Point>();

for (const [antenna, points] of antennae) {
  for (let i = 0; i < points.length; i++) {
    for (let j = 0; j < points.length; j++) {
      if (i == j) {
        continue;
      }
      const vector = subtractPoints(points[j], points[i]);
      let antiNode = points[j];
      let steps = 0;
      while (
        antiNode.x >= 0 &&
        antiNode.y >= 0 &&
        antiNode.x < W &&
        antiNode.y < H
      ) {
        antiNodes2 = antiNodes2.add(antiNode);
        if (steps == 1) {
          antiNodes = antiNodes.add(antiNode);
        }
        antiNode = addPoints(antiNode, vector);
        steps++;
      }
    }
  }
}

console.log(`${antiNodes.size}`);
console.log(`${antiNodes2.size}`);
