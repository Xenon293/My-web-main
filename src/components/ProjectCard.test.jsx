import { render, screen } from "@testing-library/react";
import { ProjectCard } from "./ProjectCard";
import { projects } from "../data/projects";

test.each(projects)("shows $title with its source code link and no empty preview", (project) => {
  render(<ProjectCard project={project} />);
  expect(screen.getByRole("heading", { name: project.title })).toBeInTheDocument();
  expect(screen.queryByRole("img")).not.toBeInTheDocument();
  const repositoryLink = screen.getByRole("link", { name: /source code on GitHub/i });
  expect(repositoryLink).toHaveAttribute("href", project.repository);
  expect(repositoryLink).toHaveAttribute("target", "_blank");
  expect(repositoryLink).toHaveAttribute("rel", "noopener noreferrer");
  expect(screen.queryByRole("link", { name: /demo/i })).not.toBeInTheDocument();
  expect(screen.getByRole("link", { name: /View case study/i })).toHaveAttribute("href", `/projects/${project.slug}`);
});
