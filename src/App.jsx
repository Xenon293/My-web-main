import { Nav } from "./components/Nav";
import { ProjectCard } from "./components/ProjectCard";
import { Reveal } from "./components/Reveal";
import { TypingTest } from "./components/TypingTest";
import { Contact } from "./components/Contact";
import { PixelBuddy } from "./components/PixelBuddy";
import { Presence } from "./components/Presence";
import { CookieConsent } from "./components/CookieConsent";
import { PrivacyPolicy } from "./components/PrivacyPolicy";
import { focusAreas, resources } from "./data/siteContent";
import { projects } from "./data/projects";
import "./styles.css";

function App() {
  if (window.location.pathname === "/privacy") return <PrivacyPage />;

  return (
    <>
      <Nav />
      <div className="presence-wrap">
        <Presence />
      </div>

      <main id="top">
        {/* Hero Section */}
        <Reveal as="section" className="hero">
          <div className="eyebrow">IT student · Cebu, Philippines</div>
          <h1 id="hero-title">
            Learning to make
            <br />
            <em>useful things</em> with code.
          </h1>
          <div className="hero-bottom">
            <p>
              I’m Haniel Molejon, a first-year BS Information Technology student
              at Cebu Technological University – Danao Campus. I’m exploring
              software development through small, deliberate projects.
            </p>
            <a
              className="circle-link"
              href="#work"
              aria-label="Jump to selected work"
            >
              ↓
            </a>
          </div>
        </Reveal>

        <PixelBuddy />

        {/* 01 / Selected Work */}
        <section className="section" id="work">
          <Reveal className="section-heading">
            <span className="eyebrow">01 / Selected work</span>
            <h2>
              Projects built
              <br />
              to understand.
            </h2>
          </Reveal>
          <div className="projects-list">
            {projects.map((project, index) => (
              <Reveal as="div" delay={index * 100} key={project.title}>
                <ProjectCard project={project} />
              </Reveal>
            ))}
          </div>
        </section>

        {/* Dark Statement Band */}
        <section className="dark-band">
          <Reveal className="dark-inner">
            <span className="eyebrow">A work in progress</span>
            <p className="statement">
              There is always another concept to make tangible, another command
              to learn, another problem worth taking apart.
            </p>
          </Reveal>
        </section>

        {/* 02 / About */}
        <section className="section" id="about">
          <Reveal className="section-heading">
            <span className="eyebrow">02 / About</span>
            <h2>
              Curious by
              <br />
              default.
            </h2>
          </Reveal>
          <Reveal className="about-copy">
            <img src="/haniels%20img.jpg" alt="Haniel Molejon" />
            <div>
              <p>
                I’m building my foundation one project at a time. I enjoy the
                quiet satisfaction of understanding how things work—from an
                encryption flow to a Linux command that saves a few minutes.
              </p>
              <p>
                My current direction is Python, software development, Linux,
                automation, and cybersecurity. I’m still learning, and that is
                the point of this site: to document the work honestly as it
                grows.
              </p>
            </div>
          </Reveal>
        </section>

        {/* 03 / Current Focus */}
        <section className="section" id="focus">
          <Reveal className="section-heading">
            <span className="eyebrow">03 / Current focus</span>
            <h2>
              What I’m
              <br />
              learning now.
            </h2>
          </Reveal>
          <ul className="focus-list">
            {focusAreas.map(([title, desc], index) => (
              <Reveal as="li" delay={index * 80} key={title}>
                <span>0{index + 1}</span>
                <div>
                  <h3>{title}</h3>
                  <p>{desc}</p>
                </div>
              </Reveal>
            ))}
          </ul>
        </section>

        {/* 04 / Resources */}
        <section className="section resources-section" id="resources">
          <Reveal className="section-heading">
            <span className="eyebrow">04 / Resources</span>
            <h2>
              Keep
              <br />
              <em>learning.</em>
            </h2>
          </Reveal>
          <div className="resource-grid">
            {resources.map((item) => (
              <article key={item.category}>
                <span className="eyebrow">{item.category}</span>
                {item.links.map((link) => (
                  <a
                    key={link.url}
                    href={link.url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {link.name} ↗
                  </a>
                ))}
              </article>
            ))}
          </div>
        </section>

        {/* Interactive Typing Test */}
        <TypingTest />

        {/* 05 / Contact */}
        <Contact />
      </main>

      <footer>
        <span>Haniel Molejon</span>
        <span>© {new Date().getFullYear()} · <a href="/privacy">Privacy &amp; Cookies</a> · Built with React + Vite</span>
      </footer>
      <CookieConsent />
    </>
  );
}

function PrivacyPage() {
  return (
    <>
      <Nav />
      <main className="privacy-page" id="top">
        <PrivacyPolicy />
        <a className="privacy-home-link" href="/">← Back to portfolio</a>
      </main>
      <footer>
        <span>Haniel Molejon</span>
        <span>© {new Date().getFullYear()} · <a href="/">Portfolio</a></span>
      </footer>
      <CookieConsent />
    </>
  );
}

export default App;
