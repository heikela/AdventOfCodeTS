import { getInput } from "../inputs.ts";
import * as Utils from "../utils.ts";
import { Map, Seq, Set } from "immutable";
import { Grid } from "../grid.ts";

import { Point, addPoints, orthogonalNeighbours } from "../point2d.ts";

const input = await getInput(2024, 6);
const lines = Utils.lines(input);

const directions = orthogonalNeighbours;

let letters = Grid.fromLines(lines);

let start = Seq(letters.keys()).find((p) => letters.getOrElse(p, "") == "^")!;
let dirIndex = 0;

let pos = start;

const H = letters.height();
const W = letters.width();

let visited = Set<Point>();

visited = visited.add(pos);

function blocked(p: Point, area: Grid<string>): boolean {
  return area.getOrElse(p, "") === "#";
}

function nextDirection(): Point {
  dirIndex = (dirIndex + 1) % directions.length;
  return directions[dirIndex];
}

function resetDirection() {
  dirIndex = 0;
}

function nextPosition(pos: Point): Point {
  return addPoints(pos, directions[dirIndex]);
}

let originalPath = Map<Point, Set<number>>();

while (letters.has(pos)) {
  visited = visited.add(pos);
  originalPath = originalPath.set(
    pos,
    originalPath.get(pos)?.add(dirIndex) ?? Set([dirIndex])
  );
  while (blocked(nextPosition(pos), letters)) {
    nextDirection();
  }
  pos = nextPosition(pos);
}

console.log(visited.size);

function getsStuck(start: Point, newBlock: Point): boolean {
  let visited = Map<Point, Set<number>>();
  let currentPos = start;
  resetDirection();
  let steps = 0;

  if (!originalPath.has(newBlock)) {
    return false;
  }

  const area = letters.set(newBlock, "#");

  while (
    area.has(currentPos) &&
    !(visited.has(currentPos) && visited.get(currentPos)!.has(dirIndex))
  ) {
    visited = visited.set(
      currentPos,
      visited.get(currentPos)?.add(dirIndex) ?? Set([dirIndex])
    );
    while (blocked(nextPosition(currentPos), area)) {
      nextDirection();
    }
    currentPos = nextPosition(currentPos);
    steps++;
  }
  if (area.has(currentPos)) {
    return true;
  } else {
    return false;
  }
}

let result = 0;
for (const [p, original] of letters.entries()) {
  if (original == "#" || original == "^") {
    continue;
  }
  if (getsStuck(start, p)) {
    result++;
  }
}

console.log(result);
