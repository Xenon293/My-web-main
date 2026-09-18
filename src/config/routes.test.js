import { projects } from "../data/projects";
import { ROUTES, projectPath, resolveRoute, sitemapPaths } from "./routes";

test("resolves static and project routes from one catalog", () => {
  expect(resolveRoute("/privacy/", projects).id).toBe(ROUTES.privacy.id);
  expect(resolveRoute("/projects/", projects).id).toBe(ROUTES.projects.id);
  expect(resolveRoute("/about", projects).id).toBe(ROUTES.about.id);
  expect(resolveRoute(projectPath("pyvault"), projects).project.title).toBe("PyVault");
  expect(resolveRoute("/work/pyvault", projects)).toMatchObject({
    id: ROUTES.project.id,
    path: "/projects/pyvault",
    legacy: true,
  });
  expect(resolveRoute("/missing", projects).id).toBe(ROUTES.home.id);
});

test("creates sitemap paths from route and project data", () => {
  expect(sitemapPaths(projects)).toEqual([
    "/", "/projects", "/projects/pyvault", "/projects/file-organizer", "/about",
    "/resources", "/contact", "/typing", "/buddy", "/privacy",
  ]);
  expect(sitemapPaths(projects).some((path) => path.startsWith("/work/"))).toBe(false);
});
