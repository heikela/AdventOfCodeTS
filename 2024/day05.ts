import { getInput } from "../inputs.ts";
import * as Utils from "../utils.ts";

const input = await getInput(2024, 5);

const lines = Utils.lines(input);

const gap = lines.findIndex((line) => line === "");

const rules = lines.slice(0, gap);
const pages = lines.slice(gap + 1);

let precedence = new Map<number, Set<number>>();
rules.map((rule) => {
  const parts = rule.split("|");
  const [key, value] = parts.map((s) => parseInt(s));
  if (precedence.has(key)) {
    precedence.set(key, precedence.get(key)!.add(value));
  } else {
    const newSet = new Set<number>();
    newSet.add(value);
    precedence.set(key, newSet);
  }
});

const updates = pages.map((update) =>
  update.split(",").map((page) => parseInt(page))
);

function middlePage(list: number[]): number {
  if (list.length % 2 != 1) {
    throw new Error("List must have an odd number of elements");
  }
  const middle = Math.floor(list.length / 2);
  return list[middle];
}

function isUpdateCorrect(update: number[]): boolean {
  let previousPages = new Set<number>();
  for (const page of update) {
    if (precedence.has(page)) {
      const forbidden = precedence.get(page)!;
      for (const forbiddenPage of forbidden) {
        if (previousPages.has(forbiddenPage)) {
          return false;
        }
      }
    }
    previousPages.add(page);
  }
  return true;
}

const correctUpdates = updates.filter(isUpdateCorrect);

const result = correctUpdates.map(middlePage).reduce((acc, x) => acc + x, 0);

console.log(result);

function fixOrder(update: number[]): number[] {
  let result: number[] = [];
  let reversePages = new Set<number>();
  const remainingPages = new Set<number>();
  for (const page of update) {
    remainingPages.add(page);
  }
  while (remainingPages.size > 0) {
    const legalPages = Array.from(remainingPages).filter((candidatePage) => {
      for (const remainingPage of remainingPages) {
        if (
          precedence.has(remainingPage) &&
          precedence.get(remainingPage)!.has(candidatePage)
        ) {
          return false;
        }
      }
      return true;
    });
    for (const page of legalPages) {
      remainingPages.delete(page);
      reversePages.add(page);
      result.push(page);
    }
  }
  return result;
}

const incorrectUpdates = updates.filter((update) => !isUpdateCorrect(update));

const fixedUpdates = incorrectUpdates.map(fixOrder);

for (const update of fixedUpdates) {
  if (!isUpdateCorrect(update)) {
    throw new Error(`Update is still incorrect: ${update}`);
  }
}

const result2 = fixedUpdates.map(middlePage).reduce((acc, x) => acc + x, 0);

console.log(result2);
