import { getInput, getTestBlock } from "../inputs.ts";
import * as Utils from "../utils.ts";
import {
  Point,
  addPoints,
  right,
  turnLeft,
  turnRight,
  orthogonalNeighbours,
} from "../point2d.ts";

import { Seq, Set, Map, Record, RecordOf } from "immutable";

import { Grid } from "../grid.ts";

import { MinPriorityQueue } from "@datastructures-js/priority-queue";

const input = await getInput(2024, 16);
//const input = await getTestBlock(2024, 16, 2);

const lines = Utils.lines(input);

const map = Grid.fromLines(lines);

const initialPos = Seq(map.entries()).find(([_, c]) => c == "S")![0];
const finalPos = Seq(map.entries()).find(([_, c]) => c == "E")![0];

const intialDirection = right;

type StateProps = {
  pos: Point;
  direction: Point;
};
const State = Record<StateProps>({
  pos: initialPos,
  direction: intialDirection,
});
type State = RecordOf<StateProps>;

type Move = {
  state: State;
  cost: number;
};

const turnCost = 1000;
const stepCost = 1;

function makeForwardMove(state: State): Move {
  return {
    state: State({
      pos: addPoints(state.pos, state.direction),
      direction: state.direction,
    }),
    cost: stepCost,
  };
}

function makeTurnRightMove(state: State): Move {
  return {
    state: State({
      pos: state.pos,
      direction: turnRight(state.direction),
    }),
    cost: turnCost,
  };
}

function makeTurnLeftMove(state: State): Move {
  return {
    state: State({
      pos: state.pos,
      direction: turnLeft(state.direction),
    }),
    cost: turnCost,
  };
}

function isLegal(state: State): boolean {
  return map.getOrElse(state.pos, "#") != "#";
}

function isGoal(state: State): boolean {
  return state.pos.equals(finalPos);
}

function isIntersection(point: Point): boolean {
  const char = map.getOrElse(point, "#");
  if (char == "#") {
    return false;
  }
  if (char == "S" || char == "E") {
    return true;
  }
  return (
    orthogonalNeighbours.filter(
      (dir) => map.getOrElse(addPoints(point, dir), "#") != "#"
    ).length >= 3
  );
}

function isDeadEnd(point: Point): boolean {
  return (
    map.getOrElse(point, "#") != "#" &&
    orthogonalNeighbours.filter(
      (dir) => map.getOrElse(addPoints(point, dir), "#") != "#"
    ).length == 1
  );
}

const intersections: Set<Point> = Set(Seq(map.keys()).filter(isIntersection));
const deadEnds: Set<Point> = Set(Seq(map.keys()).filter(isDeadEnd));

function pathsToNextPointOfInterestNoInitialTurn(
  initialIntersectionState: State
): [Move, Set<Point>][] {
  let positions = Set<Point>([initialIntersectionState.pos]);
  const firstStepPos = addPoints(
    initialIntersectionState.pos,
    initialIntersectionState.direction
  );
  if (
    !isLegal(
      State({
        pos: firstStepPos,
        direction: initialIntersectionState.direction,
      })
    )
  ) {
    return [];
  }
  let state = State({
    pos: firstStepPos,
    direction: initialIntersectionState.direction,
  });
  positions = positions.add(state.pos);
  let cost = stepCost;
  while (!isIntersection(state.pos)) {
    positions = positions.add(state.pos);
    if (deadEnds.has(state.pos)) {
      return [];
    }
    const forward = makeForwardMove(state);
    if (isLegal(forward.state)) {
      state = forward.state;
      cost += stepCost;
    } else {
      const left = makeTurnLeftMove(state);
      const leftForward = makeForwardMove(left.state);
      if (isLegal(leftForward.state)) {
        state = leftForward.state;
        cost += turnCost + stepCost;
      } else {
        const right = makeTurnRightMove(state);
        const rightForward = makeForwardMove(right.state);
        if (isLegal(rightForward.state)) {
          state = rightForward.state;
          cost += turnCost + stepCost;
        } else {
          throw new Error(
            "Should we not have caught this with dead ends check?"
          );
          return [];
        }
      }
    }
  }
  positions = positions.add(state.pos);
  return [[{ state, cost }, positions]];
}

function pathsToNextPointOfInterest(state: State): [Move, Set<Point>][] {
  let paths: [Move, Set<Point>][] = [];
  let straight = pathsToNextPointOfInterestNoInitialTurn(state);
  if (straight.length > 0) {
    paths.push(straight[0]);
  }
  let left = pathsToNextPointOfInterestNoInitialTurn(
    makeTurnLeftMove(state).state
  );
  if (left.length > 0) {
    paths.push([
      { ...left[0][0], cost: left[0][0].cost + turnCost },
      left[0][1],
    ]);
  }
  let right = pathsToNextPointOfInterestNoInitialTurn(
    makeTurnRightMove(state).state
  );
  if (right.length > 0) {
    paths.push([
      { ...right[0][0], cost: right[0][0].cost + turnCost },
      right[0][1],
    ]);
  }
  return paths;
}

let macroMoves = Map<State, [Move, Set<Point>][]>();

for (const intersection of intersections) {
  for (const direction of orthogonalNeighbours) {
    const state = State({ pos: intersection, direction });
    macroMoves = macroMoves.set(state, pathsToNextPointOfInterest(state));
  }
}

let onAnyPath = Set<Point>();

function dijkstraFrom(start: State): number {
  const frontier = new MinPriorityQueue<Move>((m: Move) => m.cost);

  frontier.enqueue({
    state: start,
    cost: 0,
  });

  let cameFrom = Map<State, Set<State>>();
  let costSoFar = Map<State, number>();

  cameFrom = cameFrom.set(start, Set([start]));
  costSoFar = costSoFar.set(start, 0);

  let shortestPathCost = Number.MAX_SAFE_INTEGER;
  while (!frontier.isEmpty()) {
    const current = frontier.dequeue();
    if (current.cost > shortestPathCost) {
      break;
    }

    if (isGoal(current.state)) {
      shortestPathCost = current.cost;
      let state = current.state;
      let steps = Set<State>([state]);
      let visited = Set<State>();
      while (steps.size > 0) {
        state = steps.first()!;
        steps = steps.remove(state);
        if (visited.has(state)) {
          continue;
        }
        visited = visited.add(state);
        for (const prev of cameFrom.get(state)!) {
          const takenPaths = macroMoves
            .get(prev)!
            .filter(([move, _]) => move.state.equals(state));
          for (const takenPath of takenPaths) {
            onAnyPath = onAnyPath.union(takenPath[1]);
          }
          if (!prev.equals(state)) {
            steps = steps.add(prev);
          }
        }
      }
    }

    for (const nextWithPositions of macroMoves.get(current.state)!) {
      const next = nextWithPositions[0];
      const newCost = next.cost + current.cost;
      if (!costSoFar.has(next.state) || newCost < costSoFar.get(next.state)!) {
        costSoFar = costSoFar.set(next.state, newCost);
        frontier.enqueue({ state: next.state, cost: newCost });
        cameFrom = cameFrom.set(next.state, Set([current.state]));
      } else if (newCost == costSoFar.get(next.state)!) {
        cameFrom = cameFrom.set(
          next.state,
          cameFrom.get(next.state)!.add(current.state)
        );
      }
    }
  }
  if (shortestPathCost == Number.MAX_SAFE_INTEGER) {
    throw new Error("No path found");
  }
  return shortestPathCost;
}

const result = dijkstraFrom(
  State({ pos: initialPos, direction: intialDirection })
);

console.log(result);

console.log(onAnyPath.size);
