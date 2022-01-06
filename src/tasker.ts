import { useReducer } from "react";
import produce from "immer";

import { TaskList, run, isTask } from "./execute";
import { getStateAtPath } from "./path";

type TaskRunStatus = "NOT_STARTED" | "LOADING" | "SUCCESS" | "ERROR";

interface Action {
  kind: "RESET" | "START" | "END";
  path: number[];
  error?: any;
}

export interface TaskerState {
  title: string;
  status: TaskRunStatus;
  tasks?: TaskerState[];
  error?: any;
}

function getStateFromTaskList<T>(taskList: TaskList): TaskerState {
  return {
    status: "NOT_STARTED",
    title: taskList.title,
    tasks: taskList.tasks.map((task) => {
      if (isTask(task)) {
        return {
          status: "NOT_STARTED" as const,
          title: task.title,
        };
      }
      return getStateFromTaskList(task);
    }),
  };
}

function resetState(state: TaskerState): TaskerState {
  return {
    title: state.title,
    status: "NOT_STARTED",
    tasks: state.tasks?.map((it) => resetState(it)),
  };
}

function taskStateReducer(state: TaskerState, action: Action) {
  switch (action.kind) {
    case "RESET":
      return resetState(state);
    case "START":
      return produce(state, (draft) => {
        const subState = getStateAtPath(draft, action.path);
        subState.status = "LOADING";
      });
    case "END":
      return produce(state, (draft) => {
        const subState = getStateAtPath(draft, action.path);
        subState.status = action.error ? "ERROR" : "SUCCESS";
        subState.error = action.error;
      });
  }

  return state;
}

export function useTasker(taskList: TaskList, context: any = {}) {
  const [state, dispatch] = useReducer(
    taskStateReducer,
    getStateFromTaskList(taskList)
  );

  return {
    start() {
      dispatch({ kind: "RESET", path: [] });
      run(taskList, {
        context,
        beforeTask(path) {
          dispatch({ kind: "START", path });
        },
        afterTask(path, error) {
          dispatch({ kind: "END", path, error });
        },
      });
    },
    state,
  };
}
