import { useEffect, useRef } from "react";

export function useLenisScroll() {
  const lenisRef = useRef(null);

  useEffect(() => {
    if (typeof window === "undefined" || typeof ResizeObserver === "undefined" || !window.matchMedia) {
      return undefined;
    }

    const nativeScrollQueries = [
      window.matchMedia("(prefers-reduced-motion: reduce)"),
      window.matchMedia("(pointer: coarse)"),
      window.matchMedia("(max-width: 1023px)"),
    ];
    let disposed = false;
    let revision = 0;
    let animationFrameId = null;
    const stopFrames = () => {
      if (animationFrameId !== null) cancelAnimationFrame(animationFrameId);
      animationFrameId = null;
    };
    const raf = (time) => {
      lenisRef.current?.raf(time);
      animationFrameId = requestAnimationFrame(raf);
    };
    const syncVisibility = () => {
      stopFrames();
      if (!document.hidden && lenisRef.current) {
        animationFrameId = requestAnimationFrame(raf);
      }
    };
    const destroy = () => {
      stopFrames();
      lenisRef.current?.destroy();
      lenisRef.current = null;
    };
    const syncCapability = async () => {
      const currentRevision = ++revision;
      if (nativeScrollQueries.some((query) => query.matches)) {
        destroy();
        return;
      }
      if (lenisRef.current) return;

      // Mobile and reduced-motion visitors never need to download this enhancement.
      try {
        const { default: Lenis } = await import("lenis");
        if (disposed || currentRevision !== revision) return;
        lenisRef.current = new Lenis({
          duration: 1.2,
          easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
          smoothWheel: true,
        });
        // Keep native fragment navigation for URL history and keyboard focus.
        syncVisibility();
      } catch {
        // Native scrolling remains available if the optional chunk cannot load.
      }
    };

    nativeScrollQueries.forEach((query) => query.addEventListener("change", syncCapability));
    document.addEventListener("visibilitychange", syncVisibility);
    syncCapability();
    return () => {
      disposed = true;
      nativeScrollQueries.forEach((query) => query.removeEventListener("change", syncCapability));
      document.removeEventListener("visibilitychange", syncVisibility);
      destroy();
    };
  }, []);

  return lenisRef;
}
