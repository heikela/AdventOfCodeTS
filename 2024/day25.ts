import { getInput, getTestBlock } from "../inputs.ts";
import * as Utils from "../utils.ts";
import { Grid } from "../grid.ts";
import { Point } from "../point2d.ts";

let input = await getInput(2024, 25);
//input = await getTestBlock(2024, 25);
const lines = Utils.lines(input);

let locks: Grid<string>[] = [];
let keys: Grid<string>[] = [];

let currentLine = 0;
while (currentLine < lines.length) {
  let nextEmptyLine = lines.indexOf("", currentLine);
  if (nextEmptyLine === -1) {
    nextEmptyLine = lines.length;
  }
  let block = lines.slice(currentLine, nextEmptyLine);
  const lockOrKey = Grid.fromLines(block);
  if (lockOrKey.get(Point({ x: 0, y: 0 })) === ".") {
    keys.push(lockOrKey);
  } else {
    locks.push(lockOrKey);
  }

  currentLine = nextEmptyLine + 1;
}

console.log(
  `${locks.length} locks, ${keys.length} keys, naively ${
    locks.length * keys.length * 7 * 6
  } comparisons`
);

let matches = 0;

for (let lock of locks) {
  for (let key of keys) {
    let failed = false;
    for (let y = 1; y < 6 && !failed; y++) {
      for (let x = 0; x < 5 && !failed; x++) {
        if (
          lock.get(Point({ x, y })) == "#" &&
          key.get(Point({ x, y })) == "#"
        ) {
          failed = true;
        }
      }
    }
    if (!failed) {
      matches++;
    }
  }
}

console.log(matches);
