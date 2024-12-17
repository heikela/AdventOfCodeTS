import { getInput, getTestBlock } from "../inputs.ts";
import * as Utils from "../utils.ts";

import { Record, RecordOf, Set } from "immutable";

type StateProps = {
  a: number;
  b: number;
  c: number;
  ip: number;
  outputLength: number;
};
const State = Record<StateProps>({
  a: 0,
  b: 0,
  c: 0,
  ip: 0,
  outputLength: 0,
});
type State = RecordOf<StateProps>;

let input = await getInput(2024, 17);
//input = await getTestBlock(2024, 17, 1);

const lines = Utils.lines(input);

let program = lines[4]
  .split(" ")[1]
  .split(",")
  .map((x) => parseInt(x));

let originalA = parseInt(lines[0].split(" ")[2]);
let originalB = parseInt(lines[1].split(" ")[2]);
let originalC = parseInt(lines[2].split(" ")[2]);

let failing = Set<State>();

function runProgram(
  program: number[],
  aOverride: number | null = null,
  haltCond: (outputIndex: number, output: number) => boolean = () => false
): number[] {
  let output: number[] = [];
  let a = aOverride ?? originalA;
  let b = originalB;
  let c = originalC;
  let ip = 0;
  let seenStates = Set<State>();

  function comboOperand(op: number) {
    if (op >= 0 && op <= 3) {
      return op;
    }
    if (op == 4) {
      return a;
    }
    if (op == 5) {
      return b;
    }
    if (op == 6) {
      return c;
    }
    throw new Error(`Invalid operand: ${op}`);
  }

  function runInstruction() {
    let instr = program[ip];
    let operand = program[ip + 1];
    ip += 2;
    switch (instr) {
      case 0:
        a = Math.floor(a / Math.pow(2, comboOperand(operand)));
        break;
      case 1:
        b = b ^ operand;
        break;
      case 2:
        b = comboOperand(operand) % 8;
        break;
      case 3:
        if (a != 0) {
          ip = operand;
        }
        break;
      case 4:
        b = b ^ c;
        break;
      case 5:
        output.push(comboOperand(operand) % 8);
        break;
      case 6:
        b = Math.floor(a / Math.pow(2, comboOperand(operand)));
        break;
      case 7:
        c = Math.floor(a / Math.pow(2, comboOperand(operand)));
        break;
    }
  }

  let outputLength = 0;
  while (ip < program.length - 1) {
    const currentState = State({ a, b, c, ip, outputLength });
    if (failing.has(currentState)) {
      throw new Error("This state has failed before");
    }
    seenStates = seenStates.add(currentState);
    runInstruction();
    if (outputLength != output.length) {
      outputLength = output.length;
      if (haltCond(outputLength - 1, output[outputLength - 1])) {
        failing = failing.union(seenStates);
        throw new Error("Halt condition met, output: " + output);
      }
    }
  }
  return output;
}

const output = runProgram(program);
console.log(output.join(","));

let newA = 0;

while (true) {
  if (newA % 10000 == 0) {
    console.log(`Trying ${newA}`);
  }
  try {
    let copy = runProgram(program, newA, (index, value) => {
      return value != program[index];
    });
    if (copy.length == program.length) {
      console.log(`At ${newA} we have a copy: ${copy.join(",")}`);
      break;
    }
    newA++;
  } catch (e) {
    //    console.log(`At ${newA} we have an error: ${e.message}`);
    newA++;
  }
}
