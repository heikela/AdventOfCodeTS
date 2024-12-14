import { getInput, getTestBlock } from "../inputs.ts";
import * as Utils from "../utils.ts";
import { Map, List } from "immutable";

const input = await getInput(2024, 11);
//const input = await getTestBlock(2024, 11, 1);

const originalNumbers = input
  .trim()
  .split(" ")
  .map((x) => parseInt(x));
let numbers = originalNumbers;

function transformStone(n: number): number[] {
  if (n === 0) {
    return [1];
  }
  const asString = `${n}`;
  if (asString.length % 2 == 0) {
    const half = asString.length / 2;
    const firstHalf = parseInt(asString.slice(0, half));
    const secondHalf = parseInt(asString.slice(half));
    return [firstHalf, secondHalf];
  }
  return [2024 * n];
}

for (let i = 0; i < 25; ++i) {
  numbers = numbers.flatMap(transformStone);
}

console.log(numbers.length);

let memo = Map<List<number>, number>();

function countTransformedLength(n: number, blinks: number): number {
  if (blinks === 0) {
    return 1;
  }
  if (memo.has(List([n, blinks]))) {
    return memo.get(List([n, blinks]))!;
  }
  const next = transformStone(n);
  let result = 0;
  for (const x of next) {
    result += countTransformedLength(x, blinks - 1);
  }
  memo = memo.set(List([n, blinks]), result);
  return result;
}

let result = 0;
for (const n of originalNumbers) {
  result += countTransformedLength(n, 75);
}

console.log(result);
