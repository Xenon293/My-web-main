import { lazy, Suspense } from "react";
import { HeroBackground } from "./components/HeroBackground";
import { Certifications } from "./components/Certifications";
import { GitHubActivity } from "./components/GitHubActivity";
import { PageFrame } from "./components/PageFrame";
import { PixelBuddy } from "./components/PixelBuddy";
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
      <Suspense fallback={<main className="route-loading" aria-live="polite">Loading page…</main>}>
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
  if (route.id === ROUTES.buddy.id) return <BuddyPage />;
  if (route.id === ROUTES.privacy.id) return <PrivacyPage />;
  return <HomePage />;
}

function HomePage() {
  return (
    <main className="hub-home" id="top">
      <Reveal as="section" className="hero hub-hero">
        <HeroBackground />
        <div className="eyebrow">IT student · Cebu, Philippines</div>
        <h1 aria-label="Learning to make useful things with code.">Learning to make<br /><em>useful things</em> with code.</h1>
        <div className="hero-bottom">
          <div>
            <p>I’m Haniel Molejon, a first-year BS Information Technology student building practical Python and automation projects while looking for an internship where I can learn, contribute, and grow.</p>
            <span className="availability-pill">Open to internship opportunities</span>
          </div>
          <div className="hero-actions">
            <a className="hero-primary-action" href={ROUTES.projects.path}>Explore projects</a>
            <a className="hero-secondary-action" href={ROUTES.contact.path}>Contact me</a>
          </div>
        </div>
      </Reveal>

      <PixelBuddy />

      <Reveal><GitHubActivity /></Reveal>
      <Reveal><Stack /></Reveal>
      <Reveal><Certifications /></Reveal>
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
