import { projectPath } from "../config/routes";
import { LineIcon } from "./LineIcon";

export function ProjectCard({ project }) {
  return (
    <article className="project-card project-row">
      <div className="project-row__number">{project.number}</div>
      <div className="project-row__preview">
        {project.preview ? (
          <img className="project-preview-image" src={project.preview} alt={`${project.title} project preview`} loading="lazy" decoding="async" />
        ) : (
          <div className="project-preview" aria-label={`${project.title} preview placeholder`}>
            <span>Project preview</span><strong>{project.title}</strong><small>Original screenshot coming soon</small>
          </div>
        )}
      </div>
      <div className="project-row__copy">
        <span className="eyebrow">Selected work</span>
        <h2>{project.title}</h2>
        <p>{project.description}</p>
        <ul className="tag-list project-card-tags" aria-label="Technologies used">
          {project.technologies.map((technology) => <li key={technology}>{technology}</li>)}
        </ul>
      </div>
      <a className="project-row__link" href={projectPath(project.slug)}>
        <span>View case study</span><LineIcon name="arrowRight" size={18} />
      </a>
    </article>
  );
}
