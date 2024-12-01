import { getInput } from "../inputs.ts";
import * as Utils from "../utils.ts";

const input = await getInput(2024, 1);

const lines = Utils.lines(input);
const numbers = lines.map((s) => Utils.words(s).map((x) => parseInt(x)));

const list1 = numbers.map((x) => x[0]);
const list2 = numbers.map((x) => x[1]);

list1.sort();
list2.sort();

const result = Utils.zip(list1, list2)
  .map((pair) => Math.abs(pair[0] - pair[1]))
  .reduce((acc, x) => acc + x, 0);

console.log(result);

const grouped = Map.groupBy(list2, (x) => x);
const counts = Utils.mapMap(grouped, (g) => g.length);

const similarity = list1
  .map((id) => Utils.getOrElse(counts, id, 0) * id)
  .reduce((acc, x) => acc + x, 0);

console.log(similarity);
