import { readFile, writeFile } from "node:fs/promises";

const rawUrl = process.env.URL || process.env.VITE_SITE_URL || "http://localhost:4173";
const siteUrl = rawUrl.replace(/\/$/, "");
const indexPath = new URL("../dist/index.html", import.meta.url);
const html = await readFile(indexPath, "utf8");
await writeFile(indexPath, html.replaceAll("__SITE_URL__", siteUrl));
await writeFile(new URL("../dist/robots.txt", import.meta.url), `User-agent: *\nAllow: /\nSitemap: ${siteUrl}/sitemap.xml\n`);
await writeFile(new URL("../dist/sitemap.xml", import.meta.url), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${siteUrl}/</loc></url><url><loc>${siteUrl}/work/pyvault</loc></url><url><loc>${siteUrl}/work/file-organizer</loc></url><url><loc>${siteUrl}/privacy</loc></url></urlset>\n`);
