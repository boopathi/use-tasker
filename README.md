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
- **state**: `TaskerState` - A nested structure that is updated as the tasks complete. This is the store of a reducer.
- **start**: `() => void` - The function to start running the tasks. Add this as the click event handler of a button or a similar other thing.

### `task`

The task specifier

```ts
task(name, taskFn);
```

- **name**: `string`- name of the task
- **taskFn**: `(context) => any | Promise<any>` - the task function
  - **context**: `any` - the context passed to `useTasker`
- _returns_ `Task`

### `seq`

```ts
seq(name, ...taskLike);
```

- **name**: `string`- name for the sequence
- **taskLike**: `Task | TaskList` - a `Task` returned by the `task` function or another seq or concurrent `TaskList` returned by `seq` or `concurrent` functions
- _returns_ `TaskList`

### `concurrent`

```ts
concurrent(name, ...taskLike);
```

- **name**: `string`- name for the concurrent tasks
- **taskLike**: `Task | TaskList` - a `Task` returned by the `task` function or another seq or concurrent `TaskList` returned by `seq` or `concurrent` functions
- _returns_ `TaskList`

### License

MIT
