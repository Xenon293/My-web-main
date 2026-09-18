import { Reveal } from "../components/Reveal";
import { focusAreas } from "../data/siteContent";

export default function AboutPage() {
  return (
    <main className="content-page" id="top">
      <header className="page-intro page-intro--split">
        <div>
          <span className="eyebrow">About</span>
          <h1 aria-label="Curious by default.">Curious by<br /><em>default.</em></h1>
        </div>
        <p>I’m Haniel Molejon, a first-year BS Information Technology student in Cebu, Philippines, building my foundation one project at a time.</p>
      </header>

      <Reveal as="section" className="about-page-story" aria-labelledby="about-story-title">
        <figure className="portrait-frame">
          <picture>
            <source type="image/avif" srcSet="/haniel-molejon-480.avif 480w, /haniel-molejon-960.avif 960w" sizes="(min-width: 768px) 320px, 100vw" />
            <source type="image/webp" srcSet="/haniel-molejon-480.webp 480w, /haniel-molejon-960.webp 960w" sizes="(min-width: 768px) 320px, 100vw" />
            <img src="/haniel-molejon.jpg" alt="Haniel Molejon" width="1254" height="1254" loading="eager" decoding="async" />
          </picture>
        </figure>
        <div className="about-page-copy">
          <span className="detail-label">My direction</span>
          <h2 id="about-story-title">Learning through useful work.</h2>
          <p>I enjoy the quiet satisfaction of understanding how things work—from an encryption flow to a Linux command that saves a few minutes.</p>
          <p>My current direction is Python, software development, Linux, automation, and cybersecurity. I’m still learning, and that is the point of this site: to document the work honestly as it grows.</p>
          <span className="availability-pill">Open to internship opportunities</span>
        </div>
      </Reveal>

      <section className="focus-page-section" aria-labelledby="focus-title">
        <div className="section-heading compact-heading">
          <span className="eyebrow">Current focus</span>
          <h2 id="focus-title">What I’m learning now.</h2>
        </div>
        <ol className="focus-index">
          {focusAreas.map(([title, description], index) => (
            <Reveal as="li" delay={index * 70} key={title}>
              <span className="focus-index__number">0{index + 1}</span>
              <div><h3>{title}</h3><p>{description}</p></div>
            </Reveal>
          ))}
        </ol>
      </section>
    </main>
  );
}
