import { render, screen } from "@testing-library/react";
import App from "../App";

test("renders Buddy as a dedicated readable page", () => {
  window.history.replaceState({}, "", "/buddy");
  render(<App />);
  expect(screen.getByRole("heading", { name: "Ask Buddy." })).toBeInTheDocument();
  expect(screen.getByLabelText(/What would you like to learn or know/i)).toBeInTheDocument();
  expect(screen.getByRole("link", { name: /Back to portfolio/i })).toHaveAttribute("href", "/");
});
