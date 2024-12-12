import { getInput, getTestBlock } from "../inputs.ts";

import * as Utils from "../utils.ts";

import { Map, Set, List, Record, RecordOf } from "immutable";

const input = await getInput(2024, 12);
//const input = await getTestBlock(2024, 12, 3);

const lines = Utils.lines(input);

type PointProps = { x: number; y: number };
const Point = Record({ x: 0, y: 0 });
type Point = RecordOf<PointProps>;

function addPoints(a: Point, b: Point): Point {
  return Point({ x: a.x + b.x, y: a.y + b.y });
}

type StepProps = { from: Point; to: Point };
const Step = Record({ from: Point({ x: 0, y: 0 }), to: Point({ x: 0, y: 0 }) });
type Step = RecordOf<StepProps>;

function translateStep(step: Step, delta: Point): Step {
  return Step({
    from: addPoints(step.from, delta),
    to: addPoints(step.to, delta),
  });
}

const directions = [
  Point({ x: 0, y: -1 }),
  Point({ x: 1, y: 0 }),
  Point({ x: 0, y: 1 }),
  Point({ x: -1, y: 0 }),
];

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
        //        if (!visited.has(np)) {
        frontier = frontier.push(Step({ from: p, to: np }));
        //        }
      }
    }
    if (area > 0) {
      scoreSum += area * perimeter;
      //      console.log(`${type}: ${area} * ${perimeter} = ${area * perimeter}`);
      let visitedEdge = Set<Step>();
      let sides = 0;
      //      console.log(`Traversing edges of area of type ${type}`);
      for (const possibleNewSide of edgeSet) {
        /*        console.log(
          `Edge: ${possibleNewSide.from.x},${possibleNewSide.from.y} -> ${possibleNewSide.to.x},${possibleNewSide.to.y}`
        );*/
        if (visitedEdge.has(possibleNewSide)) {
          //          console.log(`Already counted`);
          continue;
        }
        /*        console.log(
          `New side (not found in a visited edge set of size ${visitedEdge.size})`
        );
        for (const e of visitedEdge) {
          console.log(
            `Visited edge: ${e.from.x},${e.from.y} -> ${e.to.x},${e.to.y}`
          );
        }*/
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
              //              console.log(`Found adjacent edge element ${newStep}`);
              edgeFrontier = edgeFrontier.push(newStep);
            }
          }
        }
      }
      scoreSum2 += area * sides;
      //      console.log(`${type}: ${area} * ${sides} = ${area * sides}`);
      //      console.log(`======`);
    }
  }
}

console.log(`${scoreSum}`);
console.log(`${scoreSum2}`);
