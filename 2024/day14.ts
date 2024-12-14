import { getInput, getTestBlock } from "../inputs.ts";
import * as Utils from "../utils.ts";
import { Set, Record, RecordOf } from "immutable";

const input = await getInput(2024, 14);
const H = 103;
const W = 101;
const steps = 100;
// const input = await getTestBlock(2024, 14, 0);
// const H = 7;
// const W = 11;

const lines = Utils.lines(input);
const quadrantCounts = [0, 0, 0, 0];

function determineQuadrant(x: number, y: number): number {
  const midX = Math.floor(W / 2);
  const midY = Math.floor(H / 2);
  if (x < midX) {
    if (y < midY) {
      return 0;
    }
    if (y > midY) {
      return 1;
    }
  } else if (x > midX) {
    if (y < midY) {
      return 2;
    }
    if (y > midY) {
      return 3;
    }
  }
  return -1;
}

for (const line of lines) {
  const [ps, vs] = line.split(" ").map((x) => x.split("=")[1].trim());
  const [x, y] = ps.split(",").map((x) => parseInt(x));
  let [dx, dy] = vs.split(",").map((x) => parseInt(x));
  if (dy < 0) {
    dy += H;
  }
  if (dx < 0) {
    dx += W;
  }
  const finalX = (x + dx * steps) % W;
  const finalY = (y + dy * steps) % H;
  const quadrant = determineQuadrant(finalX, finalY);
  //  console.log(finalX, finalY, quadrant);
  if (quadrant !== -1) {
    quadrantCounts[quadrant]++;
  }
}

console.log(quadrantCounts);

console.log(quadrantCounts.reduce((a, b) => a * b, 1));

const positions = [];
const velocities = [];

for (const line of lines) {
  const [ps, vs] = line.split(" ").map((x) => x.split("=")[1].trim());
  const [x, y] = ps.split(",").map((x) => parseInt(x));
  let [dx, dy] = vs.split(",").map((x) => parseInt(x));
  if (dy < 0) {
    dy += H;
  }
  if (dx < 0) {
    dx += W;
  }
  positions.push([x, y]);
  velocities.push([dx, dy]);
}

type PointProps = { x: number; y: number };
const Point = Record({ x: 0, y: 0 });
type Point = RecordOf<PointProps>;

function countContiguousRegions(positions: Set<Point>): number {
  let regions = 0;
  let visited = Set<Point>();
  for (const p of positions) {
    if (visited.has(p)) {
      continue;
    }
    if (positions.has(p)) {
      regions++;
      let frontier = Set<Point>();
      frontier = frontier.add(p);
      while (frontier.size > 0) {
        let next = Set<Point>();
        for (const p of frontier) {
          if (visited.has(p)) {
            continue;
          }
          visited = visited.add(p);
          for (const dir of [
            Point({ x: 0, y: -1 }),
            Point({ x: 1, y: 0 }),
            Point({ x: 0, y: 1 }),
            Point({ x: -1, y: 0 }),
            Point({ x: 1, y: 1 }),
            Point({ x: -1, y: 1 }),
            Point({ x: 1, y: -1 }),
            Point({ x: -1, y: -1 }),
          ]) {
            const np = Point({ x: p.x + dir.x, y: p.y + dir.y });
            if (visited.has(np)) {
              continue;
            }
            if (positions.has(np)) {
              next = next.add(np);
            }
          }
        }
        frontier = next;
      }
    }
  }
  return regions;
}

let lowestRegions = positions.length + 1;
for (let t = 0; t < 100000; ++t) {
  const quadrantCounts = [0, 0, 0, 0];
  let finalPositions = Set<Point>();
  for (let i = 0; i < positions.length; ++i) {
    const [x, y] = positions[i];
    const [dx, dy] = velocities[i];
    const finalX = (x + dx * t) % W;
    const finalY = (y + dy * t) % H;
    finalPositions = finalPositions.add(Point({ x: finalX, y: finalY }));
  }
  const regions = countContiguousRegions(finalPositions);
  if (regions < lowestRegions) {
    lowestRegions = regions;
    console.log(`${t} : ${regions}`);
    for (let y = 0; y < H; y++) {
      let line = "";
      for (let x = 0; x < W; x++) {
        if (finalPositions.has(Point({ x, y }))) {
          line += "#";
        } else {
          line += ".";
        }
      }
      console.log(line);
    }
  }
}
