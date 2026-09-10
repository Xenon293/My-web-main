import "@testing-library/jest-dom/vitest";

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query) => ({ matches: false, media: query, onchange: null, addEventListener() {}, removeEventListener() {}, dispatchEvent() { return false; } }),
});

class IntersectionObserverMock {
  observe() {}
  disconnect() {}
  unobserve() {}
}

window.IntersectionObserver = IntersectionObserverMock;
