export interface TaskList {
  title: string;
  tasks: TaskLike[];
  concurrent?: boolean;
}

export interface Task {
  title: string;
  task: (context: unknown) => any | Promise<any>;
}

export type TaskLike = Task | TaskList;

export interface TaskExecutorOptions {
  context: unknown;
  beforeTask: (path: any[]) => any;
  afterTask: (path: any[], error: any) => any;
}

export async function run(
  taskList: TaskList,
  options: TaskExecutorOptions,
  throwOnFailure = false
) {
  try {
    return await executeTaskList(taskList, options, []);
  } catch (e) {
    if (throwOnFailure) throw e;
  }
}

export function isTask(task: TaskLike): task is Task {
  return Object.prototype.hasOwnProperty.call(task, "task");
}

export function seq(title: string, ...tasks: TaskLike[]): TaskList {
  return {
    title,
    tasks,
    concurrent: false,
  };
}

export function concurrent(title: string, ...tasks: TaskLike[]): TaskList {
  return {
    title,
    tasks,
    concurrent: true,
  };
}

export function task(title: string, task: Task["task"]): Task {
  return {
    title,
    task,
  };
}

export class ConcurrentTasksError extends Error {
  constructor(public errors: any[]) {
    super(`Multiple errors ${errors}`);
  }
}

async function executeTaskList(
  taskList: TaskList,
  options: TaskExecutorOptions,
  previousPath: number[]
) {
  options.beforeTask(previousPath);
  try {
    taskList.concurrent
      ? await executeConcurrentTaskList(taskList, options, previousPath)
      : await executeSeqTaskList(taskList, options, previousPath);
  } catch (e: any) {
    options.afterTask(previousPath, e);
    throw e;
  }
  options.afterTask(previousPath, null);
}

async function executeConcurrentTaskList(
  taskList: TaskList,
  options: TaskExecutorOptions,
  previousPath: number[]
) {
  const allSettleResults = await Promise.allSettled(
    taskList.tasks.map((task, i) =>
      isTask(task)
        ? executeTask(task, options, [...previousPath, i])
        : executeTaskList(task, options, [...previousPath, i])
    )
  );
  handleConcurrentErrors(allSettleResults);
}

async function executeSeqTaskList(
  taskList: TaskList,
  options: TaskExecutorOptions,
  previousPath: number[]
) {
  for (const [i, task] of taskList.tasks.entries()) {
    isTask(task)
      ? await executeTask(task, options, [...previousPath, i])
      : await executeTaskList(task, options, [...previousPath, i]);
  }
}

function handleConcurrentErrors(allSettleResults: PromiseSettledResult<any>[]) {
  const errors = [];
  for (const r of allSettleResults) {
    if (r.status === "rejected") {
      errors.push(r.reason);
    }
  }
  if (errors.length > 0) {
    throw new ConcurrentTasksError(errors);
  }
}

async function executeTask(
  task: Task,
  options: TaskExecutorOptions,
  path: number[]
) {
  options.beforeTask(path);
  try {
    await task.task(options.context);
  } catch (e: any) {
    options.afterTask(path, e);
    throw e;
  }
  options.afterTask(path, null);
}
