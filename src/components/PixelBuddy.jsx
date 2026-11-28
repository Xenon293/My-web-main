import { useEffect, useRef, useState } from "react";
import { ROUTES } from "../config/routes";

export function PixelBuddy() {
  const sectionRef = useRef(null);
  const stageRef = useRef(null);
  const [active, setActive] = useState(false);
  const [mood, setMood] = useState("hello");
  const [prop, setProp] = useState("");
  const [pixels, setPixels] = useState(0);
  const lastSection = useRef("");

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return undefined;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let inView = typeof IntersectionObserver === "undefined";
    let animating = false;
    let frame = null;
    let idleTimer;
    const update = () => {
      if (!animating || frame !== null) return;
      frame = requestAnimationFrame(() => {
        frame = null;
        const box = section.getBoundingClientRect();
        const progress = Math.max(0, Math.min(1, (window.innerHeight - box.top) / (window.innerHeight + box.height)));
        // Position is transient animation data; updating it should not render React.
        stageRef.current?.style.setProperty("--scroll-progress", String(progress));
        clearTimeout(idleTimer);
        setMood("happy");
        idleTimer = setTimeout(() => setMood("sleepy"), 1800);
      });
    };
    const syncActivity = () => {
      animating = inView && !motion.matches && !document.hidden;
      setActive(animating);
      if (animating) update();
      else {
        if (frame !== null) cancelAnimationFrame(frame);
        frame = null;
        clearTimeout(idleTimer);
      }
    };
    const visibilityObserver = typeof IntersectionObserver === "undefined" ? null : new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      syncActivity();
    });
    visibilityObserver?.observe(section);
    syncActivity();
    motion.addEventListener("change", syncActivity);
    document.addEventListener("visibilitychange", syncActivity);
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      visibilityObserver?.disconnect();
      if (frame !== null) cancelAnimationFrame(frame);
      clearTimeout(idleTimer);
      motion.removeEventListener("change", syncActivity);
      document.removeEventListener("visibilitychange", syncActivity);
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  useEffect(() => {
    // Track discoveries with browser visibility notifications, without scanning
    // every section's layout on each scroll event.
    const sectionObserver = typeof IntersectionObserver === "undefined" ? null : new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting || entry.target.id === lastSection.current) continue;
        lastSection.current = entry.target.id;
        setPixels((value) => Math.min(value + 1, 8));
        setMood("point");
        setProp(entry.target.id === "work" ? "terminal" : entry.target.id === "resources" ? "book" : "");
      }
    }, { threshold: .15 });
    document.querySelectorAll("section[id]").forEach((section) => sectionObserver?.observe(section));
    const celebrate = () => { setMood("celebrate"); setProp("sparkles"); };
    const shortcut = (event) => {
      const editing = document.activeElement?.closest('input, textarea, select, [contenteditable="true"], [role="textbox"]');
      if ((event.key === "/" || (event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey))) && !editing) {
        event.preventDefault();
        window.location.assign(ROUTES.buddy.path);
      }
    };
    window.addEventListener("typing-complete", celebrate);
    window.addEventListener("keydown", shortcut);
    return () => {
      sectionObserver?.disconnect();
      window.removeEventListener("typing-complete", celebrate);
      window.removeEventListener("keydown", shortcut);
    };
  }, []);

  return (
    <section ref={sectionRef} className="pixel-interlude" data-paused={!active} aria-label="A small pixel study buddy">
      <div ref={stageRef} className={`pixel-stage mood-${mood}`}>
        <div className="pixel-grid" aria-hidden="true" />
        <div className="pixel-shadow" aria-hidden="true" />
        <a className="pixel-buddy-button" href={ROUTES.buddy.path} aria-label="Open Ask Buddy on its own page">
          <div className="pixel-buddy" aria-hidden="true">
            <span className="buddy-antenna" /><span className="buddy-head"><i /><i /></span>
            <span className="buddy-body"><b /><b /></span><span className="buddy-foot left" /><span className="buddy-foot right" />
          </div>
        </a>
        {prop === "terminal" && <span className="buddy-prop terminal-prop">&gt;_</span>}
        {prop === "book" && <span className="buddy-prop book-prop">book</span>}
        {prop === "sparkles" && <span className="buddy-prop sparkles-prop">* *</span>}
        <div className="buddy-pixels" role="img" aria-label={`${pixels} progress pixels collected`}>{"*".repeat(pixels)}</div>
        <div className="pixel-caption"><span>x 01</span><span>ask buddy</span></div>
      </div>
    </section>
  );
}
