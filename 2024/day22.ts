import { getInput, getTestBlock } from "../inputs.ts";
import * as Utils from "../utils.ts";

import { Map, Set, Seq, List } from "immutable";

let lines = Utils.lines(await getInput(2024, 22));
lines = Utils.lines(await getTestBlock(2024, 22, 5));

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
  let orderedPositions = Map<number, List<number>>();
  for (let delta = -9; delta <= 9; ++delta) {
    orderedPositions = orderedPositions.set(delta, List<number>());
  }
  for (let i = 0; i < changes.length; ++i) {
    let change = changes[i];
    orderedPositions = orderedPositions.set(
      change,
      orderedPositions.get(change)!.push(i)
    );
  }
  let unOrderedPositions = orderedPositions.mapEntries(([delta, positions]) => {
    return [delta, Set(positions)];
  });
  for (let instruction of instructions) {
    for (let startIdx of orderedPositions.get(instruction.get(0)!)!) {
      if (
        unOrderedPositions.get(instruction.get(1)!)!.has(startIdx + 1) &&
        unOrderedPositions.get(instruction.get(2)!)!.has(startIdx + 2) &&
        unOrderedPositions.get(instruction.get(3)!)!.has(startIdx + 3)
      ) {
        proceeds = proceeds.set(
          instruction,
          proceeds.get(instruction)! + values[startIdx + 3]
        );
        if (instruction.equals(exampleInstr)) {
          console.log(
            `Example instruction ${instruction} found at index ${startIdx} leading to ${
              values[startIdx + 3]
            } bananas)`
          );
        }
        break;
      }
    }
  }
}

const [bestInstr, bestValue] = Seq(proceeds.entries()).maxBy(([k, v]) => v)!;
console.log(
  `Example instruction ${exampleInstr} leads to ${proceeds.get(
    exampleInstr
  )!} bananas)`
);

console.log(`Best instruction ${bestInstr} leads to ${bestValue} bananas)`);
