import { getInput, getTestBlock } from "../inputs.ts";

import * as Utils from "../utils.ts";

import { Point, addPoints } from "../point2d.ts";

const lines = Utils.lines(await getInput(2024, 13));
//const lines = Utils.lines(await getTestBlock(2024, 13, 0));

type Machine = {
  aDir: Point;
  bDir: Point;
  prizePos: Point;
};

let machines: Machine[] = [];

function parsePoint(s: string): Point {
  const [_, coords, ...rest] = s.split(":");
  const [x, y] = coords.split(",").map((x) => parseInt(x.trim().substring(2)));
  return Point({ x, y });
}

for (let l = 0; l < lines.length; l += 4) {
  const aDir = parsePoint(lines[l]);
  const bDir = parsePoint(lines[l + 1]);
  const prizePos = parsePoint(lines[l + 2]);
  machines.push({ aDir, bDir, prizePos });
}

function solve(machine: Machine): number {
  const aDir = machine.aDir;
  const bDir = machine.bDir;
  const prizePos = machine.prizePos;

  let startPos = Point({ x: 0, y: 0 });
  let rowStartPos = startPos;

  for (let a = 0; a <= 100; ++a) {
    let pos = rowStartPos;
    for (let b = 0; b <= 100; ++b) {
      if (pos.equals(prizePos)) {
        return 3 * a + b;
      }
      pos = addPoints(pos, bDir);
    }
    rowStartPos = addPoints(rowStartPos, aDir);
  }
  return 0;
}

function mulVec(vec: number[], scalar: number): number[] {
  return vec.map((x) => x * scalar);
}

function addVec(a: number[], b: number[]): number[] {
  return a.map((x, i) => x + b[i]);
}

function solve2(machine: Machine): number {
  // This is a linear equation group
  // adir.x * a + bdir.x * b = prizePos.x
  // adir.y * a + bdir.y * b = prizePos.y

  let aDir = machine.aDir;
  let bDir = machine.bDir;
  let pos = addPoints(
    machine.prizePos,
    Point({ x: 10000000000000, y: 10000000000000 })
  );

  let row1 = [aDir.x, bDir.x, pos.x];
  let row2 = [aDir.y, bDir.y, pos.y];

  if (aDir.x === 0) {
    [row1, row2] = [row2, row1];
  }

  // console.log("Starting elimination");
  // console.log(row1);
  // console.log(row2);

  const factor1 = -row2[0] / row1[0];
  row2 = addVec(row2, mulVec(row1, factor1));

  // console.log("-----");
  // console.log(row1);
  // console.log(row2);

  if (row2[1] === 0) {
    return 0;
  }
  if (row1[0] === 0) {
    return 0;
  }

  row2 = mulVec(row2, 1 / row2[1]);

  // console.log("-----");
  // console.log(row1);
  // console.log(row2);

  row1 = addVec(row1, mulVec(row2, -row1[1]));

  // console.log("-----");
  // console.log(row1);
  // console.log(row2);

  row1 = mulVec(row1, 1 / row1[0]);

  // console.log("-----");
  // console.log(row1);
  // console.log(row2);

  const [a, b] = [Math.round(row1[2]), Math.round(row2[2])];

  if (a * aDir.x + b * bDir.x !== pos.x) {
    return 0;
  }
  if (a * aDir.y + b * bDir.y !== pos.y) {
    return 0;
  }

  return 3 * a + b;
}

let cost1 = 0;
let cost2 = 0;
for (let machine of machines) {
  cost1 += solve(machine);
  cost2 += solve2(machine);
}

console.log(`${cost1}`);
console.log(`${cost2}`);
