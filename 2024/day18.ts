import { getInput, getTestBlock } from "../inputs.ts";
import * as Utils from "../utils.ts";
import { Point, addPoints, orthogonalNeighbours } from "../point2d.ts";
import { Set } from "immutable";
import { Grid } from "../grid.ts";

let lines = Utils.lines(await getInput(2024, 18));
let W = 71;
let H = 71;
let Max = 1024;
//lines = Utils.lines(await getTestBlock(2024, 18));
// W = 7;
// H = 7;
// Max = 12;

function isOK(p: Point, obstacles: Set<Point>): boolean {
  return p.x >= 0 && p.y >= 0 && p.x < W && p.y < H && !obstacles.has(p);
}

let start: Point = Point({ x: 0, y: 0 });
let end: Point = Point({ x: W - 1, y: H - 1 });

function findPath(start: Point, end: Point, obstacleCount: number = 1024) {
  let obstacles = Set<Point>();
  for (let i = 0; i < lines.length && i < obstacleCount; ++i) {
    const line = lines[i];
    let [x, y] = line.split(",").map((x) => parseInt(x));
    obstacles = obstacles.add(Point({ x, y }));
  }

  let queue = Set<Point>([start]);
  let visited = Set<Point>();
  let steps = 0;
  while (queue.size > 0) {
    let nextQueue = Set<Point>();
    for (const p of queue) {
      if (p.equals(end)) {
        return steps;
      }
      visited = visited.add(p);
      for (const dir of orthogonalNeighbours) {
        let n = addPoints(dir, p);
        if (isOK(n, obstacles) && !visited.has(n)) {
          nextQueue = nextQueue.add(n);
        }
      }
    }
    queue = nextQueue;
    steps++;
  }
  return -1;
}

// const grid = Grid.fromSet<string>(obstacles, "#");
// grid.print((x) => x);

console.log(findPath(start, end));

let max = lines.length;
let min = 0;

while (max - min > 1) {
  let mid = Math.floor((max + min) / 2);
  if (findPath(start, end, mid) >= 0) {
    min = mid;
  } else {
    max = mid;
  }
}

console.log(min);
console.log(findPath(start, end, max));
console.log(lines[min]);
console.log(max);
console.log(findPath(start, end, max));
console.log(lines[max]);
