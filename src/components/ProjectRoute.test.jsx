import { render, screen } from "@testing-library/react";
import App from "../App";

test("renders a dedicated project case study route", async () => {
  window.history.replaceState({}, "", "/projects/pyvault");
  render(<App />);
  expect(await screen.findByRole("heading", { level: 1, name: "PyVault" })).toBeInTheDocument();
  expect(screen.getByText("Choices made deliberately.")).toBeInTheDocument();
  expect(screen.getByRole("link", { name: /Back to projects/i })).toHaveAttribute("href", "/projects");
});
