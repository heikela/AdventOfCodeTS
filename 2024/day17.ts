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
        if (a < 0) {
          throw new Error("Negative a in case 0");
        }
        break;
      case 1:
        b = Number(BigInt(b) ^ BigInt(operand));
        if (b < 0) {
          throw new Error("Negative b in case 1");
        }
        break;
      case 2:
        b = comboOperand(operand) % 8;
        if (b < 0) {
          throw new Error("Negative b in case 2");
        }
        break;
      case 3:
        if (a != 0) {
          ip = operand;
        }
        break;
      case 4: {
        let oldB = b;
        b = Number(BigInt(b) ^ BigInt(c));
        if (b < 0) {
          console.log(`b: ${oldB}, c: ${c} -> ${b}`);
          throw new Error("Negative b in case 4");
        }

        break;
      }
      case 5:
        if (comboOperand(operand) < 0) {
          throw new Error("Negative operand in case 5");
        }

        output.push(comboOperand(operand) % 8);
        break;
      case 6:
        b = Math.floor(a / Math.pow(2, comboOperand(operand)));
        if (b < 0) {
          throw new Error("Negative b in case 6");
        }

        break;
      case 7:
        c = Math.floor(a / Math.pow(2, comboOperand(operand)));
        if (c < 0) {
          throw new Error("Negative c in case 7");
        }

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
/*
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
*/
function comboOperantToString(op: number) {
  if (op >= 0 && op <= 3) {
    return `${op}`;
  }
  if (op == 4) {
    return "a";
  }
  if (op == 5) {
    return "b";
  }
  if (op == 6) {
    return "c";
  }
  throw new Error(`Invalid operand: ${op}`);
}

function printInstruction(instr: number, operand: number) {
  switch (instr) {
    case 0:
      console.log(`a = a / 2^${comboOperantToString(operand)}`);
      break;
    case 1:
      console.log(`b = b XOR ${operand}`);
      break;
    case 2:
      console.log(`b = ${comboOperantToString(operand)}`);
      break;
    case 3:
      console.log(`if a != 0 then ip = ${operand}`);
      break;
    case 4:
      console.log(`b = b XOR c`);
      break;
    case 5:
      console.log(`output ${comboOperantToString(operand)}`);
      break;
    case 6:
      console.log(`b = a / 2^${comboOperantToString(operand)}`);
      break;
    case 7:
      console.log(`c = a / 2^${comboOperantToString(operand)}`);
      break;
  }
}

function printProgram(program: number[]) {
  for (let i = 0; i < program.length; i += 2) {
    printInstruction(program[i], program[i + 1]);
  }
}

printProgram(program);

/*
function solveNext3Bits(upperBitsOfA: bigint, targetOutput: number) {
  let aCandidate = upperBitsOfA * BigInt(8);
  let upperBound = (upperBitsOfA + BigInt(1)) * BigInt(8);
  while (aCandidate < upperBound) {
    let a = aCandidate;
    let b = a;
    b = b ^ BigInt(5);
    let c = a >> b;
    b = b ^ BigInt(6);
    a = a >> BigInt(3);
    b = b ^ c;
    const output = b % BigInt(8);
    if (output == BigInt(targetOutput)) {
      return aCandidate;
    }
    ++aCandidate;
  }
  throw new Error("No solution found");
}
  */

function solveNext3Bits(upperBitsOfA: number, targetOutput: number): number[] {
  let aCandidate = upperBitsOfA * 8;
  let upperBound = aCandidate + 8;
  let results = [];
  while (aCandidate < upperBound) {
    let output = runProgram(program, aCandidate)[0];
    if (output == targetOutput) {
      results.push(aCandidate);
    }
    ++aCandidate;
  }
  return results;
}

let possibleUpperBits = [0];
for (let i = program.length - 1; i >= 0; i--) {
  possibleUpperBits = possibleUpperBits.flatMap((n) =>
    solveNext3Bits(n, program[i])
  );
  console.log(
    `Possible upper bits: ${possibleUpperBits.map((x) => x.toString(8))}`
  );
  const smallest = Math.min(...possibleUpperBits);
  console.log(smallest);
  if (possibleUpperBits.length >= 1) {
    console.log(runProgram(program, smallest));
  }
  //  console.log(`Upper bits of A: ${upperBitsOfA}`);
  // console.log(`Looking for ${program[i]}`);
  // console.log(
  //   `Running the program with A = ${upperBitsOfA} results in ${runProgram(
  //     program,
  //     Number(upperBitsOfA)
  //   )}`
  // );
}

if (possibleUpperBits.length >= 1) {
  const smallest = Math.min(...possibleUpperBits);
  console.log(smallest);
  console.log(runProgram(program, smallest));
}
