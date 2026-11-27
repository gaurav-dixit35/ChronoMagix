# Horology Editorial design system

## Identity

ChronoMagix combines a watchmaker's atelier with a printed timetable: parchment surfaces, midnight navigation, brass rules and gem colours drawn from the logo. The tone is calm and precise. Dates are calendar dates; the design never implies appointment times.

## Type and colour

- **Fraunces Variable:** display headings, course names and prominent date numerals.
- **Instrument Sans Variable:** interface text, labels, navigation, forms and tables.
- **DM Mono:** dates, counts and small uppercase labels.
- Fonts are self-hosted from Fontsource; no external font request is required.
- CSS custom properties named `--cm-*` in `client/src/index.css` are the source of truth. Tailwind aliases are in `client/tailwind.config.js`.
- Parchment is the page surface, midnight is used for navigation and emphasis, brass is an accent, sapphire marks primary actions, and gem tones distinguish status and course level.

## Named interface patterns

| Pattern | Where it appears | Purpose |
|---|---|---|
| Sidebar and page-header shell | Admin and instructor pages | Persistent navigation and clear page orientation. |
| Course catalog to course detail | Admin course flow | Browse courses, then manage lectures in the selected course. |
| Date-first slide-over | Add lecture drawer | Preserve the course context while choosing a date and available instructor. |
| Availability constraint | Add/edit lecture forms | Show booked instructors as disabled before submission. |
| Course live preview | Add and edit course | Show image and course details while completing the form. |
| Table/week view | Admin lecture list | Two views of the same schedule, with filters in the URL. |
| Date dial | Lecture rows and instructor schedule | Make the date easy to scan without implying a time slot. |
| Skeleton then content | Course cards, tables and schedule | Communicate loading while data is requested. |
| Empty state with action | Lists with no matches or records | Explain the state and offer a relevant next step when possible. |
| Inline validation and server alert | Forms | Keep field errors beside the affected field and preserve server clash messages. |
| Toast feedback | Global success/error feedback | Announce completed actions without replacing local detail. |
| Consequence confirmation | Course and lecture deletion | Explain the destructive effect before confirmation. |
| Role-based navigation | Sidebar and route guard | Show the workspace for the signed-in role; the API enforces roles independently. |
| Responsive table viewport | Narrow lecture and instructor lists | Keep table semantics and allow horizontal scrolling inside the table wrapper. |

## Interaction and accessibility

Route transitions and the lecture drawer use restrained motion. `prefers-reduced-motion` disables the splash orbit and shimmer/toast animation. Visible keyboard focus rings use the brass token. The mobile navigation and confirmation dialogs manage focus and Escape; the lecture drawer is a labelled modal dialog with a focus trap. Form labels, inline error associations, table header scopes, live regions and confirmation semantics are implemented in shared components.

The automated keyboard and accessibility-tree checks passed. A separate speech-output walkthrough using NVDA, JAWS or Narrator remains to be performed. See [Phase 5 QA](PHASE5_QA.md) for the measurements and exact scope.

## Art and QA

The provided hero logo is used on the login page and README; the SVG mark and favicon are vector assets. Seed course illustrations are generated as SVG data URLs. The current product has a light theme. Responsive screenshots live in `docs/screenshots/`; measured production behavior and Lighthouse results are in [Phase 6 QA](PHASE6_QA.md).
