import { cleanup, render, screen } from "@testing-library/react";
import App from "../App";

afterEach(() => cleanup());

const pageCases = [
  ["/", "Learning to make useful things with code."],
  ["/projects", "Projects built to understand."],
  ["/about", "Curious by default."],
  ["/resources", "Keep learning."],
  ["/contact", "Let’s keep in touch."],
  ["/typing", "Find your rhythm."],
];

test.each(pageCases)("renders the %s route", async (path, heading) => {
  window.history.replaceState({}, "", path);
  render(<App />);
  expect(await screen.findByRole("heading", { level: 1, name: heading }, { timeout: 5000 })).toBeInTheDocument();
});

test("marks the current primary navigation item", async () => {
  window.history.replaceState({}, "", "/projects");
  render(<App />);
  await screen.findByRole("heading", { level: 1, name: "Projects built to understand." }, { timeout: 5000 });
  expect(screen.getByRole("link", { name: "Projects", current: "page" })).toHaveAttribute("href", "/projects");
});
