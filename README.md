# London Housing Search

Tracker for a London rental search (move-in mid-September 2026). Two independent searches, each on its own page:

- **`index.html`** — the 6-person search (4+ beds, near both Liverpool Street & Paddington)
- **`duo.html`** — the 2-person search (2 beds, Paddington side)

The pages are deliberately separate (own data, own map anchors, no cross-links) so each can be shared with only the relevant people.

## Using a page

- **Listings tab** — map + list; every card links out to the original listing. Filters: price slider (price is a soft constraint), min beds, status, availability.
- **Agencies tab** — which letting agencies we plan to contact / have contacted.
- **Queue chips** at the top show what's left to do: new inbox items to triage, incomplete entries, stale entries.

Statuses: **inbox** (newly found, unreviewed) → **promising** → **shortlist** → **viewing** → **rejected**. "Gone" = listing was let/removed (kept for reference).

## Files

- `index.html` / `duo.html` — the two pages
- `data-six.js` / `data-duo.js` — their data (one record per property + agency outreach list)
- `tracker.js`, `styles.css` — shared page logic and styling
- `playbook.md` — where we search: portals, agencies, saved-search recipes, target areas
- `CLAUDE.md` — instructions for AI agents working on this repo

## Hosting (GitHub Pages)

No build step. Push the repo, then Settings → Pages → deploy from `main`, root. The 6-person page is the site root; the 2-person page is at `/duo.html`. Note: on a free GitHub plan, Pages requires the repo to be **public** — anyone with the link (or browsing the repo) can see both pages and the data files.
