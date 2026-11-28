import { act, fireEvent, render, screen } from "@testing-library/react";
import { PixelBuddy } from "./PixelBuddy";

let observers;
beforeEach(() => {
  observers = [];
  vi.stubGlobal("requestAnimationFrame", vi.fn(() => 1));
  vi.stubGlobal("cancelAnimationFrame", vi.fn());
  vi.stubGlobal("IntersectionObserver", class {
    constructor(callback) {
      this.callback = callback;
      this.targets = [];
      observers.push(this);
    }
    observe(target) { this.targets.push(target); }
    disconnect() {}
  });
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

test("only measures scroll progress while the buddy is visible", () => {
  const { container } = render(<PixelBuddy />);
  const section = screen.getByRole("region");
  const measure = vi.spyOn(section, "getBoundingClientRect").mockReturnValue({ top: 100, height: 300 });
  fireEvent.scroll(window);
  expect(requestAnimationFrame).not.toHaveBeenCalled();

  const observer = observers.find((item) => item.targets.includes(section));
  act(() => observer.callback([{ target: section, isIntersecting: true }]));
  const frame = requestAnimationFrame.mock.calls.at(-1)[0];
  act(() => frame());
  expect(measure).toHaveBeenCalledOnce();
  expect(container.querySelector(".pixel-stage").style.getPropertyValue("--scroll-progress")).not.toBe("");

  act(() => observer.callback([{ target: section, isIntersecting: false }]));
  vi.mocked(requestAnimationFrame).mockClear();
  fireEvent.scroll(window);
  expect(requestAnimationFrame).not.toHaveBeenCalled();
});

test("keeps the buddy link usable without scroll animation for reduced motion", () => {
  vi.spyOn(window, "matchMedia").mockReturnValue({ matches: true, addEventListener() {}, removeEventListener() {} });
  render(<PixelBuddy />);
  const section = screen.getByRole("region");
  const observer = observers.find((item) => item.targets.includes(section));
  act(() => observer.callback([{ target: section, isIntersecting: true }]));
  fireEvent.scroll(window);
  expect(requestAnimationFrame).not.toHaveBeenCalled();
  expect(screen.getByRole("link")).toHaveAttribute("href", "/buddy");
});
