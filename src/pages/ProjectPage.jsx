import { ProjectDetail } from "../components/ProjectDetail";
import { ROUTES } from "../config/routes";

export default function ProjectPage({ project }) {
  return (
    <main className="project-page" id="top">
      <ProjectDetail project={project} />
      <nav className="case-study-navigation" aria-label="Project navigation">
        <a className="privacy-home-link" href={ROUTES.projects.path}>Back to projects</a>
        <a className="privacy-home-link" href={ROUTES.contact.path}>Contact me</a>
      </nav>
    </main>
  );
}
