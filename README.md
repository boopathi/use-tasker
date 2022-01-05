# useTasker

A React Hook to schedule asynchronous things.

## Install

```
yarn add use-tasker
```

## Usage

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
