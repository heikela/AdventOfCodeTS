import { getInput, getTestBlock } from "../inputs.ts";
import * as Utils from "../utils.ts";
import { Point, addPoints, orthogonalNeighbours } from "../point2d.ts";
import { Set, Map, Seq } from "immutable";
import { Grid } from "../grid.ts";

let lines = Utils.lines(await getInput(2024, 20));
//lines = Utils.lines(await getTestBlock(2024, 20));

const maze = Grid.fromLines(lines);
const start = Seq(maze.keys()).find((p) => maze.get(p) === "S")!;
const end = Seq(maze.keys()).find((p) => maze.get(p) === "E")!;

let stepsToFinish = Map<Point, number>();

function isOK(p: Point, maze: Grid<string>): boolean {
  return maze.getOrElse(p, "#") !== "#";
}

console.log(`${start} -> ${end}`);

function findPath(start: Point, end: Point, maze: Grid<string>): number {
  let queue = Set<Point>([end]);
  let visited = Set<Point>();
  let steps = 0;
  while (queue.size > 0) {
    let nextQueue = Set<Point>();
    for (const p of queue) {
      if (visited.has(p)) {
        continue;
      }
      visited = visited.add(p);
      stepsToFinish = stepsToFinish.set(p, steps);
      if (p.equals(start)) {
        return steps;
      }
      for (const dir of orthogonalNeighbours) {
        let next = addPoints(dir, p);
        if (isOK(next, maze) && !visited.has(next)) {
          nextQueue = nextQueue.add(next);
        }
      }
    }
    queue = nextQueue;
    steps++;
  }
  return -1;
}

findPath(start, end, maze);
console.log(stepsToFinish.get(end)!);
console.log(stepsToFinish.size);
for (const [p, steps] of stepsToFinish) {
  console.log(`${p} -> ${steps}`);
}

let bigSkips = 0;
for (const [skipStart, costAtSkipStart] of stepsToFinish) {
  let possibleFinishes = Set<Point>();
  let possiblePositions = Set<Point>([skipStart]);
  let visited = Set<Point>();
  const cheatLength = 20;
  for (let cheatStep = 0; cheatStep < cheatLength; ++cheatStep) {
    let nextPossiblePositions = Set<Point>();
    for (const current of possiblePositions) {
      for (const dir of orthogonalNeighbours) {
        let next = addPoints(dir, current);
        if (visited.has(next)) {
          continue;
        }
        visited = visited.add(next);
        if (maze.has(next)) {
          nextPossiblePositions = nextPossiblePositions.add(next);
          if (stepsToFinish.has(next)) {
            let saved = stepsToFinish.get(next)! - costAtSkipStart - cheatStep;
            if (saved >= 100) {
              bigSkips++;
            }
          }
        }
      }
    }
    possiblePositions = nextPossiblePositions;
  }
}

console.log(bigSkips);
