import { Component, lazy, Suspense, useEffect, useRef, useState } from "react";

const HeroScene = lazy(() => import("./HeroScene"));

function supportsWebGL() {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl2"));
  } catch {
    return false;
  }
}

class SceneBoundary extends Component {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}

export function HeroBackground() {
  const rootRef = useRef(null);
  const intersectsRef = useRef(true);
  const [canRender, setCanRender] = useState(false);
  const [visible, setVisible] = useState(true);
  const [idle, setIdle] = useState(false);

  useEffect(() => {
    const schedule = window.requestIdleCallback || ((callback) => window.setTimeout(callback, 900));
    const cancel = window.cancelIdleCallback || window.clearTimeout;
    const handle = schedule(() => setIdle(true), { timeout: 1600 });
    return () => cancel(handle);
  }, []);

  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 768px)");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateCapability = () => {
      setCanRender(desktop.matches && !reducedMotion.matches && supportsWebGL());
    };
    updateCapability();
    desktop.addEventListener("change", updateCapability);
    reducedMotion.addEventListener("change", updateCapability);
    return () => {
      desktop.removeEventListener("change", updateCapability);
      reducedMotion.removeEventListener("change", updateCapability);
    };
  }, []);

  useEffect(() => {
    const element = rootRef.current;
    if (!element) return undefined;
    const updateVisibility = () => setVisible(intersectsRef.current && !document.hidden);
    const observer = new IntersectionObserver(
      ([entry]) => {
        intersectsRef.current = entry.isIntersecting;
        updateVisibility();
      },
      { rootMargin: "100px" },
    );
    observer.observe(element);
    document.addEventListener("visibilitychange", updateVisibility);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", updateVisibility);
    };
  }, []);

  return (
    <div ref={rootRef} className="hero-background pointer-events-none absolute inset-0" aria-hidden="true">
      <div className="hero-background-fallback" />
      {canRender && visible && idle ? (
        <SceneBoundary>
          <Suspense fallback={null}>
            <HeroScene />
          </Suspense>
        </SceneBoundary>
      ) : null}
    </div>
  );
}
