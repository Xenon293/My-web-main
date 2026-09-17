# Portfolio domain glossary

- **Privacy choice**: The visitor's decision to accept or reject optional browser storage. One shared module owns the current value, persistence, and cross-tab synchronization.
- **Page frame**: The shared presentation around each route: metadata, navigation, optional presence, footer, cookie controls, and smooth-scrolling lifecycle.
- **Route catalog**: The browser-neutral source of public paths and route metadata used by rendering, navigation, SEO, and sitemap generation.
- **Presence**: The optional, consent-gated estimate of active visitors. It remains unavailable until Privacy choice is accepted and valid Supabase configuration exists.
- **Buddy**: The portfolio and educational assistant exposed on the dedicated `/buddy` route and backed by the Netlify function.
