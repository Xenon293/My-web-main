import { siteConfig } from "../config/site";
import { ROUTES } from "../config/routes";
import { LineIcon } from "./LineIcon";

const exploreLinks = [
  ["Projects", ROUTES.projects.path],
  ["About", ROUTES.about.path],
  ["Resources", ROUTES.resources.path],
  ["Contact", ROUTES.contact.path],
];

export function Footer({ onPrivacyOpen }) {
  return (
    <footer className="site-footer">
      <div className="site-footer__grid">
        <div className="site-footer__identity">
          <a className="site-footer__name" href={ROUTES.home.path} aria-label={`${siteConfig.name} home`}>{siteConfig.name}</a>
          <p>IT student in Cebu building useful projects with Python, automation, Linux, and cybersecurity foundations.</p>
          <span className="site-footer__availability">Open to internship opportunities</span>
        </div>
        <nav className="site-footer__group" aria-label="Footer navigation">
          <h2>Explore</h2>
          <ul>{exploreLinks.map(([label, href]) => <li key={label}><a href={href}>{label}</a></li>)}</ul>
        </nav>
        <nav className="site-footer__group" aria-label="Portfolio utilities">
          <h2>Utilities</h2>
          <ul>
            <li><a href={ROUTES.buddy.path}>Ask Buddy</a></li>
            <li><a href={ROUTES.typing.path}>Typing Test</a></li>
          </ul>
        </nav>
        <div className="site-footer__group">
          <h2>Connect</h2>
          <ul>
            <li><a href={`mailto:${siteConfig.email}`}>Email</a></li>
            <li><a href={siteConfig.github} target="_blank" rel="noopener noreferrer">GitHub <LineIcon name="arrowUpRight" size={14} /></a></li>
            <li><a href={siteConfig.instagram} target="_blank" rel="noopener noreferrer">Instagram <LineIcon name="arrowUpRight" size={14} /></a></li>
            <li><a href={ROUTES.privacy.path} onClick={onPrivacyOpen}>Privacy</a></li>
          </ul>
        </div>
      </div>
      <div className="site-footer__bottom">
        <span>© {new Date().getFullYear()} {siteConfig.name}</span>
        <span>Built with React + Vite</span>
      </div>
    </footer>
  );
}
