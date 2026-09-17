import { projects } from "../data/projects";
import { ROUTES, projectPath, resolveRoute, sitemapPaths } from "./routes";

test("resolves static and project routes from one catalog", () => {
  expect(resolveRoute("/privacy/", projects).id).toBe(ROUTES.privacy.id);
  expect(resolveRoute(projectPath("pyvault"), projects).project.title).toBe("PyVault");
  expect(resolveRoute("/missing", projects).id).toBe(ROUTES.home.id);
});

test("creates sitemap paths from route and project data", () => {
  expect(sitemapPaths(projects)).toEqual(["/", "/buddy", "/work/pyvault", "/work/file-organizer", "/privacy"]);
});
