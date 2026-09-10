import { render, screen } from "@testing-library/react";
import App from "../App";

test("renders a dedicated project case study route", () => {
  window.history.replaceState({}, "", "/work/pyvault");
  render(<App />);
  expect(screen.getByRole("heading", { level: 1, name: "PyVault" })).toBeInTheDocument();
  expect(screen.getByText("Choices made deliberately.")).toBeInTheDocument();
  expect(screen.getByRole("link", { name: /Back to selected work/i })).toHaveAttribute("href", "/#work");
});
