import { Nav } from './components/Nav';
import { ProjectCard } from './components/ProjectCard';
import { Reveal } from './components/Reveal';
import { TypingTest } from './components/TypingTest';
import { Contact } from './components/Contact';
import { PixelBuddy } from './components/PixelBuddy';
import { Presence } from './components/Presence';
import { projects } from './data/projects';
import './styles.css';

const focusAreas = [
    [
        "Python & software development",
        "Writing clearer programs, practicing fundamentals, and turning small ideas into working tools.",
    ],
    [
        "Linux & automation",
        "Getting more comfortable at the command line and looking for repetitive work that code can simplify.",
    ],
    [
        "Cybersecurity foundations",
        "Learning the principles behind safer software, privacy, and responsible security practice.",
    ],
];

const resources = [
    {
        category: "Python & web",
        links: [
            { name: "MDN Web Docs", url: "https://developer.mozilla.org/en-US/" },
            {
                name: "Python for beginners",
                url: "https://www.python.org/about/gettingstarted/",
            },
            { name: "freeCodeCamp", url: "https://www.freecodecamp.org/learn/" },
        ],
    },
    {
        category: "Fundamentals",
        links: [
            { name: "CS50x", url: "https://cs50.harvard.edu/x/" },
            { name: "The Odin Project", url: "https://www.theodinproject.com/" },
            { name: "Developer roadmaps", url: "https://roadmap.sh/" },
        ],
    },
    {
        category: "Linux & security",
        links: [
            { name: "Linux Journey", url: "https://linuxjourney.com/" },
            {
                name: "Web Security Academy",
                url: "https://portswigger.net/web-security",
            },
            { name: "OverTheWire games", url: "https://overthewire.org/wargames/" },
        ],
    },
];

function App() {
    return (
        <>
            <Nav />
            <div className="presence-wrap"><Presence /></div>

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
                <span>© {new Date().getFullYear()} · Built with React + Vite</span>
            </footer>
        </>
    );
}

export default App;
