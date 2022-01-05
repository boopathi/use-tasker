import { concurrent, seq, task, useTasker, TaskerState } from "../src";

const sleep = (t, x) => new Promise((r) => setTimeout(() => r(x), t));

export default function Home() {
  const { state, start } = useTasker(
    seq(
      "seq - top",
      task("1", () => sleep(1000, "1")),
      task("1a", (x) => sleep(1000, x.result + "1")),
      task(
        "2",
        concurrent(
          "concurrent leaves",
          task("2.1", () => sleep(2000, "2.1")),
          task("2.2", async () => {
            await sleep(2000, "asdfasdf");
            throw new Error("skdksks");
          })
        )
      ),
      task(
        "3",
        seq(
          "seq leaves",
          task("3.1s", (x) => sleep(1000, x + "3.1")),
          task("3.2s", () => sleep(1000, "3.2")),
          task("3.3s", () => sleep(1000, "3.3"))
        )
      )
    )
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
      {data.result ? <span>{JSON.stringify(data.result)}</span> : null}
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

function Err({ error }: { error: Error }) {
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
