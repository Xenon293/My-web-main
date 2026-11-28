import { act, render, screen } from "@testing-library/react";
import { HeroBackground } from "./HeroBackground";

vi.mock("./HeroScene", () => ({
  default: ({ active }) => <div data-testid="scene" data-active={String(active)} />,
}));

let intersect;
beforeEach(() => {
  vi.spyOn(window, "matchMedia").mockImplementation((query) => ({
    matches: query.includes("min-width"),
    addEventListener() {},
    removeEventListener() {},
  }));
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue({ getExtension: () => null });
  vi.stubGlobal("requestIdleCallback", (callback) => { callback(); return 1; });
  vi.stubGlobal("cancelIdleCallback", vi.fn());
  vi.stubGlobal("IntersectionObserver", class {
    constructor(callback) { intersect = callback; }
    observe() {}
    disconnect() {}
  });
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

test("pauses the hero offscreen while retaining its existing scene", async () => {
  render(<HeroBackground />);
  const scene = await screen.findByTestId("scene");
  act(() => intersect([{ isIntersecting: false }]));
  expect(screen.getByTestId("scene")).toBe(scene);
  expect(scene).toHaveAttribute("data-active", "false");
  act(() => intersect([{ isIntersecting: true }]));
  expect(screen.getByTestId("scene")).toBe(scene);
  expect(scene).toHaveAttribute("data-active", "true");
});
