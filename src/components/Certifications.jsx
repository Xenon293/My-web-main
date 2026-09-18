import { certifications } from "../data/profile";

export function Certifications() {
  return (
    <section className="home-proof-section certifications" aria-labelledby="certifications-title">
      <div className="home-section-heading">
        <span className="eyebrow">03 / Certifications</span>
        <div>
          <h2 id="certifications-title">Foundations, verified.</h2>
          <p>Cisco credentials supporting my growing cybersecurity foundation.</p>
        </div>
      </div>
      <ul className="certification-list">
        {certifications.map((certification) => (
          <li className="certification-row" key={certification.name}>
            <div className="certification-copy">
              <span>{certification.issuer}</span>
              <h3>{certification.name}</h3>
            </div>
            <a href={certification.credential} target="_blank" rel="noopener noreferrer" aria-label={`Verify ${certification.name} on Credly`}>
              Verify <span aria-hidden="true">{"\u2197"}</span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
