import { useEffect, useRef } from "react";
import Lenis from "lenis";

export function useLenisScroll() {
  const lenisRef = useRef(null);

  useEffect(() => {
    // Skip in SSR, tests, reduced motion, or touch/mobile where native scroll feels better
    const prefersReducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const coarsePointer = window.matchMedia?.("(pointer: coarse)").matches;
    const narrowViewport = window.matchMedia?.("(max-width: 1023px)").matches;
    if (
      typeof window === "undefined" ||
      typeof ResizeObserver === "undefined" ||
      prefersReducedMotion ||
      coarsePointer ||
      narrowViewport
    ) {
      return undefined;
    }

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.5,
    });

    lenisRef.current = lenis;

    let animationFrameId;
    function raf(time) {
      lenis.raf(time);
      animationFrameId = requestAnimationFrame(raf);
    }
    animationFrameId = requestAnimationFrame(raf);

    // Intercept internal hash links (#work, #about, #contact, etc.) for smooth inertia scrolling
    const handleAnchorClick = (event) => {
      const anchor = event.target.closest('a[href^="#"]');
      if (!anchor) return;
      const href = anchor.getAttribute("href");
      if (!href || href === "#") return;
      const targetElement = document.querySelector(href);
      if (targetElement) {
        event.preventDefault();
        lenis.scrollTo(targetElement, { duration: 1.2 });
      }
    };

    document.addEventListener("click", handleAnchorClick);

    return () => {
      document.removeEventListener("click", handleAnchorClick);
      cancelAnimationFrame(animationFrameId);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  return lenisRef;
}
