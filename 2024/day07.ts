import { getInput } from "../inputs.ts";

import * as Utils from "../utils.ts";

const input = await getInput(2024, 7);
const lines = Utils.lines(input);
type equation = {
  result: number;
  factors: number[];
};

function parseEquation(line: string): equation {
  const [result, factors] = line.split(":");
  return {
    result: parseInt(result),
    factors: factors
      .trim()
      .split(" ")
      .map((x) => parseInt(x)),
  };
}

const equations = lines.map(parseEquation);

function canBeRight(equation: equation): boolean {
  let remainingFactors = equation.factors.slice(1);
  let possibleValues = new Set<number>([equation.factors[0]]);
  while (remainingFactors.length > 0) {
    const factor = remainingFactors.shift()!;
    let newValues = new Set<number>();
    for (const value of possibleValues) {
      newValues.add(value + factor);
      newValues.add(value * factor);
      newValues.add(parseInt(`${value}${factor}`));
    }
    possibleValues = newValues;
  }
  return possibleValues.has(equation.result);
}

console.log(
  equations
    .filter(canBeRight)
    .map((eq) => eq.result)
    .reduce((acc, x) => acc + x, 0)
);
