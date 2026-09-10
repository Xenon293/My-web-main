import { render, screen } from "@testing-library/react";
import App from "../App";

test("renders the privacy policy at the privacy pathname", () => {
  window.history.replaceState({}, "", "/privacy");
  render(<App />);
  expect(screen.getByRole("heading", { name: "Privacy & Cookie Policy" })).toBeInTheDocument();
  expect(screen.getByRole("link", { name: /Back to portfolio/i })).toHaveAttribute("href", "/");
});
