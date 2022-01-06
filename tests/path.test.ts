import { concurrent, seq, task, TaskerState } from "../src";
import { updateStateAtPath } from "../src/path";
import { getStateFromTaskList } from "../src/tasker";

let taskCounter = 0;

describe("path functions", () => {
  describe("update status at path", () => {
    const mockState = getMockState();

    test("updates state", () => {
      const path = [3, 1, 1];
      const originalSubState = getStateAtPath(mockState, path);
      const updatedState = updateStateAtPath(mockState, path, "LOADING");
      const updatedSubState = getStateAtPath(updatedState, path);

      // does not mutate original
      expect(originalSubState).toEqual({
        status: "NOT_STARTED",
        title: originalSubState.title,
      });

      // creates a copy
      expect(originalSubState).not.toBe(updatedSubState);

      // updates the state
      expect(getStateAtPath(updatedState, path)).toEqual({
        status: "LOADING",
        title: originalSubState.title,
      });
    });
  });
});

function getStateAtPath(state: TaskerState, path: number[]): TaskerState {
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

function getMockState() {
  return getStateFromTaskList(
    seq(
      "foo",
      mockTask(),
      mockTask(),
      concurrent("bar", mockTask(), mockTask(), mockTask()),
      seq("baz", mockTask(), concurrent("quux", mockTask(), mockTask()))
    )
  );
}

function mockTask() {
  taskCounter++;
  return task("mock" + taskCounter, () => {});
}
