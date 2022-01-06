import { TaskerState } from ".";

export function updateStateAtPath(
  state: TaskerState,
  path: number[],
  status: TaskerState["status"],
  error?: TaskerState["error"]
): TaskerState {
  if (path.length === 0)
    return {
      ...state,
      status,
      ...(error ? { error } : undefined),
    };

  const [first, ...rest] = path;
  return {
    ...state,
    tasks: [
      ...state.tasks.slice(0, first),
      updateStateAtPath(state.tasks[first], rest, status, error),
      ...state.tasks.slice(first + 1),
    ],
  };
}
