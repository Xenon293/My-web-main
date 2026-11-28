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
  { label: "Tracker", href: ROUTES.tracker.path, icon: "tracker" },
];

const MOBILE_NAV_QUERY = "(max-width: 1023px)";

export function Nav() {
  const currentPath = normalizePathname(window.location.pathname);
  const isSubpage = currentPath !== ROUTES.home.path;
  const [open, setOpen] = useState(false);
  const [mobileNav, setMobileNav] = useState(() => window.matchMedia?.(MOBILE_NAV_QUERY).matches ?? false);
  const wordmarkRef = useRef(null);
  const menuButtonRef = useRef(null);
  const navRef = useRef(null);
  const scrollLockRef = useRef(0);
  const [dark, setDark] = useState(() => {
    try {
      const saved = localStorage.getItem("theme");
      if (saved === "dark" || saved === "light") return saved === "dark";
    } catch {
      // Theme switching remains available when browser storage is blocked.
    }
    return window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false;
  });

  useEffect(() => {
    document.documentElement.dataset.theme = dark ? "dark" : "light";
  }, [dark]);

  useEffect(() => {
    const media = window.matchMedia?.(MOBILE_NAV_QUERY);
    if (!media) return undefined;
    const syncViewport = () => {
      setMobileNav(media.matches);
      if (!media.matches) setOpen(false);
    };
    syncViewport();
    media.addEventListener("change", syncViewport);
    return () => media.removeEventListener("change", syncViewport);
  }, []);

  useEffect(() => {
    if (!open) return undefined;

    // Read before position: fixed removes the page's scroll offset.
    scrollLockRef.current = window.scrollY;
    document.body.style.top = `-${scrollLockRef.current}px`;
    document.body.classList.add("menu-open");
    navRef.current?.querySelector("a, button")?.focus({ preventScroll: true });

    return () => {
      document.body.classList.remove("menu-open");
      document.body.style.top = "";
      window.scrollTo(0, scrollLockRef.current);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;
    const trapFocus = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
        menuButtonRef.current?.focus({ preventScroll: true });
        return;
      }
      if (event.key !== "Tab") return;
      const controls = [wordmarkRef.current, menuButtonRef.current, ...navRef.current.querySelectorAll('a[href], button:not([disabled])')];
      const first = controls[0];
      const last = controls.at(-1);
      const focusOutsideMenu = !controls.includes(document.activeElement);
      if (event.shiftKey && (document.activeElement === first || focusOutsideMenu)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (document.activeElement === last || focusOutsideMenu)) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", trapFocus);
    return () => window.removeEventListener("keydown", trapFocus);
  }, [open]);

  const closeMenu = () => {
    if (!open) return;
    setOpen(false);
    menuButtonRef.current?.focus({ preventScroll: true });
  };

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
      try {
        localStorage.setItem("theme", next ? "dark" : "light");
      } catch {
        // The current page can still use the selected theme without storage.
      }
    };

    const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (document.startViewTransition && !reducedMotion) {
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
      onClick={closeMenu}
    >
      <LineIcon name={link.icon} size={17} />
      <span>{link.label}</span>
    </a>
  ));

  return (
    <>
      <header className="site-header">
        <a ref={wordmarkRef} className="wordmark" href={ROUTES.home.path} aria-label={isSubpage ? "Haniel Molejon, portfolio home" : "Haniel Molejon, back to top"}>
          HM<span>.</span>
        </a>
        <div className="nav-actions">
          <button
            ref={menuButtonRef}
            type="button"
            className="menu-button"
            aria-expanded={open}
            aria-controls="site-nav"
            aria-label={open ? "Close navigation menu" : "Open navigation menu"}
            onClick={open ? closeMenu : () => setOpen(true)}
          >
            {open ? "Close" : "Menu"}
          </button>
        </div>

        <nav
          ref={navRef}
          id="site-nav"
          className={`site-nav ${open ? "is-open" : ""}`}
          aria-label="Primary navigation"
          aria-hidden={mobileNav && !open ? true : undefined}
          inert={mobileNav && !open ? true : undefined}
        >
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
            <a href="https://github.com/Xenon293" target="_blank" rel="noreferrer" onClick={closeMenu}>
              <LineIcon name="github" size={17} /><span>GitHub</span>
            </a>
            <a href={siteConfig.instagram} target="_blank" rel="noreferrer" onClick={closeMenu}>
              <LineIcon name="instagram" size={17} /><span>Instagram</span>
            </a>
            <a href="mailto:hanielvantecil@gmail.com" onClick={closeMenu}>
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
      <div className={`nav-backdrop ${open ? "is-open" : ""}`} onClick={closeMenu} aria-hidden="true" />
    </>
  );
}
