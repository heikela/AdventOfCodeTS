import { getInput } from "../inputs.ts";

const input = await getInput(2024, 3);

const mulPattern = /mul\((\d{1,3}),(\d{1,3})\)/g;

const matches = input.matchAll(mulPattern);

const result = matches
  .map((match) => {
    const [_, a, b] = match;
    return parseInt(a) * parseInt(b);
  })
  .reduce((acc, x) => acc + x, 0);

console.log(result);

const enabledStart = /do\(\)/g;
const enabledEnd = /don't\(\)/g;

let remainingInput = input;
let part2 = 0;
while (remainingInput.length > 0) {
  const disablePos = remainingInput.search(enabledEnd);
  let enabledArea = remainingInput;
  if (disablePos !== -1) {
    enabledArea = remainingInput.slice(0, disablePos);
    remainingInput = remainingInput.slice(disablePos + 6);
  } else {
    remainingInput = "";
  }
  const matches = enabledArea.matchAll(mulPattern);
  part2 += matches
    .map((match) => {
      const [_, a, b] = match;
      return parseInt(a) * parseInt(b);
    })
    .reduce((acc, x) => acc + x, 0);

  const enablePos = remainingInput.search(enabledStart);
  if (enablePos !== -1) {
    remainingInput = remainingInput.slice(enablePos + 4);
  } else {
    remainingInput = "";
  }
}

console.log(part2);
