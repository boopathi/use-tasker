import { concurrent, seq, task, useTasker, TaskerState } from "../src";

const sleep = (t) => new Promise((r) => setTimeout(r, t));

export default function Home() {
  const { state, start } = useTasker(
    seq(
      "seq - top",
      task("1", (ctx: any) => {
        ctx.counter++;
        return sleep(1000);
      }),
      task("1a", (ctx: any) => {
        ctx.counter++;
        return sleep(1000);
      }),
      concurrent(
        "concurrent leaves",
        task("2.1", (ctx: any) => {
          ctx.counter++;
          return sleep(2000);
        }),
        task("2.2", (ctx: any) => {
          ctx.counter++;
          return sleep(1000);
        })
      ),
      seq(
        "seq leaves",
        task("3.1s", (ctx: any) => {
          ctx.counter++;
          return sleep(1000);
        }),
        task("3.2s", (ctx: any) => {
          ctx.counter++;
          return sleep(1000);
        }),
        task("3.3s", (ctx: any) => {
          ctx.counter++;
          return sleep(1000);
        })
      ),
      task("4", (ctx: any) => {
        console.log(ctx);
      })
    ),
    {
      counter: 0,
    }
  );

  return (
    <div>
      <button onClick={() => start()}>Start</button>

      <div>
        <h2>
          Overall Status: {getIcon(state.status)}{" "}
          {state.error ? <Err error={state.error} /> : null}
        </h2>

        <List tasks={state.tasks} />
      </div>
    </div>
  );
}

function ListItem({ data }: { data: TaskerState }) {
  return (
    <li>
      {getIcon(data.status)} {data.title}{" "}
      {data.error ? <Err error={data.error} /> : null}
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

function Err({ error }: { error: Error | Error[] }) {
  if (Array.isArray(error)) {
    return (
      <span style={{ color: "red" }}>
        ({error.map((it) => it.message).join(", ")})
      </span>
    );
  }
  return <span style={{ color: "red" }}>({error.message})</span>;
}

function getIcon(status: TaskerState["status"]) {
  let icon = "⚪️";
  switch (status) {
    case "NOT_STARTED":
      icon = "⚪️";
      break;
    case "LOADING":
      icon = "🟡";
      break;
    case "SUCCESS":
      icon = "🟢";
      break;
    case "ERROR":
      icon = "🔴";
      break;
  }
  return icon;
}
