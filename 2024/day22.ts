import { getInput, getTestBlock } from "../inputs.ts";
import * as Utils from "../utils.ts";

import { Map, Set, Seq, List } from "immutable";

let lines = Utils.lines(await getInput(2024, 22));
//lines = Utils.lines(await getTestBlock(2024, 22, 5));

const initials = lines.map((line) => BigInt(parseInt(line)));

const mod = 16777216n;
function nextNumber(n: bigint): bigint {
  n = ((n * 64n) ^ n) % mod;
  n = ((n >> 5n) ^ n) % mod;
  n = ((n * 2048n) ^ n) % mod;
  return n;
}

function oneDay(n: bigint): bigint {
  for (let i = 0; i < 2000; ++i) {
    n = nextNumber(n);
  }
  return n;
}

function oneDayChanges(n: bigint): number[] {
  let result = [];
  for (let i = 0; i < 2000; ++i) {
    let next = nextNumber(n);
    result.push(Number((next % 10n) - (n % 10n)));
    n = next;
  }
  return result;
}

function oneDayValues(n: bigint): number[] {
  let result = [];
  for (let i = 0; i < 2000; ++i) {
    let next = nextNumber(n);
    result.push(Number(next % 10n));
    n = next;
  }
  return result;
}

let result = initials.map(oneDay).reduce((a, b) => a + b);
console.log(result);

let instructions = List<List<number>>();

for (let a = -9; a <= 9; ++a) {
  for (let b = -9; b <= 9; ++b) {
    for (let c = -9; c <= 9; ++c) {
      for (let d = -9; d <= 9; ++d) {
        let instruction = List([a, b, c, d]);
        instructions = instructions.push(instruction);
      }
    }
  }
}

let proceeds = Map<List<number>, number>();
for (let instruction of instructions) {
  proceeds = proceeds.set(instruction, 0);
}

const exampleInstr = List([-2, 1, -1, 3]);

for (let initial of initials) {
  let n = initial;
  let changes = oneDayChanges(n);
  let values = oneDayValues(n);
  let alreadySeen = Set<List<number>>();
  for (let idx = 3; idx < changes.length; ++idx) {
    let instruction = List([
      changes[idx - 3],
      changes[idx - 2],
      changes[idx - 1],
      changes[idx],
    ]);
    if (alreadySeen.has(instruction)) {
      continue;
    }
    alreadySeen = alreadySeen.add(instruction);
    proceeds = proceeds.set(
      instruction,
      proceeds.get(instruction)! + values[idx]
    );
    // if (instruction.equals(exampleInstr)) {
    //   console.log(
    //     `Example instruction ${instruction} found ending at index ${idx} leading to ${values[idx]} bananas)`
    //   );
    // }
  }
}

const [bestInstr, bestValue] = Seq(proceeds.entries()).maxBy(([k, v]) => v)!;
console.log(
  `Example instruction ${exampleInstr} leads to ${proceeds.get(
    exampleInstr
  )!} bananas)`
);

console.log(`Best instruction ${bestInstr} leads to ${bestValue} bananas)`);
