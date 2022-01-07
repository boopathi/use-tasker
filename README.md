# useTasker

A React Hook to schedule asynchronous things.

## Install

```
yarn add use-tasker
```

## Usage

Import the repo and try out the example in CodeSandbox:

https://codesandbox.io/s/github/boopathi/use-tasker

Example:

```tsx
import { useTasker, seq, concurrent, task } from "use-tasker";

const sleep = (t) => new Promise((r) => setTimeout(r, t));

function Pipeline() {
  const { state, start } = useTasker(
    seq(
      "pipeline",
      task("title 1", async () => {
        await sleep(2000);
      }),
      concurrent(
        "deploy",
        task("deploy pods", async () => {
          await sleep(3000);
        }),
        task("deploy service", async () => {
          await sleep(3000);
        }),
        task("deploy ingress", async () => {
          await sleep(3000);
        })
      )
    )
  );

  return (
    <div>
      <pre>
        <code>{JSON.stringify(state, null, 2)}</code>
      </pre>
    </div>
  );
}
```

## API

### `useTasker`

```ts
const { state, start } = useTasker(taskList, context);
```

- **taskList**: `TaskList` - The `TaskList` returned by `seq` or `concurrent` functions described below
- **context**: `any` - The parameter passed to all `taskFn` functions. You can use this as an internal state to pass values from one task to another.
- _returns_ `{ state, start }`
- **state**: `TaskerState` - A nested structure that is updated as the tasks complete. This is the store of a reducer. More details under [`state`](#state) topic.
- **start**: `() => void` - The function to start running the tasks. Add this as the click event handler of a button or a similar other thing.

### `state`

The `state` returned by the `useTasker` hook gives the current state of the execution pipeline. It's a nested recursive structure that is derived from the input structure of the `taskList`.

The type definition of the `state` can be imported for TS projects and is defined as -

```ts
type TaskRunStatus = "NOT_STARTED" | "LOADING" | "SUCCESS" | "ERROR";

interface TaskerState {
  title: string;
  status: TaskRunStatus;
  tasks?: TaskerState[];
  error?: any;
}
```

The state updates as and when the execution proceeds and triggers a re-render of the component that uses `useTasker`. You can create two mututally recursive components to render this recursive state. For example, the following code will render the recursive state as a nested `ul`, `li` list.

```tsx
import { TaskerState } from "use-tasker";

function ListItem({ data }: { data: TaskerState }) {
  return (
    <li>
      {data.status}: {data.title} ({data.error ? data.error.message : null})
      {data.tasks ? <List tasks={data.tasks} /> : null}
    </li>
  );
}

function List({ tasks }: { tasks: TaskerState["tasks"] }) {
  return (
    <ul>
      {tasks.map((it) => (
        <ListItem data={it} key={it.title + it.status} />
      ))}
    </ul>
  );
}
```

### `task`

```ts
import { task } from "use-tasker";
```

The task specifier. A task can retur any value including promises. If a task returns, it means it is successfully completed. If the task throws an error or returns a rejected promise, the task failed.

```ts
task(name, taskFn);
```

- **name**: `string`- name of the task
- **taskFn**: `(context) => any | Promise<any>` - the task function
  - **context**: `any` - the context passed to `useTasker`
- _returns_ `Task`

### `seq`

```ts
import { seq } from "use-tasker";
```

A sequence `TaskList` specifier. Members of the sequence are executed sequentially. An Error in one of the steps will stop the execution of the sequence.

```ts
seq(name, ...taskLike);
```

- **name**: `string`- name for the sequence
- **taskLike**: `Task | TaskList` - a `Task` returned by the `task` function or another seq or concurrent `TaskList` returned by `seq` or `concurrent` functions
- _returns_ `TaskList`

### `concurrent`

```ts
import { concurrent } from "use-tasker";
```

A concurrent `TaskList` specifier. Members are executed concurrently using [`Promise.allSettled`][promise-all-settled]. An error in one or more of the members will be collected and thrown as a `ConcurrentTasksError` - more details about this error is described below in [Error Handling](#error-handling).

```ts
concurrent(name, ...taskLike);
```

- **name**: `string`- name for the concurrent tasks
- **taskLike**: `Task | TaskList` - a `Task` returned by the `task` function or another seq or concurrent `TaskList` returned by `seq` or `concurrent` functions
- _returns_ `TaskList`

## Error handling

- `task`: Tasks can throw an error or return a rejected `Promise`. Depending on whether it is used as a member of `seq` or `concurrent`, the error is handled accordingly.

  ```ts
  task("title1", () => {
    throw new Error("title1");
  });
  task("title2", () => {
    return Promise.reject(new Error("title2"));
  });
  ```

- `seq`: Errors thrown or rejected promises in `seq` stop the current pipeline.
- `concurrent`: Errors thrown or rejected promises in `concurrent` are collected as it is collected by [`Promise.allSettled`][promise-all-settled]. They are then wrapped using a custom error class - `ConcurrentTasksError`. For example,

  ```tsx
  import { ConcurrentTasksError } from "use-tasker";

  function ErrorComponent(state: TaskerState) {
    if (state.error) {
      if (state.error instanceof ConcurrentTasksError) {
        return <div>{state.error.errors.map((err) => err.message)}</div>;
      }
    }
    return null;
  }
  ```

## Related

This project is inspired by [Listr](https://github.com/SamVerschueren/listr), which is a terminal task list.

### License

MIT

[promise-all-settled]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/allSettled
