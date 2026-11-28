import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { Nav } from "./Nav";

beforeEach(() => {
  localStorage.clear();
  delete document.documentElement.dataset.theme;
  window.history.replaceState({}, "", "/about");
  vi.spyOn(window, "scrollTo").mockImplementation(() => {});
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  delete document.startViewTransition;
});

function mockMedia({ mobile = false, reducedMotion = false, dark = false } = {}) {
  vi.spyOn(window, "matchMedia").mockImplementation((query) => ({
    matches: query === "(max-width: 1023px)" ? mobile
      : query === "(prefers-reduced-motion: reduce)" ? reducedMotion : dark,
    addEventListener() {},
    removeEventListener() {},
  }));
}

test("opens, traps initial focus, and closes the mobile menu with Escape", () => {
  render(<Nav />);
  expect(screen.getByRole("link", { name: "Haniel Molejon, portfolio home" })).toHaveTextContent("HM.");
  const menuButton = screen.getByRole("button", { name: "Open navigation menu" });
  fireEvent.click(menuButton);
  expect(menuButton).toHaveAttribute("aria-expanded", "true");
  expect(document.body).toHaveClass("menu-open");
  expect(screen.getByRole("link", { name: "Projects" })).toHaveFocus();

  fireEvent.keyDown(window, { key: "Escape" });
  expect(menuButton).toHaveAttribute("aria-expanded", "false");
  expect(menuButton).toHaveFocus();
});

test("keeps the HM wordmark in the header when the drawer opens", () => {
  render(<Nav />);
  fireEvent.click(screen.getByRole("button", { name: "Open navigation menu" }));
  const wordmark = screen.getByRole("link", { name: "Haniel Molejon, portfolio home" });
  expect(wordmark).toBeVisible();
  expect(wordmark).toHaveTextContent("HM.");
});

test("persists the selected theme", () => {
  render(<Nav />);
  fireEvent.click(screen.getByRole("button", { name: "Switch to dark theme" }));
  expect(document.documentElement).toHaveAttribute("data-theme", "dark");
  expect(localStorage.getItem("theme")).toBe("dark");
});

test("includes the visible wordmark and Close control in the mobile keyboard focus loop", () => {
  mockMedia({ mobile: true });
  render(<Nav />);
  const menuButton = screen.getByRole("button", { name: "Open navigation menu" });
  fireEvent.click(menuButton);
  const wordmark = screen.getByRole("link", { name: "Haniel Molejon, portfolio home" });
  const themeButton = screen.getByRole("button", { name: "Switch to dark theme" });
  themeButton.focus();

  fireEvent.keyDown(window, { key: "Tab" });
  expect(wordmark).toHaveFocus();
  fireEvent.keyDown(window, { key: "Tab", shiftKey: true });
  expect(themeButton).toHaveFocus();

  menuButton.focus();
  // Browser Tab order should reach the neighboring Home link instead of wrapping.
  expect(fireEvent.keyDown(menuButton, { key: "Tab", shiftKey: true })).toBe(true);
});

test("returns focus to the menu button when the backdrop dismisses the drawer", () => {
  mockMedia({ mobile: true });
  const { container } = render(<Nav />);
  const menuButton = screen.getByRole("button", { name: "Open navigation menu" });
  fireEvent.click(menuButton);
  fireEvent.click(container.querySelector(".nav-backdrop"));

  expect(menuButton).toHaveFocus();
  expect(menuButton).toHaveAttribute("aria-expanded", "false");
  expect(container.querySelector("#site-nav")).toHaveAttribute("inert");
});

test("captures the scroll position before fixing the body and restores it on close", () => {
  vi.spyOn(window, "scrollY", "get").mockImplementation(() => (
    document.body.classList.contains("menu-open") ? 0 : 320
  ));
  render(<Nav />);
  fireEvent.click(screen.getByRole("button", { name: "Open navigation menu" }));
  expect(document.body.style.top).toBe("-320px");
  fireEvent.keyDown(window, { key: "Escape" });
  expect(window.scrollTo).toHaveBeenLastCalledWith(0, 320);
  expect(document.body.style.top).toBe("");
});

test("keeps the theme control usable when browser storage is unavailable", () => {
  vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => { throw new Error("Storage blocked"); });
  vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => { throw new Error("Storage blocked"); });
  render(<Nav />);
  fireEvent.click(screen.getByRole("button", { name: "Switch to dark theme" }));

  expect(document.documentElement).toHaveAttribute("data-theme", "dark");
  expect(screen.getByRole("button", { name: "Switch to light theme" })).toBeVisible();
});

test("changes theme without a view transition when reduced motion is preferred", () => {
  mockMedia({ reducedMotion: true });
  document.startViewTransition = vi.fn(() => ({ ready: Promise.resolve() }));
  render(<Nav />);
  fireEvent.click(screen.getByRole("button", { name: "Switch to dark theme" }));

  expect(document.startViewTransition).not.toHaveBeenCalled();
  expect(document.documentElement).toHaveAttribute("data-theme", "dark");
});
