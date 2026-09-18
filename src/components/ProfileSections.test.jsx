import { render, screen } from "@testing-library/react";
import { Certifications } from "./Certifications";
import { Stack } from "./Stack";

test("renders the verified technology stack", () => {
  render(<Stack />);

  expect(screen.getByRole("heading", { name: "Tools I build with." })).toBeInTheDocument();
  expect(screen.getByLabelText("Technology stack")).toBeInTheDocument();
  expect(screen.getByRole("heading", { name: "Frontend" })).toBeInTheDocument();
  expect(screen.getByRole("heading", { name: "AI & Machine Learning" })).toBeInTheDocument();
  expect(screen.getByText("React")).toBeInTheDocument();
  expect(screen.getByText("Python")).toBeInTheDocument();
  expect(screen.getByText("Machine Learning")).toBeInTheDocument();
  expect(screen.getByText("Gemini API")).toBeInTheDocument();
  expect(screen.getByText("Three.js")).toBeInTheDocument();
});

test("renders compact external certification links", () => {
  render(<Certifications />);

  const threatManagement = screen.getByRole("link", { name: "Verify Cyber Threat Management on Credly" });
  const introduction = screen.getByRole("link", { name: "Verify Introduction to Cybersecurity on Credly" });
  expect(threatManagement).toHaveAttribute("href", "https://www.credly.com/badges/d99674a9-759e-4eda-82e8-e8461d934bf2/public_url");
  expect(introduction).toHaveAttribute("href", "https://www.credly.com/badges/ec7c9f75-f2fd-4ec0-972f-9d8b2c53aba1/public_url");
  expect(document.querySelector(".certification-list img")).not.toBeInTheDocument();
});
