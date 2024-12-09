import { getInput, getTestBlock } from "../inputs.ts";

import * as Utils from "../utils.ts";

import { Map, Record, RecordOf } from "immutable";

const input = await getInput(2024, 9);
//const input = "2333133121414131402";

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

let empty = 0;
let toMove = expanded.length - 1;
while (expanded[toMove] == -1) {
  toMove--;
}

while (expanded[empty] != -1) {
  empty++;
}

while (toMove > empty) {
  const value = expanded[toMove];
  const destination = expanded[empty];
  expanded[empty] = value;
  expanded[toMove] = destination;
  while (expanded[empty] != -1) {
    empty++;
  }
  while (expanded[toMove] == -1) {
    toMove--;
  }
  //  console.log(`empty: ${empty}, toMove: ${toMove}`);
}

//console.log("compacted", expanded);

let checksum = 0;
for (let i = 0; i <= toMove; i++) {
  checksum += expanded[i] * i;
}

console.log(`${checksum}`);
