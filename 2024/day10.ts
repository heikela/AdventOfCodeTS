import { getInput, getTestBlock } from "../inputs.ts";

import * as Utils from "../utils.ts";

import { Map, Set, Record, RecordOf } from "immutable";

//const input = await getInput(2024, 10);
const input = await getTestBlock(2024, 10, 4);

const lines = Utils.lines(input);

type PointProps = { x: number; y: number };
const Point = Record({ x: 0, y: 0 });
type Point = RecordOf<PointProps>;

let W = 0;
let H = 0;

let heights = Map<Point, number>();

lines.map((line, y) => {
  line.split("").map((char, x) => {
    const height = parseInt(char);
    heights = heights.set(Point({ x, y }), height);
    W = Math.max(W, x);
  });
  H = Math.max(H, y);
});

W = W + 1;
H = H + 1;

let scoreSum = 0;

for (let y = 0; y < H; y++) {
  for (let x = 0; x < W; x++) {
    const startHeight = heights.get(Point({ x, y }))!;
    if (startHeight != 0) {
      continue;
    }
    let ends = Set<Point>();
    let visited = Set<Point>();
    let frontier = Set<Point>();
    frontier = frontier.add(Point({ x, y }));
    let height = 0;
    while (frontier.size > 0) {
      let next = Set<Point>();
      for (const p of frontier) {
        if (visited.has(p)) {
          continue;
        }
        visited = visited.add(p);
        if (heights.has(p) && heights.get(p)! == 9) {
          ends = ends.add(p);
          continue;
        }
        for (const dir of [
          Point({ x: 0, y: -1 }),
          Point({ x: 1, y: 0 }),
          Point({ x: 0, y: 1 }),
          Point({ x: -1, y: 0 }),
        ]) {
          const np = Point({ x: p.x + dir.x, y: p.y + dir.y });
          if (visited.has(np)) {
            continue;
          }
          if (heights.has(np) && heights.get(np)! == height + 1) {
            next = next.add(np);
          }
        }
      }
      frontier = next;
      height++;
    }
    scoreSum += ends.size;
  }
}

console.log(`${scoreSum}`);

scoreSum = 0;

for (let y = 0; y < H; y++) {
  for (let x = 0; x < W; x++) {
    const startHeight = heights.get(Point({ x, y }))!;
    if (startHeight != 0) {
      continue;
    }
    let score = 0;
    let frontier = Map<Point, number>();
    frontier = frontier.set(Point({ x, y }), 1);
    let height = 0;
    while (frontier.size > 0) {
      let next = Map<Point, number>();
      for (const [p, n] of frontier) {
        if (heights.has(p) && heights.get(p)! == 9) {
          score += n;
          continue;
        }
        for (const dir of [
          Point({ x: 0, y: -1 }),
          Point({ x: 1, y: 0 }),
          Point({ x: 0, y: 1 }),
          Point({ x: -1, y: 0 }),
        ]) {
          const np = Point({ x: p.x + dir.x, y: p.y + dir.y });
          if (heights.has(np) && heights.get(np)! == height + 1) {
            if (next.has(np)) {
              next = next.set(np, next.get(np)! + n);
            } else {
              next = next.set(np, n);
            }
          }
        }
      }
      frontier = next;
      height++;
    }
    scoreSum += score;
  }
}

console.log(`${scoreSum}`);
