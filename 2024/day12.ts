import { getInput, getTestBlock } from "../inputs.ts";

import * as Utils from "../utils.ts";

import { Map, Set, List, Record, RecordOf } from "immutable";

import { Point, addPoints, orthogonalNeighbours } from "../point2d.ts";

const input = await getInput(2024, 12);
//const input = await getTestBlock(2024, 12, 3);

const lines = Utils.lines(input);

type StepProps = { from: Point; to: Point };
const Step = Record({ from: Point({ x: 0, y: 0 }), to: Point({ x: 0, y: 0 }) });
type Step = RecordOf<StepProps>;

function translateStep(step: Step, delta: Point): Step {
  return Step({
    from: addPoints(step.from, delta),
    to: addPoints(step.to, delta),
  });
}

const directions = orthogonalNeighbours;

let W = 0;
let H = 0;

let plots = Map<Point, string>();

lines.map((line, y) => {
  line.split("").map((char, x) => {
    plots = plots.set(Point({ x, y }), char);
    W = Math.max(W, x);
  });
  H = Math.max(H, y);
});

W = W + 1;
H = H + 1;

let scoreSum = 0;
let scoreSum2 = 0;

let visited = Set<Point>();

for (let y = 0; y < H; y++) {
  for (let x = 0; x < W; x++) {
    let p = Point({ x, y });
    if (visited.has(p)) {
      continue;
    }
    let frontier = List<Step>();
    let type = plots.get(p);
    frontier = frontier.push(Step({ from: p, to: p }));
    let area = 0;
    let perimeter = 0;
    let edgeCount = 0;
    let edgeSet = Set<Step>();
    while (frontier.size > 0) {
      const step = frontier.first()!;
      p = step.to;
      frontier = frontier.shift();
      if (!plots.has(p) || plots.get(p) != type) {
        perimeter++;
        edgeSet = edgeSet.add(step);
        continue;
      }
      if (visited.has(p)) {
        continue;
      }
      visited = visited.add(p);
      area++;
      for (const dir of directions) {
        const np = Point({ x: p.x + dir.x, y: p.y + dir.y });
        frontier = frontier.push(Step({ from: p, to: np }));
      }
    }
    if (area > 0) {
      scoreSum += area * perimeter;
      let visitedEdge = Set<Step>();
      let sides = 0;
      for (const possibleNewSide of edgeSet) {
        if (visitedEdge.has(possibleNewSide)) {
          continue;
        }
        sides++;
        let edgeFrontier = List<Step>();
        edgeFrontier = edgeFrontier.push(possibleNewSide);
        let relevantDirections = [];
        if (Math.abs(possibleNewSide.from.x - possibleNewSide.to.x) == 1) {
          relevantDirections = [Point({ x: 0, y: -1 }), Point({ x: 0, y: 1 })];
        } else {
          relevantDirections = [Point({ x: -1, y: 0 }), Point({ x: 1, y: 0 })];
        }
        while (edgeFrontier.size > 0) {
          const edge = edgeFrontier.first()!;
          edgeFrontier = edgeFrontier.shift();
          if (visitedEdge.has(edge)) {
            continue;
          }
          visitedEdge = visitedEdge.add(edge);
          for (const dir of relevantDirections) {
            const newStep = translateStep(edge, dir);
            if (edgeSet.has(newStep)) {
              edgeFrontier = edgeFrontier.push(newStep);
            }
          }
        }
      }
      scoreSum2 += area * sides;
    }
  }
}

console.log(`${scoreSum}`);
console.log(`${scoreSum2}`);
