# Haniel’s portfolio

This is my personal portfolio site, built with React and Vite. It brings together my projects, technical stack, certifications, learning experiments, contact details, and a small assistant called Buddy.

## Run it locally

You’ll need Node.js 18 or newer and npm.

```bash
npm install
npm run dev
```

Vite will print the local URL in the terminal. The production build can be previewed with:

```bash
npm run build
npm run preview
```

## Environment variables

Create a `.env` file when you want to enable the optional services:

```text
VITE_SITE_URL=https://your-production-domain.example
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
GEMINI_API_KEY=your-server-side-key
```

Variables beginning with `VITE_` are available to the browser. `GEMINI_API_KEY` is used only by the Netlify Function and must stay server-side; do not rename it to `VITE_GEMINI_API_KEY`.

Supabase powers the optional live-presence indicator. It only starts after a visitor accepts optional storage, and the site quietly disables it when the Supabase variables are missing. The complete privacy and cookie policy is available at [`/privacy`](/privacy).

## Buddy

Buddy answers questions about the portfolio and can also help with general educational topics such as programming, science, writing, and mathematics. Its request is handled by the Netlify Function at `/api/ask-buddy`, which calls Gemini using the server-only API key.

## Deployment

The site is configured for Netlify. Set these values in the Netlify site settings:

- `VITE_SITE_URL` (optional when Netlify’s automatic `URL` value is available)
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `GEMINI_API_KEY`

Netlify builds the Vite app and serves the Buddy function from `netlify/functions/ask-buddy.mjs`.

## Project layout

- `src/components/` — reusable interface and interaction pieces
- `src/data/` — portfolio and profile content
- `src/config/` — site settings and lightweight route definitions
- `src/hooks/` — reusable browser-state and behavior hooks
- `src/pages/` — page-level content for lightweight pathname-based navigation
- `netlify/functions/` — server-side endpoints
- `public/` — static assets and search metadata

## Adding a project

Add a project entry to the portfolio data with its case-study details. Repository and demo actions are optional; leave them unset until the exact public URLs are ready. After adding a real resume PDF, set its path in `src/config/site.js` so the resume action can be enabled.
