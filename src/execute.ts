export interface TaskList {
  title: string;
  tasks: Task[];
  concurrent?: boolean;
}

export interface Task {
  title: string;
  task: ((prevValue?: any) => any | Promise<any>) | TaskList;
}

export interface TaskExecutorOptions {
  beforeTask: (path: any[]) => any;
  afterTask: (path: any[], result: any, error: any) => any;
}

export async function run(taskList: TaskList, options: TaskExecutorOptions) {
  return executeTaskList(taskList, options, []);
}

export function seq(title: string, ...tasks: Task[]): TaskList {
  return {
    title,
    tasks,
    concurrent: false,
  };
}

export function concurrent(title: string, ...tasks: Task[]): TaskList {
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

async function executeTaskList(
  taskList: TaskList,
  options: TaskExecutorOptions,
  previousPath: number[]
) {
  options.beforeTask(previousPath);
  let result = [];
  let error;
  if (taskList.concurrent) {
    const allSettleResults = await Promise.allSettled(
      taskList.tasks.map((task, i) =>
        executeTask(task, options, [...previousPath, i])
      )
    );
    for (const r of allSettleResults) {
      if (r.status === "rejected") {
        if (!Array.isArray(error)) error = [r.reason];
        else error.push(r.reason);
      } else {
        result.push(r.value);
      }
    }
  } else {
    let prevValue;
    for (const [i, task] of taskList.tasks.entries()) {
      try {
        prevValue = await executeTask(
          task,
          options,
          [...previousPath, i],
          prevValue
        );
        if (prevValue.error != null) {
          error = prevValue.error;
          break;
        }

        result.push(prevValue);
      } catch (e) {
        error = e;
        break;
      }
    }
  }

  if (error) {
    options.afterTask(previousPath, null, error);
  } else {
    options.afterTask(previousPath, result, null);
  }

  return { result, error };
}

async function executeTask(
  task: Task,
  options: TaskExecutorOptions,
  path: number[],
  prevValue?: any
) {
  if (typeof task.task === "function") {
    options.beforeTask(path);
    try {
      const result = await task.task(prevValue);
      options.afterTask(path, result, null);
      return { result };
    } catch (error: any) {
      options.afterTask(path, null, error);
      throw error;
    }
  } else {
    return executeTaskList(task.task, options, path);
  }
}
