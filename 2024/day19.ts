import { getInput, getTestBlock } from "../inputs.ts";
import * as Utils from "../utils.ts";

import { Map } from "immutable";

let lines = Utils.lines(await getInput(2024, 19));
//lines = Utils.lines(await getTestBlock(2024, 19));

let towels = lines[0].trim().split(", ");

let designIsPossible = Map<string, boolean>();

let designs = lines.slice(2);

function isPossible(design: string): boolean {
  if (designIsPossible.has(design)) {
    return designIsPossible.get(design)!;
  }
  if (design === "") {
    designIsPossible = designIsPossible.set(design, true);
    return true;
  }
  for (let towel of towels) {
    if (design.substring(0, towel.length) === towel) {
      let rest = design.substring(towel.length);
      if (isPossible(rest)) {
        designIsPossible = designIsPossible.set(design, true);
        return true;
      }
    }
  }
  designIsPossible = designIsPossible.set(design, false);
  return false;
}

let approachCount = Map<string, number>();

function countApproaches(design: string): number {
  if (approachCount.has(design)) {
    return approachCount.get(design)!;
  }
  if (design === "") {
    approachCount = approachCount.set(design, 1);
    return 1;
  }
  let count = 0;
  for (let towel of towels) {
    if (design.substring(0, towel.length) === towel) {
      let rest = design.substring(towel.length);
      if (isPossible(rest)) {
        count += countApproaches(rest);
      }
    }
  }
  approachCount = approachCount.set(design, count);
  return count;
}

console.log(designs.filter(isPossible).length);
console.log(designs.map(countApproaches).reduce((a, b) => a + b));
