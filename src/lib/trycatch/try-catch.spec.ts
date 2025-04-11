import { tryCatch } from "./index";

describe("async try-catch handler", () => {
  it("Should return a success result when the promise resolves", async () => {
    const result = await tryCatch(Promise.resolve("success"));
    expect(result).toEqual({ data: "success", error: null });
  });

  it("Should return a failure result when the promise rejects", async () => {
    const result = await tryCatch(Promise.reject("error"));
    expect(result).toEqual({ data: null, error: "error" });
  });
});
