import { useEffect } from "react";
import { siteConfig } from "../config/site";

const routeMetadata = {
  "/": { title: siteConfig.title, description: siteConfig.description },
  "/privacy": {
    title: `Privacy & Cookie Policy — ${siteConfig.name}`,
    description: "How this portfolio uses browser storage, optional presence tracking, and third-party services.",
  },
};

function setMeta(selector, attributes) {
  let element = document.head.querySelector(selector);
  if (!element) {
    element = document.createElement("meta");
    document.head.append(element);
  }
  Object.entries(attributes).forEach(([name, value]) => element.setAttribute(name, value));
}

export function getRouteMetadata(pathname, project) {
  if (project) return {
    title: `${project.title} case study — ${siteConfig.name}`,
    description: project.description,
  };
  return routeMetadata[pathname] || routeMetadata["/"];
}

export function Seo({ pathname, project }) {
  useEffect(() => {
    const metadata = getRouteMetadata(pathname, project);
    const canonical = new URL(pathname, siteConfig.siteUrl).href;
    const image = new URL(siteConfig.socialImage, siteConfig.siteUrl).href;
    document.title = metadata.title;
    setMeta('meta[name="description"]', { name: "description", content: metadata.description });
    setMeta('meta[property="og:title"]', { property: "og:title", content: metadata.title });
    setMeta('meta[property="og:description"]', { property: "og:description", content: metadata.description });
    setMeta('meta[property="og:type"]', { property: "og:type", content: "profile" });
    setMeta('meta[property="og:url"]', { property: "og:url", content: canonical });
    setMeta('meta[property="og:image"]', { property: "og:image", content: image });
    setMeta('meta[name="twitter:card"]', { name: "twitter:card", content: "summary" });
    let link = document.head.querySelector('link[rel="canonical"]');
    if (!link) {
      link = document.createElement("link");
      link.rel = "canonical";
      document.head.append(link);
    }
    link.href = canonical;
  }, [pathname, project]);
  return null;
}
