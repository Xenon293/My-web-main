import { ProjectCard } from "../components/ProjectCard";
import { Reveal } from "../components/Reveal";
import { projects } from "../data/projects";

export default function ProjectsPage() {
  return (
    <main className="content-page" id="top">
      <header className="page-intro">
        <span className="eyebrow">Selected work</span>
        <h1 aria-label="Projects built to understand.">Projects built<br /><em>to understand.</em></h1>
        <p>Small, practical tools where each project became a reason to understand the system underneath it.</p>
      </header>
      <section className="project-index" aria-label="Project case studies">
        {projects.map((project, index) => (
          <Reveal as="div" delay={index * 80} key={project.slug}>
            <ProjectCard project={project} />
          </Reveal>
        ))}
      </section>
    </main>
  );
}
