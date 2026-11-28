import { projectPath } from "../config/routes";
import { LineIcon } from "./LineIcon";

export function ProjectCard({ project, headingLevel: Heading = "h2" }) {
  return (
    <article className={`project-card project-row${project.preview ? " has-preview" : ""}`}>
      {project.preview && <div className="project-row__preview">
          <img className="project-preview-image" src={project.preview} alt={`${project.title} project preview`} loading="lazy" decoding="async" />
      </div>}
      <div className="project-row__copy">
        <Heading>{project.title}</Heading>
        <p>{project.description}</p>
        <ul className="tag-list project-card-tags" aria-label="Technologies used">
          {project.technologies.map((technology) => <li key={technology}>{technology}</li>)}
        </ul>
      </div>
      <div className="project-row__actions">
        <a className="project-row__link" href={projectPath(project.slug)} aria-label={`View case study: ${project.title}`}>
          <span>View case study</span><LineIcon name="arrowRight" size={18} />
        </a>
        {project.repository && (
          <a className="project-row__link" href={project.repository} target="_blank" rel="noopener noreferrer" aria-label={`View ${project.title} source code on GitHub (opens in a new tab)`}>
            <span>GitHub</span><LineIcon name="arrowUpRight" size={18} />
          </a>
        )}
      </div>
    </article>
  );
}
