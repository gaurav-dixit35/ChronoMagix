# Horology Editorial design

## Identity

ChronoMagix pairs a watchmaker’s atelier with a printed timetable: warm parchment surfaces, midnight ink navigation, brass rules and restrained gem colours for status. The interface is calm and precise; dates are always calendar dates and never imply time slots.

## Typography and colour

- Fraunces Variable: display headings and course titles.
- Instrument Sans Variable: interface text, forms and navigation.
- DM Mono: labels, dates and counts.
- CSS custom properties `--cm-*` are the colour source of truth; Tailwind aliases live in `client/tailwind.config.js`.
- Parchment is the canvas; midnight is reserved for navigation and emphasis; brass is a small accent; sapphire indicates primary action; gem colours communicate status/level.

## Components and interaction

The shell uses a persistent sidebar and page header. Courses lead into a master-detail page. Lecture creation is a date-first slide-over; the availability request is aborted when the date changes or drawer unmounts. Lectures have table and week lenses. Date plates, badges, skeletons, empty states, alerts and toasts provide visual cues.

Motion uses restrained route transitions and drawer entrance. CSS reduces animation when `prefers-reduced-motion` is enabled. Focus rings are visible; the drawer handles Escape and traps Tab focus. The app uses semantic forms, labels, table markup, and live regions for toasts/errors.

## Notes

The provided `logo.png` is used only on the login hero; SVG mark and favicon are code-native. Seed course art is generated as SVG data URLs. Light theme only. Production screenshots and responsive measurements are in `docs/screenshots/` and `docs/VISUAL_QA.md`; a full WCAG audit and valid Lighthouse scores remain outstanding.
