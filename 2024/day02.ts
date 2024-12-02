import { getInput } from "../inputs.ts";
import * as Utils from "../utils.ts";

const input = await getInput(2024, 2);

const lines = Utils.lines(input);
const numbers = lines.map((s) => Utils.words(s).map((x) => parseInt(x)));

type safetyReducerState = {
  unsafe: boolean;
  direction: "up" | "down" | "unknown";
  latest: number | null;
};

function safetyReducer(state: safetyReducerState, number: number) {
  if (state.unsafe) {
    return state;
  }
  if (state.direction === "unknown" && state.latest != null) {
    if (state.latest > number) {
      state.direction = "down";
    } else if (state.latest < number) {
      state.direction = "up";
    } else {
      state.unsafe = true;
    }
  }
  if (state.direction != "unknown") {
    let diff = number - state.latest!;
    if (state.direction === "down") {
      diff = -diff;
    }
    if (diff < 1 || diff > 3) {
      state.unsafe = true;
    }
  }
  return { ...state, latest: number };
}

function isSafe(numbers: number[], tolerance: number = 0) {
  const initialState: safetyReducerState = {
    unsafe: false,
    direction: "unknown",
    latest: null,
  };
  const result: safetyReducerState = numbers.reduce(
    safetyReducer,
    initialState
  );
  return !result.unsafe;
}

console.log(numbers.filter(isSafe).length);

function range(start: number, count: number): number[] {
  return Array.from({ length: count }, (_, i) => start + i);
}

function isSafeWithOmission(numbers: number[]) {
  return (
    range(0, numbers.length)
      .map((i) => numbers.filter((_, j) => i !== j))
      .filter(isSafe).length > 0
  );
}

function isSafePart2(numbers: number[]) {
  // The first one is technically not needed, but it makes it more clear
  // we're following the required definition
  return isSafe(numbers) || isSafeWithOmission(numbers);
}

console.log(numbers.filter(isSafePart2).length);
