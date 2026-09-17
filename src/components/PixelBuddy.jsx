import { useEffect, useRef, useState } from "react";
import { ROUTES } from "../config/routes";

export function PixelBuddy() {
  const sectionRef = useRef(null);
  const [progress, setProgress] = useState(0);
  const [mood, setMood] = useState("hello");
  const [prop, setProp] = useState("");
  const [pixels, setPixels] = useState(0);
  const lastSection = useRef("");

  useEffect(() => {
    let frame;
    let idleTimer;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const box = sectionRef.current?.getBoundingClientRect();
        if (!box) return;
        setProgress(Math.max(0, Math.min(1, (window.innerHeight - box.top) / (window.innerHeight + box.height))));
        clearTimeout(idleTimer);
        setMood("happy");
        idleTimer = setTimeout(() => setMood("sleepy"), 1800);
        const visible = [...document.querySelectorAll("section[id]")].find((item) => {
          const rect = item.getBoundingClientRect();
          return rect.top < window.innerHeight * 0.65 && rect.bottom > window.innerHeight * 0.35;
        });
        if (visible?.id && visible.id !== lastSection.current) {
          lastSection.current = visible.id;
          setPixels((value) => Math.min(value + 1, 8));
          setMood("point");
          setProp(visible.id === "work" ? "terminal" : visible.id === "resources" ? "book" : "");
        }
      });
    };
    const celebrate = () => { setMood("celebrate"); setProp("sparkles"); };
    const shortcut = (event) => {
      if ((event.key === "/" || (event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey))) && !["INPUT", "TEXTAREA"].includes(document.activeElement?.tagName)) {
        event.preventDefault();
        window.location.assign(ROUTES.buddy.path);
      }
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("typing-complete", celebrate);
    window.addEventListener("keydown", shortcut);
    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(idleTimer);
      window.removeEventListener("scroll", update);
      window.removeEventListener("typing-complete", celebrate);
      window.removeEventListener("keydown", shortcut);
    };
  }, []);

  return (
    <section ref={sectionRef} className="pixel-interlude" aria-label="A small pixel study buddy">
      <div className={`pixel-stage mood-${mood}`} style={{ "--scroll-progress": progress }}>
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
