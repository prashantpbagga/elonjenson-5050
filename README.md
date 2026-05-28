# OCI Services — Website Redesign

A modern, accessible redesign concept for the Overseas Citizen of India (OCI)
services portal (current site: `ociservices.gov.in`).

## What's in here

- `index.html` — single-page redesign covering hero, services, eligibility,
  process, status tracker, application start, FAQ, and contact.
- `styles.css` — design system with tokens, responsive grid, components.
- `app.js` — interactive eligibility checker, mock status tracker, mobile nav,
  rotating announcement ticker.

## Design goals

- **Clear hierarchy.** One primary action ("Start a new application") on the
  hero, with secondary "Track existing application" alongside.
- **Trust by default.** Government-of-India branding (top utility bar, tricolour
  strip, Ashoka-inspired emblem) without the visual clutter of the legacy site.
- **Self-service answers.** Inline eligibility quiz, document checklist, FAQ,
  status tracker — so users don't have to email the helpdesk for basics.
- **Mobile-first.** Most OCI applicants are abroad and on phones — every
  section collapses gracefully under 720px.
- **Accessibility.** Skip link, ARIA labels, focus states, reduced-motion
  support, semantic landmarks, contrast meeting WCAG AA.

## Running locally

It's pure static HTML/CSS/JS — open `index.html` in a browser, or:

```bash
python3 -m http.server 8080
```

Then visit http://localhost:8080.
