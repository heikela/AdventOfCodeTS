import { getInput, getTestBlock } from "../inputs.ts";

import * as Utils from "../utils.ts";
import { Map, Set, Seq, List, is } from "immutable";

let input = await getInput(2024, 24);
//input = await getTestBlock(2024, 24);

let errors: string[] = [];

function recordIssue(message: string) {
  errors.push(message);
}

const lines = Utils.lines(input);

const paragraphBreak = lines.indexOf("");

const initialsPart = lines.slice(0, paragraphBreak);
const gatesPart = lines.slice(paragraphBreak + 1);

let initials = Map<string, boolean>();
for (let line of initialsPart) {
  let [name, value] = line.split(": ");
  initials = initials.set(name, value === "1");
}

let gates = Map<string, List<string>>();
for (let line of gatesPart) {
  let [definition, name] = line.split(" -> ");
  gates = gates.set(name, List(definition.split(" ")));
}

// console.log(`${gates}`);

function dependencies(gate: List<string>): List<string> {
  return List([gate.get(0)!, gate.get(2)!]);
}

function op(gate: List<string>): string {
  return gate.get(1)!;
}

function isInputWire(gate: string): boolean {
  return initials.has(gate);
}

// console.log(`${initials}`);

function evaluate(gate: List<string>, values: Map<string, boolean>): boolean {
  let [a, op, b] = gate;
  let valueA = values.get(a)!;
  let valueB = values.get(b)!;
  switch (op) {
    case "AND":
      return valueA && valueB;
    case "OR":
      return valueA || valueB;
    case "XOR":
      return valueA !== valueB;
    default:
      throw new Error(`Unknown operator: ${op}`);
  }
}

function gateToString(name: string) {
  return `${gates.get(name)?.join(" ")} -> ${name}`;
}

function outputName(bit: number): string {
  return `z${bit.toString().padStart(2, "0")}`;
}

// Topological sort of gates
let sortedGates = List<string>();
let visited = Set<string>();

function visit(gate: string) {
  if (visited.has(gate) || isInputWire(gate)) {
    return;
  }
  visited = visited.add(gate);
  for (let dep of dependencies(gates.get(gate)!)) {
    visit(dep);
  }
  sortedGates = sortedGates.push(gate);
}
for (let gate of gates.keys()) {
  visit(gate);
}

// console.log(`${sortedGates}`);

let values = initials;
for (let gate of sortedGates) {
  values = values.set(gate, evaluate(gates.get(gate)!, values));
}

function isOutputWire(gate: string): boolean {
  return gate.startsWith("z");
}

const outputs = values
  .filter((_, key) => isOutputWire(key))
  .entrySeq()
  .sortBy(([key, _]) => key)
  .map(([_, value]) => value)
  .toArray();

let outputNum = 0;
let exponent = 1;
for (let output of outputs) {
  outputNum += output ? exponent : 0;
  exponent *= 2;
}
console.log(outputNum);

// Part 2

let gatesByUse = Map<string, Set<string>>();
for (let [name, definition] of gates) {
  for (let dep of dependencies(definition)) {
    let existing = gatesByUse.has(dep) ? gatesByUse.get(dep)! : Set<string>();
    gatesByUse = gatesByUse.set(dep, existing.add(name));
  }
}
// console.log(`${gatesByUse}`);

let inputAndsByBit = Map<number, string>();
let inputXorsByBit = Map<number, string>();
let outputXorComponentsByBit = Map<number, Set<string>>();
for (let [name, definition] of gates) {
  let args = dependencies(definition);
  if (op(definition) === "XOR" && args.every(isInputWire)) {
    let bit = parseInt(args.get(0)!.substring(1), 10);
    if (parseInt(args.get(1)!.substring(1), 10) !== bit) {
      recordIssue(
        `XOR of inputs with different bits: ${definition} -> ${name}`
      );
    }
    inputXorsByBit = inputXorsByBit.set(bit, name);
  }
  if (op(definition) === "AND" && args.every(isInputWire)) {
    let bit = parseInt(args.get(0)!.substring(1), 10);
    if (parseInt(args.get(1)!.substring(1), 10) !== bit) {
      recordIssue(
        `AND of inputs with different bits: ${definition} -> ${name}`
      );
    }
    inputAndsByBit = inputAndsByBit.set(bit, name);
  }
  if (isOutputWire(name)) {
    if (op(definition) != "XOR") {
      recordIssue(`Output wire ${name} is not XOR: ${definition}`);
    }
    let bit = parseInt(name.substring(1), 10);
    outputXorComponentsByBit = outputXorComponentsByBit.set(bit, Set(args));
  }
}

