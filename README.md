# Haniel Molejon — Portfolio

A personal portfolio built with React, Vite, and plain CSS. The site presents Haniel's projects, learning focus, resources, typing test, Pixel Buddy assistant, and contact flow.

## Requirements

- Node.js 18 or newer
- npm

## Local development

```bash
npm install
npm run dev
```

Create a `.env` file for the optional services:

```text
VITE_SITE_URL=https://your-production-domain.example
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
GEMINI_API_KEY=your-server-side-key
```

The Supabase variables power the anonymous live-presence indicator. The Gemini key is used only by the Netlify Function and must never be prefixed with `VITE_` or exposed in client code.

## Production build

```bash
npm run build
npm run preview
```

The production files are generated in `dist/`.

## Supabase presence setup

Create a `presence` table with `id` and `last_seen` columns, enable row-level security, and add policies that allow anonymous clients to update a session row and read the active count. The client uses temporary anonymous IDs and stores no personal information.

## Netlify deployment

Connect the repository to Netlify and set these environment variables in the site settings:

- `VITE_SITE_URL` (optional on Netlify; its automatic `URL` value is used by the production build)
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `GEMINI_API_KEY`

Netlify automatically detects the Vite build. The Gemini endpoint is available at `/api/ask-buddy` through `netlify/functions/ask-buddy.mjs`.

## Project structure

- `src/components/` — reusable page and interaction components
- `src/data/` — portfolio content
- `src/lib/` — external service clients
- `netlify/functions/` — server-side functions
- `public/` — static assets

## Adding a project

Add a project object to `src/data/projects.js` with its case-study copy and optional `preview`, `repository`, and `demo` values. Unavailable actions remain hidden. Set `resumePath` in `src/config/site.js` after adding a real resume PDF.
