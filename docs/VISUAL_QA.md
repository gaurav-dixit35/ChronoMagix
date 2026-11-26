# Production visual QA

Verified against the production Express server serving `client/dist` using headless Chrome.

## Build and browser checks

- `npm run build` succeeds; client bundle is 122.36 kB gzipped.
- Login and course catalogue rendered with zero browser console or page errors.
- `/login` and nested app paths return the SPA document from Express.
- Course grid layout and document width:

| Viewport | Course columns | Document width | Result |
|---:|---:|---:|---|
| 360 | 1 | 360 | Pass |
| 768 | 2 | 768 | Pass |
| 1024 | 3 | 1024 | Pass |
| 1280 | 3 | 1280 | Pass |
| 1440 | 3 | 1440 | Pass |
| 1536 | 4 | 1536 | Pass |

- Admin lecture page document width also matched each tested viewport (360, 768, 1024, 1280, 1440 and 1536); the table itself scrolls inside its wrapper on narrow screens.
- Instructor screen at 360 px had no page-level horizontal overflow.

Screenshots in this folder include login, course grid at every tested width, course detail, the date-first lecture drawer, week view, and instructor schedule at desktop and mobile widths.

## Lighthouse

The user supplied a valid Lighthouse 12.8.2 mobile report captured 27 November 2026 at 04:18 GMT+5:30 (Moto G Power emulation, slow 4G, Chromium 158):

| Category | Score |
|---|---:|
| Performance | 96 |
| Accessibility | 100 |
| Best Practices | 100 |
| SEO | 92 |

Reported metrics: FCP 2.1 s, LCP 2.4 s, TBT 50 ms, CLS 0.019 and Speed Index 2.1 s. The report flags invalid `robots.txt`. A valid robots file has now been added; rerun Lighthouse against this updated build to verify the SEO score. The original report also noted 2,868 KiB total payload. The provided hero logo was 2.71 MB and has been optimized to about 302 KiB, so performance/payload figures should also be refreshed. Earlier local Lighthouse CLI attempts failed with `NO_NAVSTART`; use the user's working Chrome CLI workflow for the updated report.
