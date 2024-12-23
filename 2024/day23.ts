import { getInput, getTestBlock } from "../inputs.ts";
import * as Utils from "../utils.ts";
import { Set, Map, Seq } from "immutable";

let lines = Utils.lines(await getInput(2024, 23));
//lines = Utils.lines(await getTestBlock(2024, 23));

let connections = Map<string, Set<string>>();

function addConnection(from: string, to: string) {
  let existing = connections.has(from) ? connections.get(from)! : Set<string>();
  connections = connections.set(from, existing.add(to));
}

for (let line of lines) {
  let [from, to] = line.split("-");
  addConnection(from, to);
  addConnection(to, from);
}

function commonConnections(a: string, b: string) {
  return connections.get(a)!.intersect(connections.get(b)!);
}

let connectedSets = Map<number, Set<Set<string>>>();

function expandSet(set: Set<string>): Set<Set<string>> {
  let expanded = Set<Set<string>>();
  let a = set.first()!;
  let connectionsOfA = connections.get(a)!;
  for (let b of connectionsOfA) {
    if (set.every((x) => connections.get(x)!.has(b))) {
      let newSet = set.add(b);
      if (newSet.size === set.size + 1) {
        expanded = expanded.add(newSet);
      }
    }
  }
  return expanded;
}

connectedSets = connectedSets.set(
  1,
  Set(connections.keySeq().map((x) => Set([x])))
);

let size = 1;
while (connectedSets.has(size) && connectedSets.get(size)!.size > 0) {
  let nextSize = size + 1;
  let nextSets = Set<Set<string>>();
  for (let set of connectedSets.get(size)!) {
    nextSets = nextSets.union(expandSet(set));
  }
  connectedSets = connectedSets.set(nextSize, nextSets);
  console.log(`Found ${nextSets.size} sets of size ${nextSize}`);
  size = nextSize;
}

function couldHaveChief(set: Set<string>) {
  return set.some((x) => x.startsWith("t"));
}

console.log(connectedSets.get(3)!.filter(couldHaveChief).size);

function password(set: Set<string>) {
  return set.sort().join(",");
}

console.log(`${password(connectedSets.get(size - 1)!.first()!)}`);
