import { siteConfig } from "../config/site";
import { HOME_SECTIONS, ROUTES, homeSectionPath } from "../config/routes";

const exploreLinks = [
  ["Projects", homeSectionPath(HOME_SECTIONS.work)],
  ["About", homeSectionPath(HOME_SECTIONS.about)],
  ["Ask Buddy", ROUTES.buddy.path],
  ["Contact", homeSectionPath(HOME_SECTIONS.contact)],
];

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-footer__grid">
        <div className="site-footer__identity">
          <a className="site-footer__name" href="/" aria-label={`${siteConfig.name} home`}>{siteConfig.name}</a>
          <p>IT student in Cebu building useful projects with Python, automation, Linux, and cybersecurity foundations.</p>
          <span className="site-footer__availability">Open to internship opportunities</span>
        </div>
        <nav className="site-footer__group" aria-label="Footer navigation">
          <h2>Explore</h2>
          <ul>{exploreLinks.map(([label, href]) => <li key={label}><a href={href}>{label}</a></li>)}</ul>
        </nav>
        <div className="site-footer__group">
          <h2>Connect</h2>
          <ul>
            <li><a href={`mailto:${siteConfig.email}`}>Email</a></li>
            <li><a href={siteConfig.github} target="_blank" rel="noreferrer">GitHub <span aria-hidden="true">↗</span></a></li>
          </ul>
        </div>
        <nav className="site-footer__group" aria-label="Policies and privacy controls">
          <h2>Privacy</h2>
          <ul><li><a href={ROUTES.privacy.path}>Privacy &amp; Cookie Policy</a></li></ul>
          <p className="site-footer__privacy-note">Optional presence is used only after consent.</p>
        </nav>
      </div>
      <div className="site-footer__bottom">
        <span>© {new Date().getFullYear()} {siteConfig.name}</span>
        <span>Built with React + Vite</span>
      </div>
    </footer>
  );
}
