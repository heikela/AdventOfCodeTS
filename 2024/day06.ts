import { getInput } from "../inputs.ts";
import * as Utils from "../utils.ts";
import { Map, Set, Record, RecordOf } from "immutable";

const input = await getInput(2024, 6);
const lines = Utils.lines(input);

type PointProps = { x: number; y: number };
const Point = Record({ x: 0, y: 0 });
type Point = RecordOf<PointProps>;

function addPoints(a: Point, b: Point): Point {
  return Point({ x: a.x + b.x, y: a.y + b.y });
}

function negate(p: Point): Point {
  return Point({ x: -p.x, y: -p.y });
}

const directions = [
  Point({ x: 0, y: -1 }),
  Point({ x: 1, y: 0 }),
  Point({ x: 0, y: 1 }),
  Point({ x: -1, y: 0 }),
];

let letters = Map<Point, string>();

let start = Point({ x: 0, y: 0 });
let dirIndex = 0;

lines.map((line, y) => {
  line.split("").map((char, x) => {
    letters = letters.set(Point({ x, y }), char);
    if (char === "^") {
      start = Point({ x, y });
    }
  });
});

let pos = start;

const H =
  Array.from(letters.keys())
    .map((p) => p.y)
    .reduce((acc, x) => Math.max(acc, x), 0) + 1;
const W =
  Array.from(letters.keys())
    .map((p) => p.x)
    .reduce((acc, x) => Math.max(acc, x), 0) + 1;

let visited = Set<Point>();

visited = visited.add(pos);

function blocked(p: Point, area: Map<Point, string>): boolean {
  return area.has(p) && area.get(p) === "#";
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

function turnRight(direction: Point): Point {
  return directions[(dirNumber(direction) + 1) % directions.length];
}

function dirNumber(dirVector: Point): number {
  return directions.findIndex((d) => d.equals(dirVector));
}

function currentDirection(): Point {
  return directions[dirIndex];
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
    //    console.log(`Not on original path, skipping`);
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
    //    console.log(`Loop detected after ${steps} steps`);
    return true;
  } else {
    //    console.log(`Escaped after ${steps} steps`);
    return false;
  }
}

let result = 0;
for (let y = 0; y < H; y++) {
  for (let x = 0; x < W; x++) {
    const original = letters.get(Point({ x, y }));
    if (original == "#" || original == "^") {
      continue;
    }
    if (getsStuck(start, Point({ x, y }))) {
      result++;
    }
  }
  console.log(`Row ${y} done`);
}

console.log(result);
