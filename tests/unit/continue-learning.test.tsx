import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ContinueLearning } from "@/components/landing/continue-learning";
import { DEMO_ROADMAP } from "@/lib/demo-roadmap";
import { persistRoadmapSnapshot, readLatestRoadmapSnapshot } from "@/lib/roadmap-storage";

const { push } = vi.hoisted(() => ({ push: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));
vi.mock("sonner", () => ({ toast: { error: vi.fn() } }));
vi.mock("@/lib/roadmap-sharing", () => ({ encodeRoadmapForUrl: vi.fn().mockResolvedValue("plain.test-snapshot") }));

describe("ContinueLearning", () => {
  afterEach(cleanup);
  beforeEach(() => {
    localStorage.clear();
    push.mockClear();
  });

  it("keeps the landing page clear when no saved roadmap exists", () => {
    const { container } = render(<ContinueLearning />);
    expect(container).toBeEmptyDOMElement();
    expect(readLatestRoadmapSnapshot()).toBeNull();
  });

  it("ignores corrupt and incompatible saved data", () => {
    localStorage.setItem("learnx:active-roadmap:v1", "{broken");
    expect(readLatestRoadmapSnapshot()).toBeNull();
    localStorage.setItem("learnx:active-roadmap:v1", JSON.stringify({ version: 2, savedAt: 1, roadmap: DEMO_ROADMAP }));
    expect(readLatestRoadmapSnapshot()).toBeNull();
    localStorage.setItem("learnx:active-roadmap:v1", JSON.stringify({ version: 1, savedAt: 1, roadmap: { ...DEMO_ROADMAP, milestones: [] } }));
    expect(readLatestRoadmapSnapshot()).toBeNull();
  });

  it("handles browsers that deny access to storage", () => {
    const deniedStorage = vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => { throw new Error("Storage denied"); });
    expect(readLatestRoadmapSnapshot()).toBeNull();
    const { container } = render(<ContinueLearning />);
    expect(container).toBeEmptyDOMElement();
    deniedStorage.mockRestore();
  });

  it("shows saved progress and resumes generated roadmaps through their existing route", () => {
    const id = "83f949d7-9d57-4b46-92fa-c413e20d817b";
    persistRoadmapSnapshot({ ...DEMO_ROADMAP, id });
    render(<ContinueLearning />);
    expect(screen.getByRole("heading", { name: DEMO_ROADMAP.title })).toBeInTheDocument();
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "25");
    expect(screen.getByText(DEMO_ROADMAP.milestones[1].title)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Continue learning" })).toHaveAttribute("href", `/roadmap/${id}`);
  });

  it("opens saved demos using the existing encoded-roadmap route", async () => {
    persistRoadmapSnapshot(DEMO_ROADMAP);
    render(<ContinueLearning />);
    fireEvent.click(screen.getByRole("button", { name: "Continue learning" }));
    await waitFor(() => expect(push).toHaveBeenCalledWith(expect.stringMatching(/^\/roadmap\/demo\?roadmap=/)));
  });

  it("keeps shared UUID roadmaps in snapshot mode when resuming", async () => {
    persistRoadmapSnapshot({ ...DEMO_ROADMAP, id: "83f949d7-9d57-4b46-92fa-c413e20d817b" }, "shared");
    render(<ContinueLearning />);
    fireEvent.click(screen.getByRole("button", { name: "Continue learning" }));
    await waitFor(() => expect(push).toHaveBeenCalledWith(expect.stringMatching(/^\/roadmap\/saved\?roadmap=/)));
  });

  it("updates after storage events and labels completed roadmaps accurately", () => {
    persistRoadmapSnapshot(DEMO_ROADMAP);
    render(<ContinueLearning />);
    persistRoadmapSnapshot({ ...DEMO_ROADMAP, milestones: DEMO_ROADMAP.milestones.map((milestone) => ({ ...milestone, isCompleted: true })) });
    fireEvent(window, new Event("storage"));
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "100");
    expect(screen.getByRole("button", { name: "Revisit roadmap" })).toBeInTheDocument();
    expect(screen.queryByText("Up next:")).not.toBeInTheDocument();
  });
});
