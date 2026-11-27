# Phase 6: production verification

Verified 27 November 2026 against the production-mode Express process on port 5001, serving the current `client/dist` build and connected to the configured MongoDB database.

## Production server checks

- `npm.cmd --prefix client run build` succeeded. The main JavaScript chunk is 460.49 kB (148.66 kB gzip); CSS is 32.18 kB (7.50 kB gzip).
- Express served `/login`, `/admin/courses`, `/admin/lectures`, `/admin/instructors`, and `/instructor/lectures` as the SPA document with HTTP 200.
- After admin login, `/admin/lectures` loaded directly and survived a hard refresh with the route and authenticated session intact.
- `/api/health` returned JSON with HTTP 200. An unknown `/api` route returned a JSON 404 and did not fall through to the SPA document.
- Static JS, CSS, font, logo, and favicon requests had no failed responses during the browser run. Browser page errors: none.
- Cache headers give Vite's fingerprinted `/assets/` files one year with `immutable`, `robots.txt` one hour, and other public files one day, so crawler rules and unversioned logos do not inherit a year-long immutable cache.
- The production startup synchronized and printed the unique `{ instructor: 1, date: 1 }` index.
- `robots.txt` is served as `text/plain` with HTTP 200. It permits `/login` and disallows `/admin/`, `/instructor/`, and `/api/`; Lighthouse reports the robots audit as passing.

The production browser captures are [`phase6-production-courses.png`](screenshots/phase6-production-courses.png) and [`phase6-production-lectures.png`](screenshots/phase6-production-lectures.png).

## Lighthouse

Captured from the production `/login` route using Lighthouse 13.6.0 CLI and Headless Chrome 158. The run used Lighthouse's mobile Moto G Power (2022) emulation at 412 × 823, simulated network and CPU throttling. Full reports: [HTML](reports/phase6-lighthouse-mobile.report.html) and [JSON](reports/phase6-lighthouse-mobile.report.json). To reproduce the run from PowerShell, use:

```powershell
npx.cmd --yes --package=node@22.19.0 --package=lighthouse@13.6.0 -- lighthouse http://localhost:5001/login --chrome-path="C:\Program Files\Google\Chrome\Application\chrome.exe" --chrome-flags="--headless=new --no-sandbox" --output=html,json --output-path=docs/reports/phase6-lighthouse-mobile --quiet
```

| Category | Score |
|---|---:|
| Performance | 97 |
| Accessibility | 100 |
| Best Practices | 100 |
| SEO | 100 |
| Agentic Browsing (Lighthouse 13 category) | 50 |

| Metric | Result |
|---|---:|
| First Contentful Paint | 0.8 s |
| Largest Contentful Paint | 2.5 s |
| Total Blocking Time | 40 ms |
| Cumulative Layout Shift | 0 |
| Speed Index | 2.7 s |

Lighthouse 13's additional Agentic Browsing score is 50 because it reports missing `llms.txt` and an invalid ARD manifest. Those files are outside the requested app requirements. The successful Lighthouse 13.6.0 run used Node 22.19.0 and Headless Chrome 158.

## Readiness and remaining manual check

The single-service production build, API separation, direct deep links, hard refresh, static assets, and robots file all passed. The Phase 5 report still records a hands-on NVDA, JAWS, or Narrator speech walkthrough as pending; browser accessibility-tree and keyboard checks passed, but speech output was not tested.
