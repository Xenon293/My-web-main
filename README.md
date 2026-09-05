# Haniel Molejon — portfolio

Static React + Vite portfolio using plain CSS.

## Setup

Requires Node.js 18 or newer. Run `npm install`, then `npm run dev`.

Use `npm run build` for the production build and `npm run preview` to preview it locally.

## Deployment

Deploy the generated `dist` directory to any static host such as GitHub Pages, Netlify, or Vercel. The site has no backend or database.

## Adding a project

Add an object to `src/data/projects.js` with `number`, `title`, `description`, `technologies`, `features`, and a real `github` URL. `ProjectCard` renders the shared structure automatically. Add `liveDemo` or `image` to the data and component when a real asset becomes available.
