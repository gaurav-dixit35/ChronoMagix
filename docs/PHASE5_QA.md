# Phase 5: accessibility and visual QA

Verified 27 November 2026 in Chromium against the development app at `http://localhost:5173`, connected to the seeded MongoDB database. The browser checks used reduced-motion emulation where noted.

## Previous-phase recheck

- Client production build succeeds with `npm.cmd --prefix client run build`.
- Backend suite succeeds with `npm.cmd --prefix server test`: 2 files, 11 tests. The output confirms the unique `{ instructor: 1, date: 1 }` index.
- Seeded database reports one admin, six instructors, three courses, and nine lectures.
- Phase 4 browser checks previously covered inline form errors and file type/size validation, dialog keyboard handling and focus return, plus optimistic lecture deletion rollback after a simulated server error.

## Responsive viewport checks

Document and body widths matched the viewport on all checked routes at each required width: 360, 768, 1024, 1280, 1440, and 1536 CSS pixels. No page-level horizontal overflow was found. Narrow lecture tables remain horizontally scrollable within their table wrapper.

| Route | Checked widths | Result |
|---|---|---|
| Login | 360, 768, 1024, 1280, 1440, 1536 | Pass |
| Admin course list and detail | all six | Pass |
| Add and edit course | all six | Pass |
| Admin lecture list | all six | Pass |
| Instructor list | all six | Pass |
| Instructor schedule | all six | Pass |

The 768 px login check found and fixed horizontal overflow. The login columns now use constrained grid tracks and responsive padding in `client/src/phase4.css`.

Screenshots for the main responsive pages are in [`docs/screenshots`](screenshots/): `phase5-login-{360,768,1024,1280,1440,1536}.png`, `phase5-courses-{360,768,1024,1280,1440,1536}.png`, `phase5-lectures-{360,768,1024,1280,1440,1536}.png`, and `phase5-instructors-{360,768,1024,1280,1440,1536}.png`. Add-course screenshots cover 360, 768, and 1280 px. The date-first lecture drawer is captured in [`phase5-lecture-drawer.png`](screenshots/phase5-lecture-drawer.png).

## Keyboard and accessibility checks

- On the 360 px layout, opening the navigation focuses its close button; Shift+Tab wraps to the last menu control; Escape closes the menu, restores focus to the trigger, and removes the closed navigation from the accessibility tree. The trigger's `aria-expanded` and sidebar's `aria-hidden` values update correctly.
- The date-first lecture drawer exposes `role="dialog"`, `aria-modal="true"`, and its labelled heading. Opening it focuses the date field first. Shift+Tab moves to the preceding close control; Escape closes the drawer and returns focus to “Add lecture”.
- Shared form fields associate labels with controls and associate inline errors through `aria-describedby`; errors use alert/status roles. Toasts announce success through a polite live region and errors as alerts. Tables use column headers with `scope="col"`; destructive controls have descriptive names.
- Chromium's accessibility tree audit found 11 interactive controls on the admin lecture page, all with accessible names, and exposed main and navigation landmarks.
- Reduced-motion emulation was checked; the splash orbit, skeleton shimmer, and toast animation are disabled or reduced by the `prefers-reduced-motion` rules.
- Contrast ratios measured for the checked theme pairs: primary text on parchment 16.16:1, muted text on parchment 5.78:1, brass text on parchment 4.80:1, text on midnight 15.71:1, muted text on midnight 7.45:1, and white on the primary button 7.45:1. These checked combinations exceed WCAG AA for normal text.
- Automated DOM/role and keyboard checks were run in Chromium. A separate hands-on NVDA, JAWS, or Narrator session was not available in this run; screen-reader speech output still needs a human assistive-technology walkthrough.

## Browser and build results

- Browser page errors: none across the responsive route matrix and keyboard checks.
- `npm.cmd --prefix client run build`: passed.
- `npm.cmd --prefix server test`: passed, 11/11 tests.
- Required visual widths were checked for horizontal overflow; the results and screenshots above record the checks.

