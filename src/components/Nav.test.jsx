import { fireEvent, render, screen } from "@testing-library/react";
import { Nav } from "./Nav";

beforeEach(() => {
  localStorage.clear();
  delete document.documentElement.dataset.theme;
  window.history.replaceState({}, "", "/about");
});

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
