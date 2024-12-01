import { getInput } from "../inputs.ts";
import { Map, List } from "immutable";

const input = await getInput(2024, 1);

const lines = input.split("\n");

console.log(lines);

let list1 = [];
let list2 = [];

for (let i = 0; i < lines.length; i++) {
  const parts = lines[i].split(/\s+/);
  if (parts.length == 2) {
    list1.push(parseInt(parts[0]));
    list2.push(parseInt(parts[1]));
  }
}

list1.sort();
list2.sort();

let result = 0;
for (let i = 0; i < list1.length; i++) {
  console.log(list1[i], list2[i]);
  console.log;
  result += Math.abs(list1[i] - list2[i]);
}

console.log(result);

const grouped = List(list2).groupBy((x) => x);
const counts = grouped.map((g) => g.size);

let similarity = 0;

for (let i = 0; i < list1.length; i++) {
  const id = list1[i];
  if (counts.has(id)) {
    similarity += counts.get(id)! * id;
  }
}

console.log(similarity);
