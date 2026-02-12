import { describe, expect, it } from "vitest";
import { AppError } from "@/utils/app-error";

describe("AppError", () => {
  it("sets message and default statusCode", () => {
    const err = new AppError("bad");

    expect(err.message).toBe("bad");
    expect(err.statusCode).toBe(400);
  });

  it("accepts custom statusCode", () => {
    const err = new AppError("not found", 404);

    expect(err.message).toBe("not found");
    expect(err.statusCode).toBe(404);
  });
});
