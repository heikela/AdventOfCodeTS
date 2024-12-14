import { getInput, getTestBlock } from "../inputs.ts";

import * as Utils from "../utils.ts";

import { Map, Record, RecordOf } from "immutable";

const input = await getInput(2024, 9);
//const input = "2333133121414131402";

/*
type span = {
  len: number;
  id: number;
};

let spans: span[] = [];
for (let i = 0; i < input.length; i++) {
  const len = parseInt(input[i]);
  const id = i % 2 == 0 ? i / 2 : -1;
  spans.push({ len, id });
}

let compactedSpans: span[] = [];
let toMove = spans.length - 1;
while (spans[toMove].id == -1) {
  toMove--;
}

while (toMove > 0) {
  const spanToMove = spans[toMove];
  let emptyIndex = 0;
  while ((emptyIndex < toMove && spans[emptyIndex].id != -1) || spans[emptyIndex].len < spanToMove.len) {
    emptyIndex++;
  }
  if (emptyIndex == toMove) {
    toMove--;
    continue
  }
  const emptySpan = spans[emptyIndex];
  spans[emptyIndex] = spanToMove;
  expanded[toMove] = destination;
  while (expanded[empty] != -1) {
    empty++;
  }
  while (expanded[toMove] == -1) {
    toMove--;
  }
  //  console.log(`empty: ${empty}, toMove: ${toMove}`);
}
  */

let expanded: number[] = [];
for (let i = 0; i < input.length; i++) {
  const len = parseInt(input[i]);
  let item: number = -1;
  if (i % 2 == 0) {
    item = i / 2;
  }
  for (let j = 0; j < len; j++) {
    expanded.push(item);
  }
}

//console.log("expanded");

let toMoveEnd = expanded.length - 1;
while (expanded[toMoveEnd] == -1) {
  toMoveEnd--;
}

while (toMoveEnd > 0) {
  //  console.log("toMoveEnd", toMoveEnd);
  const value = expanded[toMoveEnd];
  let toMoveStart = toMoveEnd;
  while (toMoveStart > 0 && expanded[toMoveStart - 1] == value) {
    toMoveStart--;
  }
  const len = toMoveEnd - toMoveStart + 1;
  let emptyStart = 0;
  let found = false;
  while (emptyStart < toMoveStart && !found) {
    if (expanded[emptyStart] == -1) {
      let tooShort = false;
      for (let i = 0; i < len; i++) {
        if (expanded[emptyStart + i] != -1) {
          tooShort = true;
          break;
        }
      }
      if (!tooShort) {
        found = true;
      }
    }
    if (!found) {
      emptyStart++;
    }
  }
  if (found) {
    for (let i = 0; i < len; i++) {
      expanded[emptyStart + i] = value;
      expanded[toMoveStart + i] = -1;
    }
  }
  toMoveEnd = toMoveStart - 1;
  while (expanded[toMoveEnd] == -1) {
    toMoveEnd--;
  }
}

//console.log("compacted", expanded);

let checksum = 0;
for (let i = 0; i < expanded.length; i++) {
  if (expanded[i] == -1) {
    continue;
  }
  checksum += expanded[i] * i;
}

console.log(`${checksum}`);
