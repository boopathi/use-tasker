import { seq, concurrent, task } from "../src";
import { run } from "../src/execute";

describe("execute", () => {
  test("sequence run", async () => {
    const results = [];
    const mockFn = jest
      .fn()
      .mockImplementationOnce((ctx) => {
        ctx.state += "1";
        results.push(ctx.state);
      })
      .mockImplementationOnce((ctx) => {
        ctx.state += "2";
        results.push(ctx.state);
      })
      .mockImplementationOnce((ctx) => {
        ctx.state += "3";
        results.push(ctx.state);
      });

    await run(
      seq("test-1", task("1", mockFn), task("2", mockFn), task("3", mockFn)),
      {
        context: {
          state: "",
        },
        beforeTask() {},
        afterTask() {},
      },
      true
    );
    expect(results).toEqual(["1", "12", "123"]);
    expect(mockFn).toHaveBeenCalledTimes(3);
  });

  test("concurrent run", async () => {
    const mockFn = jest.fn().mockImplementation((ctx) => {
      ctx.counter++;
    });
    const context = {
      counter: 0,
    };

    await run(
      concurrent(
        "test-1",
        task("1", mockFn),
        task("2", mockFn),
        task("3", mockFn)
      ),
      {
        context,
        beforeTask() {},
        afterTask() {},
      },
      true
    );

    expect(context.counter).toBe(3);
    expect(mockFn).toHaveBeenCalledTimes(3);
  });
});

// for isolated modules
export {};
