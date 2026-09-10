import { useState, useEffect, useRef } from "react";

const links = [
  { label: "About", href: "#about", icon: "↳" },
  { label: "Work", href: "#work", icon: "▣" },
  { label: "Focus", href: "#focus", icon: "⌁" },
  { label: "Resources", href: "#resources", icon: "✦" },
  { label: "Contact", href: "#contact", icon: "✉" },
];

export function Nav() {
  const isSubpage = window.location.pathname !== "/";
  const [open, setOpen] = useState(false);
  const menuButtonRef = useRef(null);
  const navRef = useRef(null);
  const [dark, setDark] = useState(() => {
    const saved = localStorage.getItem("theme");
    if (saved) return saved === "dark";
    return window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false;
  });

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (open) {
      document.body.classList.add("menu-open");
      navRef.current?.querySelector("a, button")?.focus();
    } else {
      document.body.classList.remove("menu-open");
    }
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

  // Close menu on Escape key
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape" && open) {
        setOpen(false);
        menuButtonRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  const playTone = () => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(620, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(980, ctx.currentTime + 0.12);

      gain.gain.setValueAtTime(0.0001, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.035, ctx.currentTime + 0.008);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.16);

      osc.connect(gain).connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.17);
    } catch {
      // Audio context might be restricted in some environments
    }
  };

  const toggle = (e) => {
    playTone();
    const next = !dark;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;

    const applyTheme = () => {
      setDark(next);
      document.documentElement.dataset.theme = next ? "dark" : "light";
      localStorage.setItem("theme", next ? "dark" : "light");
    };

    if (document.startViewTransition) {
      const transition = document.startViewTransition(applyTheme);
      transition.ready
        .then(() => {
          const radius = Math.hypot(
            Math.max(x, window.innerWidth - x),
            Math.max(y, window.innerHeight - y),
          );
          document.documentElement.animate(
            {
              clipPath: [
                `circle(0px at ${x}px ${y}px)`,
                `circle(${radius}px at ${x}px ${y}px)`,
              ],
            },
            {
              duration: 540,
              easing: "cubic-bezier(.32,.08,.24,1)",
              pseudoElement: "::view-transition-new(root)",
            },
          );
        })
        .catch(() => {});
    } else {
      document.documentElement.classList.add(
        "theme-swoosh",
        next ? "to-dark" : "to-light",
      );
      setTimeout(applyTheme, 80);
      setTimeout(
        () =>
          document.documentElement.classList.remove(
            "theme-swoosh",
            "to-dark",
            "to-light",
          ),
        620,
      );
    }
  };

  return (
    <>
      <header className="site-header">
        <a
          className="wordmark"
          href={isSubpage ? "/" : "#top"}
          aria-label={isSubpage ? "HM. — Haniel Molejon, portfolio home" : "HM. — Haniel Molejon, back to top"}
        >
          HM<span>.</span>
        </a>

        <div className="nav-actions">
          <button
            ref={menuButtonRef}
            className="menu-button"
            aria-expanded={open}
            aria-controls="site-nav"
            aria-label={open ? "Close navigation menu" : "Open navigation menu"}
            onClick={() => setOpen(!open)}
          >
            {open ? "Close" : "Menu"}
          </button>
        </div>

        <nav
          ref={navRef}
          id="site-nav"
          className={`site-nav ${open ? "is-open" : ""}`}
          aria-label="Primary navigation"
        >
          <div className="nav-group">
            <span className="nav-group-label">Explore</span>
            {links.map((link) => (
              <a
                key={link.href}
                href={isSubpage ? `/${link.href}` : link.href}
                onClick={() => setOpen(false)}
              >
                <span className="nav-icon" aria-hidden="true">
                  {link.icon}
                </span>
                {link.label}
              </a>
            ))}
          </div>

          <div className="nav-group nav-secondary">
            <span className="nav-group-label">Elsewhere</span>
            <a
              href="https://github.com/Xenon293"
              target="_blank"
              rel="noreferrer"
              onClick={() => setOpen(false)}
            >
              <span className="nav-icon">↗</span>
              GitHub
            </a>
            <a
              href="mailto:hanielvantecil@gmail.com"
              onClick={() => setOpen(false)}
            >
              <span className="nav-icon">@</span>
              Email
            </a>
          </div>

          <div className="nav-notes">
            <span>Student portfolio</span>
            <span>Learning in public</span>
          </div>

          <button
            type="button"
            className="theme-toggle"
            onClick={toggle}
            aria-label={`Switch to ${dark ? "light" : "dark"} theme`}
          >
            {dark ? "☼  Light theme" : "☾  Dark theme"}
          </button>
        </nav>
      </header>

      {/* Backdrop for closing mobile navigation drawer */}
      <div
        className={`nav-backdrop ${open ? "is-open" : ""}`}
        onClick={() => setOpen(false)}
        aria-hidden="true"
      />
    </>
  );
}
