export const ROUTES = Object.freeze({
  home: { id: "home", path: "/", title: null, description: null, indexable: true },
  projects: {
    id: "projects", path: "/projects", title: "Projects",
    description: "Practical Python, automation, and software projects by Haniel Molejon.", indexable: true,
  },
  project: { id: "project", pathPrefix: "/projects/", title: "Project case study", indexable: true },
  about: {
    id: "about", path: "/about", title: "About",
    description: "About Haniel Molejon, an IT student in Cebu learning software development, Linux, automation, and cybersecurity.", indexable: true,
  },
  resources: {
    id: "resources", path: "/resources", title: "Learning Resources",
    description: "Learning resources Haniel uses for programming, computer science, Linux, and security foundations.", indexable: true,
  },
  contact: {
    id: "contact", path: "/contact", title: "Contact",
    description: "Contact Haniel Molejon about internships, projects, feedback, or collaboration.", indexable: true,
  },
  typing: {
    id: "typing", path: "/typing", title: "Typing Test",
    description: "A focused typing speed and accuracy test built by Haniel Molejon.", indexable: true,
  },
  buddy: {
    id: "buddy", path: "/buddy", title: "Ask Buddy",
    description: "Ask Haniel's portfolio assistant about his work or get help understanding an educational topic.", indexable: true,
  },
  privacy: {
    id: "privacy", path: "/privacy", title: "Privacy & Cookie Policy",
    description: "How this portfolio uses browser storage, optional presence tracking, and third-party services.", indexable: true,
  },
});

const STATIC_ROUTES = [ROUTES.projects, ROUTES.about, ROUTES.resources, ROUTES.contact, ROUTES.typing, ROUTES.buddy, ROUTES.privacy];
const LEGACY_WORK_PREFIX = "/work/";

export function normalizePathname(pathname) {
  return pathname.replace(/\/+$/, "") || ROUTES.home.path;
}

export function projectPath(slug) {
  return `${ROUTES.project.pathPrefix}${slug}`;
}

export function resolveRoute(pathname, projects = []) {
  const path = normalizePathname(pathname);
  if (path === ROUTES.home.path) return ROUTES.home;
  const staticRoute = STATIC_ROUTES.find((route) => route.path === path);
  if (staticRoute) return staticRoute;

  const legacy = path.startsWith(LEGACY_WORK_PREFIX);
  const prefix = legacy ? LEGACY_WORK_PREFIX : ROUTES.project.pathPrefix;
  if (path.startsWith(prefix)) {
    const slug = path.slice(prefix.length);
    const project = projects.find((item) => item.slug === slug);
    if (project) return { ...ROUTES.project, path: projectPath(project.slug), requestedPath: path, project, legacy };
  }
  return ROUTES.home;
}

export function sitemapPaths(projects = []) {
  return [
    ROUTES.home.path,
    ROUTES.projects.path,
    ...projects.map((project) => projectPath(project.slug)),
    ROUTES.about.path,
    ROUTES.resources.path,
    ROUTES.contact.path,
    ROUTES.typing.path,
    ROUTES.buddy.path,
    ROUTES.privacy.path,
  ];
}
