# useTasker

A React Hook to schedule asynchronous things.

## Install

```
yarn add use-tasker
```

## Usage

```tsx
import { useTasker, Tasker } from "use-tasker";

const sleep = (t) => new Promise((r) => setTimeout(r, t));

function Foo() {
  const tasks = new Tasker([
    {
      name: "1.5 seconds",
      async fn() {
        await sleep(1500);
      },
    },
    {
      name: "2.5 seconds",
      async fn() {
        await sleep(2500);
      },
    },
  ]);
  const { state, start } = useTasker(tasks);

  return <div>
    <input type="button" value="Start" onClick={() => start()}>
  </div>;
}
```
