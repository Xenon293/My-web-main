import { useEffect, useRef, useState } from "react";
import { ROUTES, normalizePathname } from "../config/routes";
import { siteConfig } from "../config/site";
import { LineIcon } from "./LineIcon";

const primaryLinks = [
  { label: "Projects", href: ROUTES.projects.path, icon: "projects" },
  { label: "About", href: ROUTES.about.path, icon: "about" },
  { label: "Resources", href: ROUTES.resources.path, icon: "resources" },
  { label: "Contact", href: ROUTES.contact.path, icon: "contact" },
];

const utilityLinks = [
  { label: "Ask Buddy", href: ROUTES.buddy.path, icon: "buddy" },
  { label: "Typing Test", href: ROUTES.typing.path, icon: "typing" },
];

export function Nav() {
  const currentPath = normalizePathname(window.location.pathname);
  const isSubpage = currentPath !== ROUTES.home.path;
  const [open, setOpen] = useState(false);
  const menuButtonRef = useRef(null);
  const navRef = useRef(null);
  const [dark, setDark] = useState(() => {
    const saved = localStorage.getItem("theme");
    if (saved === "dark" || saved === "light") return saved === "dark";
    return window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false;
  });

  useEffect(() => {
    document.body.classList.toggle("menu-open", open);
    if (open) navRef.current?.querySelector("a, button")?.focus();
    return () => document.body.classList.remove("menu-open");
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;
    const trapFocus = (event) => {
      if (event.key !== "Tab") return;
      const controls = [...navRef.current.querySelectorAll('a[href], button:not([disabled])')];
      const first = controls[0];
      const last = controls.at(-1);
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", trapFocus);
    return () => window.removeEventListener("keydown", trapFocus);
  }, [open]);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === "Escape" && open) {
        setOpen(false);
        menuButtonRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  const isActive = (href) => {
    if (href === ROUTES.projects.path) {
      return currentPath === href || currentPath.startsWith(ROUTES.project.pathPrefix) || currentPath.startsWith("/work/");
    }
    return currentPath === href;
  };

  const toggleTheme = (event) => {
    const next = !dark;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    const applyTheme = () => {
      setDark(next);
      document.documentElement.dataset.theme = next ? "dark" : "light";
      localStorage.setItem("theme", next ? "dark" : "light");
    };

    if (document.startViewTransition) {
      const transition = document.startViewTransition(applyTheme);
      transition.ready.then(() => {
        const radius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));
        document.documentElement.animate(
          { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
          { duration: 540, easing: "cubic-bezier(.32,.08,.24,1)", pseudoElement: "::view-transition-new(root)" },
        );
      }).catch(() => {});
    } else {
      applyTheme();
    }
  };

  const renderLinks = (links) => links.map((link) => (
    <a
      aria-current={isActive(link.href) ? "page" : undefined}
      href={link.href}
      key={link.href}
      onClick={() => setOpen(false)}
    >
      <LineIcon name={link.icon} size={17} />
      <span>{link.label}</span>
    </a>
  ));

  return (
    <>
      <header className="site-header">
        <a className="wordmark" href={ROUTES.home.path} aria-label={isSubpage ? "Haniel Molejon, portfolio home" : "Haniel Molejon, back to top"}>
          HM<span>.</span>
        </a>
        <div className="nav-actions">
          <button
            ref={menuButtonRef}
            className="menu-button"
            aria-expanded={open}
            aria-controls="site-nav"
            aria-label={open ? "Close navigation menu" : "Open navigation menu"}
            onClick={() => setOpen((value) => !value)}
          >
            {open ? "Close" : "Menu"}
          </button>
        </div>

        <nav ref={navRef} id="site-nav" className={`site-nav ${open ? "is-open" : ""}`} aria-label="Primary navigation">
          <div className="nav-group">
            <span className="nav-group-label">Explore</span>
            {renderLinks(primaryLinks)}
          </div>
          <div className="nav-group nav-secondary">
            <span className="nav-group-label">Utilities</span>
            {renderLinks(utilityLinks)}
          </div>
          <div className="nav-group nav-secondary">
            <span className="nav-group-label">Elsewhere</span>
            <a href="https://github.com/Xenon293" target="_blank" rel="noreferrer" onClick={() => setOpen(false)}>
              <LineIcon name="github" size={17} /><span>GitHub</span>
            </a>
            <a href={siteConfig.instagram} target="_blank" rel="noreferrer" onClick={() => setOpen(false)}>
              <LineIcon name="instagram" size={17} /><span>Instagram</span>
            </a>
            <a href="mailto:hanielvantecil@gmail.com" onClick={() => setOpen(false)}>
              <LineIcon name="contact" size={17} /><span>Email</span>
            </a>
          </div>
          <div className="nav-notes"><span>Student portfolio</span><span>Learning in public</span></div>
          <button type="button" className="theme-toggle" onClick={toggleTheme} aria-label={`Switch to ${dark ? "light" : "dark"} theme`}>
            <LineIcon name={dark ? "sun" : "moon"} size={16} />
            <span>{dark ? "Light theme" : "Dark theme"}</span>
          </button>
        </nav>
      </header>
      <div className={`nav-backdrop ${open ? "is-open" : ""}`} onClick={() => setOpen(false)} aria-hidden="true" />
    </>
  );
}
