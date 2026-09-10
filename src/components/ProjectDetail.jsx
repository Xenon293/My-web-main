export function ProjectDetail({ project }) {
  return (
    <article className="project-case-study">
      <header className="case-study-hero">
        <span className="eyebrow">Selected work / {project.number}</span>
        <h1>{project.title}</h1>
        <p>{project.description}</p>
        <ul className="tag-list" aria-label="Technologies used">
          {project.technologies.map((technology) => <li key={technology}>{technology}</li>)}
        </ul>
      </header>

      {project.preview ? (
        <img className="case-study-preview-image" src={project.preview} alt={`${project.title} project preview`} />
      ) : (
        <div className="case-study-preview-placeholder" aria-label={`${project.title} preview placeholder`}>
          <span>Original project screenshot coming soon</span><strong>{project.title}</strong>
        </div>
      )}

      <div className="case-study-body">
        <section><span className="detail-label">The problem</span><h2>What I wanted to understand.</h2><p>{project.problem}</p></section>
        <section><span className="detail-label">My role</span><h2>Built independently.</h2><p>{project.role}. I planned the workflow, implemented the project, and evaluated the safety tradeoffs while learning the underlying tools.</p></section>
        <section><span className="detail-label">Technical decisions</span><h2>Choices made deliberately.</h2><ul className="case-study-decisions">{project.decisions.map((decision) => <li key={decision}>{decision}</li>)}</ul></section>
        <section><span className="detail-label">Safety</span><h2>Limits stated honestly.</h2><p>{project.safety}</p></section>
        <section><span className="detail-label">Outcome</span><h2>What the project produced.</h2><p>{project.outcome}</p></section>
      </div>

      {(project.repository || project.demo) && <div className="case-study-links">
        {project.repository && <a className="hero-primary-action" href={project.repository} target="_blank" rel="noreferrer">View repository ↗</a>}
        {project.demo && <a className="hero-secondary-action" href={project.demo} target="_blank" rel="noreferrer">View demo ↗</a>}
      </div>}
    </article>
  );
}
