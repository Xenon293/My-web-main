import { lazy, Suspense } from "react";
import { HeroBackground } from "./components/HeroBackground";
import { Certifications } from "./components/Certifications";
import { GitHubActivity } from "./components/GitHubActivity";
import { PageFrame } from "./components/PageFrame";
import { PixelBuddy } from "./components/PixelBuddy";
import { ProjectCard } from "./components/ProjectCard";
import { PrivacyPolicy } from "./components/PrivacyPolicy";
import { Reveal } from "./components/Reveal";
import { Stack } from "./components/Stack";
import { ROUTES, resolveRoute } from "./config/routes";
import { projects } from "./data/projects";
import { PrivacyChoiceProvider } from "./hooks/useCookieConsent";
import "./styles.css";

const ProjectsPage = lazy(() => import("./pages/ProjectsPage"));
const ProjectPage = lazy(() => import("./pages/ProjectPage"));
const AboutPage = lazy(() => import("./pages/AboutPage"));
const ResourcesPage = lazy(() => import("./pages/ResourcesPage"));
const ContactPage = lazy(() => import("./pages/ContactPage"));
const TypingPage = lazy(() => import("./pages/TypingPage"));
const TrackerPage = lazy(() => import("./pages/TrackerPage"));
const BuddyAssistant = lazy(() =>
  import("./components/BuddyAssistant").then((module) => ({ default: module.BuddyAssistant })),
);

function App() {
  return <PrivacyChoiceProvider><CurrentRoute /></PrivacyChoiceProvider>;
}

function CurrentRoute() {
  const route = resolveRoute(window.location.pathname, projects);
  const content = getRouteContent(route);
  return (
    <PageFrame pathname={route.path} project={route.project} showPresence={route.id === ROUTES.home.id}>
      <Suspense fallback={<main id="top" tabIndex={-1} className="route-loading" aria-live="polite">Loading page…</main>}>
        {content}
      </Suspense>
    </PageFrame>
  );
}

function getRouteContent(route) {
  if (route.id === ROUTES.projects.id) return <ProjectsPage />;
  if (route.id === ROUTES.project.id) return <ProjectPage project={route.project} />;
  if (route.id === ROUTES.about.id) return <AboutPage />;
  if (route.id === ROUTES.resources.id) return <ResourcesPage />;
  if (route.id === ROUTES.contact.id) return <ContactPage />;
  if (route.id === ROUTES.typing.id) return <TypingPage />;
  if (route.id === ROUTES.tracker.id) return <TrackerPage />;
  if (route.id === ROUTES.buddy.id) return <BuddyPage />;
  if (route.id === ROUTES.privacy.id) return <PrivacyPage />;
  return <HomePage />;
}

function HomePage() {
  return (
    <main className="hub-home" id="top">
      <section className="hero hub-hero" aria-labelledby="home-title">
        <HeroBackground />
        <div className="hero-intro">
          <img src="/haniel-molejon-480.webp" alt="" width="48" height="48" decoding="async" />
          <div><span className="hero-name">Haniel Molejon</span><span className="hero-location">IT student in Cebu, Philippines</span></div>
        </div>
        <h1 id="home-title" aria-label="Learning to make useful things with code.">Learning to make<br /><em>useful things</em> with code.</h1>
        <div className="hero-bottom">
          <div>
            <p>I’m a first-year BS Information Technology student building practical Python and automation projects. I’m looking for an internship where I can learn and contribute.</p>
            <span className="availability-pill">Open to internship opportunities</span>
          </div>
          <div className="hero-actions">
            <a className="hero-primary-action" href={ROUTES.projects.path}>Explore projects</a>
            <a className="hero-secondary-action" href={ROUTES.contact.path}>Contact me</a>
          </div>
        </div>
      </section>

      <section className="home-proof-section home-projects" id="work" aria-labelledby="home-projects-title">
        <div className="home-projects-heading">
          <h2 id="home-projects-title">A few things I’ve built.</h2>
          <p>Practical projects, with the thinking and tradeoffs behind them.</p>
        </div>
        <div className="home-project-grid">
          {projects.map((project) => <ProjectCard project={project} headingLevel="h3" key={project.slug} />)}
        </div>
      </section>

      <Reveal><Stack /></Reveal>
      <Reveal><GitHubActivity /></Reveal>
      <Reveal><Certifications /></Reveal>
      <PixelBuddy />
    </main>
  );
}

function PrivacyPage() {
  return (
    <main className="privacy-page" id="top">
      <PrivacyPolicy />
      <a className="privacy-home-link" href={ROUTES.home.path}>Back to portfolio</a>
    </main>
  );
}

function BuddyPage() {
  return (
    <main className="buddy-page" id="top">
      <BuddyAssistant />
      <a className="privacy-home-link" href={ROUTES.home.path}>Back to portfolio</a>
    </main>
  );
}

export default App;
