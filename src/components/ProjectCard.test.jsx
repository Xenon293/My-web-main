import { render, screen } from "@testing-library/react";
import { ProjectCard } from "./ProjectCard";
import { projects } from "../data/projects";

test("renders an honest placeholder without unavailable project actions", () => {
  render(<ProjectCard project={projects[0]} />);
  expect(screen.getByText("Original screenshot coming soon")).toBeInTheDocument();
  expect(screen.queryByRole("link", { name: /repository|demo/i })).not.toBeInTheDocument();
  expect(screen.getByRole("link", { name: /View case study/i })).toHaveAttribute("href", "/work/pyvault");
});
