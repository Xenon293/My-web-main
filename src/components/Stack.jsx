import { stack } from "../data/profile";

export function Stack() {
  return (
    <section className="home-proof-section stack-section" aria-labelledby="stack-title">
      <div className="home-section-heading home-section-heading--compact">
        <span className="eyebrow">02 / Stack</span>
        <div>
          <h2 id="stack-title">Tools I build with.</h2>
          <p>A practical toolkit shaped by coursework, personal projects, and this portfolio.</p>
        </div>
      </div>
      <div className="stack-groups" aria-label="Technology stack">
        {stack.map(({ category, technologies }) => (
          <section className="stack-group" key={category} aria-labelledby={`stack-${category.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}>
            <h3 id={`stack-${category.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}>{category}</h3>
            <ul className="stack-list">
              {technologies.map((technology) => <li key={technology}>{technology}</li>)}
            </ul>
          </section>
        ))}
      </div>
    </section>
  );
}
