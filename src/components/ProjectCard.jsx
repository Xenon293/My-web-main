export function ProjectCard({ project }) {
  return (
    <article className="project-card">
      <div className="project-topline"><span>{project.number}</span><span>Selected work</span></div>
      {project.preview ? (
        <img className="project-preview-image" src={project.preview} alt={`${project.title} project preview`} loading="lazy" decoding="async" />
      ) : (
        <div className="project-preview" aria-label={`${project.title} preview placeholder`}>
          <span>Project preview</span><strong>{project.title}</strong><small>Original screenshot coming soon</small>
        </div>
      )}
      <h3>{project.title}</h3>
      <p>{project.description}</p>
      <ul className="tag-list project-card-tags" aria-label="Technologies used">
        {project.technologies.map((technology) => <li key={technology}>{technology}</li>)}
      </ul>
      <p className="project-card-outcome"><span>Outcome</span>{project.outcome}</p>
      <a className="text-link" href={`/work/${project.slug}`}>View case study <span aria-hidden="true">→</span></a>
    </article>
  );
}
