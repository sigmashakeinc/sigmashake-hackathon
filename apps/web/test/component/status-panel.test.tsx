import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

function StatusPanel({ health }: { health: string }) {
  return <div aria-label="runtime health">{health}</div>;
}

describe("StatusPanel contract", () => {
  it("renders the runtime health label", () => {
    render(<StatusPanel health="ok" />);
    expect(screen.getByLabelText("runtime health")).toHaveTextContent("ok");
  });
});
