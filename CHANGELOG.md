# Changelog

## Phase 4: polish (P2)
- Removed GSAP, ScrollTrigger and Lenis. The page now uses native scrolling, CSS fades of 250ms or less, and about 90 lines of plain JavaScript. Page weight dropped by roughly 130 KB and scrolling is no longer hijacked.
- Only one loop remains: the six-step walkthrough, which plays only while visible and pauses on hover.
- Removed the stat count-up so no visitor ever sees a false `0`; the real values are written in the HTML.
- Accent colour is now used only for calls to action and key numbers. Everything else is ink on paper.
- Mobile: 44px tap targets, no horizontal scroll (checked at 504px and 1440px), scrolling nav row, sticky "Email me" button after the hero.
- Added cookie-less analytics hooks (email click, copy, LinkedIn, GitHub, demo run, case open). They do nothing until a Plausible or GoatCounter script is added (TODO in `index.html`).
- Deleted dead CSS from earlier designs.

## Phase 3: pitch and structure (P1)
- New headline: "I find revenue bottlenecks and build the systems that fix them."
- Hero reduced to one status line, one credibility line, two buttons and three stats, each linked to its measurement note.
- Work now leads with the GTM capstone (flagship), followed by the three earlier projects with a one-line "GTM lens" each. Stack chips list only tools used.
- Merged "How I build" and the interactive demo into one section.
- Replaced "Range" with "What I can own for you" (three deliverables per lane, honest status).
- Added a grouped tools grid. Removed the scrolling ticker.
- SEO and sharing: meta description under 155 characters, canonical URL, Open Graph and Twitter cards with a purpose-built 1200x630 image, favicon, JSON-LD `Person`, `robots.txt`, `sitemap.xml`, 404 page.
- Accessibility: skip link, visible focus outlines, small grey text now passes WCAG AA contrast.
- Photo re-encoded to 43 KB WebP with a 68 KB JPG fallback.

## Phase 2: credibility fixes (P0)
- Content no longer depends on JavaScript: case studies, lanes, walkthrough log, stats, contact details all render without scripts.
- Removed every placeholder `href="#"`; removed the dead "Book a call" button until a booking link exists.
- Added "How this was measured" notes to every headline number, using only facts supplied by Anushka.
- Reworded "live engine" to "interactive demo" / "working simulation" everywhere.
- One wording for the $1M figure: "estimated yearly profit impact".
- Removed the Demo Day claims; rewrote the demo note so it no longer contradicts the case study.
- Orange role labelled full-time; NAGP spelled out; research paper linked to SSRN.

## Still open (marked `TODO(anushka)` in the code, never shown to visitors)
- Booking link (Cal.com or Calendly) for the primary "Book a 30-min call" button.
- Accuracy metric name, baseline period and calculation year for the forecasting case; catalog count and date range; hours per report for the KPI reporting case.
- HubSpot and Salesforce verification links and exact titles.
- Proficiency level (Daily / Proficient / Familiar) for each tool.
- "What I'd do next" and an architecture diagram or Loom for the flagship case.
- Testimonials (section stays hidden until real ones are added), resume PDF, analytics account, optional custom domain.