let carryForBit = Map<number, string>();
carryForBit = carryForBit.set(0, inputAndsByBit.get(0)!);
for (let bit = 1; bit <= 45; ++bit) {
  let prevCarry = carryForBit.get(bit - 1)!;
  let currentBitAnd = inputAndsByBit.get(bit)!;
  let currentBitXor = inputXorsByBit.get(bit)!;
  let currentBitOutputComponents = outputXorComponentsByBit.get(bit)!;
  console.log(`Bit ${bit}. Incoming carry: ${prevCarry}`);
  console.log(`  ${gateToString(currentBitXor)}`);
  console.log(`  ${gateToString(currentBitAnd)}`);
  console.log(`  ${gateToString(outputName(bit))}`);
  if (
    currentBitOutputComponents.filter((x) => x === currentBitXor).size !== 1
  ) {
    recordIssue(
      `Output wire ${outputName(bit)} does not take as input the output of the XOR of the appropriate bit: ${currentBitXor}. Inputs: ${currentBitOutputComponents}`
    );
  }
  if (currentBitOutputComponents.filter((x) => x === prevCarry).size !== 1) {
    recordIssue(
      `Output wire ${outputName(bit)} does not take as input the previous carry: ${prevCarry}. Inputs: ${currentBitOutputComponents}`
    );
  }
  if (!gatesByUse.has(prevCarry)) {
    recordIssue(`Previous carry ${prevCarry} is not used`);
    break;
  }
  let usesOfPrevCarry = gatesByUse.get(prevCarry)!;
  let prevCarryAnded = usesOfPrevCarry.filter((x) =>
    dependencies(gates.get(x)!).some((y) => y === currentBitXor) && op(gates.get(x)!) === "AND"
  );
  if (
    prevCarryAnded.size !== 1 ||
    !(op(gates.get(prevCarryAnded.first()!)!) === "AND")
  ) {
    recordIssue(
      `Previous carry ${prevCarry} is not ANDed with the xor of bit ${bit}: ${currentBitXor}. Instead it is used by gates: ${usesOfPrevCarry}`
    );
    break;
  }
  let prevCarryAndedName = prevCarryAnded.first()!;
  console.log(`  ${gateToString(prevCarryAndedName)}`);
  let usesOfPrevCarryAnded = gatesByUse.get(prevCarryAndedName)!;
  console.log(`Intermediate carry calculation is used by: ${usesOfPrevCarryAnded}`);
  if (usesOfPrevCarryAnded.size !== 1) {
    recordIssue(
      `Intermediate carry calculation ${prevCarryAndedName} is not used exactly once. Uses: ${usesOfPrevCarryAnded}`
    );
  }
  let nextCarry = usesOfPrevCarryAnded.first()!;
  if (op(gates.get(nextCarry)!) !== "OR") {
    recordIssue(`Intermediate carry calculation ${prevCarryAndedName} is not ORed to the next carry. Instead its use is:: ${gates.get(nextCarry)!}`);
  }
  console.log(`  ${gateToString(nextCarry)}`);

  carryForBit = carryForBit.set(bit, nextCarry);
}

// console.log(`${inputXorsByBit}`);

console.log(errors);

// bdj is carry... from bit 0
// it's xord with twd to output bit 1 -- we have a check for this
// and anded with twd to create cbq -- we have a check for this
// twd is xor of input bits 1 -- we have a check for this
// cbq is ord with gwd to make rhr, rhr is next carry
// gwd is and of inputs 1



/*

z26 looks like a carry?
