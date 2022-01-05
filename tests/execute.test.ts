import { seq, concurrent, task } from "../src";
import { run } from "../src/execute";

describe("execute", () => {
  test("sequence run", async () => {
    const mockFn = jest
      .fn()
      .mockReturnValueOnce("1")
      .mockReturnValueOnce("2")
      .mockReturnValueOnce("3");

    let n = 1;
    await run(
      seq("test-1", task("1", mockFn), task("2", mockFn), task("3", mockFn)),
      {
        beforeTask() {},
        afterTask(path) {
          if (path.length > 0) {
            expect(mockFn).toHaveBeenCalledTimes(n);
            switch (n) {
              case 1:
                expect(mockFn).toHaveBeenLastCalledWith(undefined);
                break;
              case 2:
                expect(mockFn).toHaveBeenLastCalledWith({ result: "1" });
                break;
              case 3:
                expect(mockFn).toHaveBeenLastCalledWith({ result: "2" });
                break;
            }
            n++;
          }
        },
      }
    );
  });

  test("concurrent run", async () => {
    const mockFn = jest
      .fn()
      .mockReturnValueOnce("1")
      .mockReturnValueOnce("2")
      .mockReturnValueOnce("3");

    let n = 1;
    await run(
      concurrent(
        "test-1",
        task("1", mockFn),
        task("2", mockFn),
        task("3", mockFn)
      ),
      {
        beforeTask() {},
        afterTask(path) {
          if (path.length > 0) {
            expect(mockFn).toHaveBeenCalledTimes(n);
            switch (n) {
              case 1:
                expect(mockFn).toHaveBeenLastCalledWith(undefined);
                break;
              case 2:
                expect(mockFn).toHaveBeenLastCalledWith({ result: "1" });
                break;
              case 3:
                expect(mockFn).toHaveBeenLastCalledWith({ result: "2" });
                break;
            }
            n++;
          }
        },
      }
    );
  });
});

// for isolated modules
export {};
