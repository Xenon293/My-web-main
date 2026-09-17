export const ROUTES = Object.freeze({
  home: { id: "home", path: "/", title: null, description: null, indexable: true },
  privacy: {
    id: "privacy", path: "/privacy", title: "Privacy & Cookie Policy",
    description: "How this portfolio uses browser storage, optional presence tracking, and third-party services.", indexable: true,
  },
  buddy: {
    id: "buddy", path: "/buddy", title: "Ask Buddy",
    description: "Ask Haniel's portfolio assistant about his work or get help understanding an educational topic.", indexable: true,
  },
  work: { id: "work", pathPrefix: "/work/", title: "Project case study", indexable: true },
});

export const HOME_SECTIONS = Object.freeze({ top: "top", work: "work", about: "about", focus: "focus", resources: "resources", contact: "contact" });

export function normalizePathname(pathname) {
  return pathname.replace(/\/$/, "") || ROUTES.home.path;
}

export function projectPath(slug) {
  return `${ROUTES.work.pathPrefix}${slug}`;
}

export function homeSectionPath(section, fromSubpage = true) {
  return `${fromSubpage ? ROUTES.home.path : ""}#${section}`;
}

export function resolveRoute(pathname, projects = []) {
  const path = normalizePathname(pathname);
  if (path === ROUTES.privacy.path) return ROUTES.privacy;
  if (path === ROUTES.buddy.path) return ROUTES.buddy;
  if (path.startsWith(ROUTES.work.pathPrefix)) {
    const project = projects.find((item) => projectPath(item.slug) === path);
    if (project) return { ...ROUTES.work, path, project };
  }
  return ROUTES.home;
}

export function sitemapPaths(projects = []) {
  return [ROUTES.home.path, ROUTES.buddy.path, ...projects.map((project) => projectPath(project.slug)), ROUTES.privacy.path];
}
