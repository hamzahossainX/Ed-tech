import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { RoadmapFeedback } from "@/components/roadmap/roadmap-feedback";

vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

describe("RoadmapFeedback", () => {
  it("stores a helpful rating and exposes improvement notes", () => {
    render(<RoadmapFeedback roadmapId="roadmap-test" />);
    fireEvent.click(screen.getByRole("button", { name: "Helpful" }));
    expect(screen.getByRole("button", { name: "Helpful" })).toHaveAttribute("aria-pressed", "true");

    fireEvent.click(screen.getByRole("button", { name: "Needs work" }));
    expect(screen.getByPlaceholderText(/shorter pace/i)).toBeInTheDocument();
  });
});
