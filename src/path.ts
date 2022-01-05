import { TaskerState } from ".";

export function getStateAtPath(
  state: TaskerState,
  path: number[]
): TaskerState {
  if (path.length === 0) return state;

  let nextState = state.tasks[path[0]];

  for (let i = 1; i < path.length; i++) {
    const n = path[i];
    if (nextState.tasks == null) {
      throw new Error("Internal Error. Path not found");
    }
    nextState = nextState.tasks[n];
  }

  return nextState;
}
