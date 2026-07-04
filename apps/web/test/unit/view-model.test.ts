import { describe, expect, it } from "vitest";
import { statusTone } from "@/lib/view-model";

describe("statusTone", () => {
  it("maps healthy states to the good tone", () => {
    expect(statusTone("ok")).toBe("good");
  });

  it("maps degraded states to the warning tone", () => {
    expect(statusTone("degraded")).toBe("warn");
  });

  it("maps unknown states to the bad tone", () => {
    expect(statusTone("down")).toBe("bad");
    expect(statusTone("unknown")).toBe("bad");
  });
});
