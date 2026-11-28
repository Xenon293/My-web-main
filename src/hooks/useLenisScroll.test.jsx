import { act, fireEvent, render, renderHook, waitFor } from "@testing-library/react";
import { useLenisScroll } from "./useLenisScroll";

const instances = vi.hoisted(() => []);
vi.mock("lenis", () => ({
  default: class LenisMock {
    constructor() {
      this.raf = vi.fn();
      this.destroy = vi.fn();
      this.scrollTo = vi.fn();
      instances.push(this);
    }
  },
}));

let media;
beforeEach(() => {
  instances.length = 0;
  media = new Map();
  vi.stubGlobal("ResizeObserver", class {});
  vi.stubGlobal("requestAnimationFrame", vi.fn(() => 1));
  vi.stubGlobal("cancelAnimationFrame", vi.fn());
  vi.spyOn(window, "matchMedia").mockImplementation((query) => {
    if (!media.has(query)) {
      const target = new EventTarget();
      target.matches = false;
      media.set(query, target);
    }
    return media.get(query);
  });
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

test("disables smooth scrolling when the viewport becomes mobile and restores it on desktop", async () => {
  const { unmount } = renderHook(useLenisScroll);
  await waitFor(() => expect(instances).toHaveLength(1));
  const narrow = media.get("(max-width: 1023px)");
  act(() => {
    narrow.matches = true;
    narrow.dispatchEvent(new Event("change"));
  });
  expect(instances[0].destroy).toHaveBeenCalledOnce();
  act(() => {
    narrow.matches = false;
    narrow.dispatchEvent(new Event("change"));
  });
  await waitFor(() => expect(instances).toHaveLength(2));
  unmount();
  expect(instances[1].destroy).toHaveBeenCalledOnce();
});

test("leaves fragment navigation to the browser so links keep their native focus and history behavior", async () => {
  function Links() {
    useLenisScroll();
    return <><a href="#content">Skip to content</a><main id="content" tabIndex={-1}>Content</main></>;
  }
  const { getByRole } = render(<Links />);
  await waitFor(() => expect(instances).toHaveLength(1));
  expect(fireEvent.click(getByRole("link"))).toBe(true);
  expect(instances[0].scrollTo).not.toHaveBeenCalled();
});

test("does not initialize smooth scrolling for reduced motion", async () => {
  window.matchMedia("(prefers-reduced-motion: reduce)").matches = true;
  const { result } = renderHook(useLenisScroll);
  await act(async () => {});
  expect(instances).toHaveLength(0);
  expect(result.current.current).toBeNull();
});
