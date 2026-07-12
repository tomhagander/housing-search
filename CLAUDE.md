# London Housing Search — Agent Instructions

This file is the source of truth for **intent**. Any agent (Claude session, subagent, scheduled task) working in this repo must read this first and follow it.

## Purpose

Tom and friends are looking for a rental in London, move-in **mid-September 2026**. This repo tracks candidate properties across multiple *scenarios* (living constellations), provides a shared visual overview (`index.html`), and documents where and how to search (`playbook.md`).

## People

- **Tom** (owner of this repo, tom.hagander@gmail.com for git/alerts) — works from Paddington. Budget comfortable up to ~£1,500 pcm/person, upper end.
- **Jack** — looking for work, location-flexible, capped ~£1,200 pcm.
- **Agnes + Nils** (couple, share a room) — work near Liverpool Street, happy to pay ~£1,500 pcm/person for quality.
- **Oskar + Isabel** (couple, share a room) — same as Agnes/Nils.

## Scenarios

Each scenario is a **completely separate page with its own data file**, so Tom can share each search with only the relevant people (6-person page with everyone, 2-person page only with the second person). Never cross-link the pages or merge their data. More scenarios may be added later (e.g. a 4-person constellation) — add a new `data-<id>.js` + `<id>.html` pair reusing `tracker.js`/`styles.css`.

| Scenario | Page | Data |
|---|---|---|
| `six` | `index.html` | `data-six.js` |
| `duo` | `duo.html` | `data-duo.js` |

Current scenarios:

1. **`six`** — all 6 together. 4+ bedrooms (2 couple rooms, 2 singles; unequal room sizes are a *feature* — enables unequal rent split so Jack pays less). 2+ bathrooms. Furnished. ~30 min door-to-door to BOTH Liverpool Street and Paddington (soft — 35–40 min OK for a great place). Price guide £6,000–9,200 pcm total, but price is NEVER a hard constraint.
2. **`duo`** — Tom + Jack, 2-bed, Paddington-weighted, cheaper. Broad price range, guide ~£2,200–3,200 pcm total.

## Division of labour — CRITICAL

- **Agents find and triage. Tom evaluates. Never the other way around.**
- Agents may add options (status `inbox`) and may enforce only *hard* constraints at intake: bedroom count, bathroom count, furnished, and rough commute zone.
- Status flow: `inbox` (agent-added, awaiting Tom) → `promising` (Tom: worth a closer look) → `shortlist` → `viewing` → `rejected`.
- **Price is soft.** Never exclude an option on price. The tracker has a price filter; Tom applies it himself.
- **Err on the side of inclusion.** Tom would rather manually reject a few bad options than miss a good one. When unsure whether something qualifies: include it.
- Agents must NEVER set status to `rejected` or remove options. Only Tom moves options between `inbox` / `shortlist` / `viewing` / `rejected`.
- Exception: agents may set `availability: "gone"` when a listing is confirmed let/removed (keep the record, don't delete it).
- **Privacy on pages (Tom's decision 2026-07-12):** the HTML pages must NOT display personal names, per-person budgets, rent-split reasoning, or friend comments. Comments/notes functionality was removed entirely — do not re-add it. Friends' remarks may inform Tom's own triage but are not stored in the tracker.

## Data model

Each page's `data-<scenario>.js` is its canonical data store: `window.HOUSING_DATA = { updated, page: {title, description}, stations, options, agents }`. They are `.js` files (not `.json`) so the pages work from both `file://` and GitHub Pages without CORS issues. Keep each object valid JSON inside the assignment.

`stations`: `[{key, name, label, lat, lng}]` — commute anchors shown on the map (`six`: Liverpool Street + Paddington; `duo`: Paddington only). `commute_est` keys must match station keys.

Option fields: `id` (slug, e.g. `otm-18665143`), `url`, `source`, `address`, `area`, `lat`/`lng` (approximate is fine, set `approx_location: true`; `null` if unknown → shown in list without a map pin), `price_pcm` (number or null), `price_note`, `beds`, `baths`, `furnished` (`"yes"|"no"|"part"|"unknown"`), `availability` (`"live"|"gone"|"unknown"`), `status` (`"inbox"|"promising"|"shortlist"|"viewing"|"rejected"`), `commute_est` (minutes per station key, agent estimates — `null` if unknown), `added`, `last_checked`, `needs_check` (true when metadata is incomplete), `available_from` (optional), `summary` (one line; details live on the listing site — do NOT copy listings wholesale).

Agent (agency outreach) fields: `id`, `name`, `url`, `coverage`, `status` (`"planned"|"contacted"|"responded"`), `contacted` (date or null), `note`. Rendered in the page's "Agencies" tab. Only Tom sends outreach; agents may draft.

After editing a data file, bump its `updated`. `tracker.js`/HTML need no changes when data changes.

## Sourcing

- Sources, agencies, saved-search recipes and area shortlists live in `playbook.md`. Consult it before any sweep; add newly discovered sources to it.
- **Scraping stance:** Rightmove/Zoopla/OTM prohibit scraping — do not write scrapers. Acceptable: interactive browsing (Claude in Chrome tools), `web_fetch` of individual listing pages, and (future) parsing portal alert emails.
- Savills (search.savills.com) and some agency sites are client-rendered — `web_fetch` returns an empty shell. Use browser tools for those.
- On sweeps: dedupe against existing `options` by URL before adding.

## Future intent (documented now, not yet enabled)

- **Scheduled daily sweeps** adding matches to inbox, with a short email digest to tom.hagander@gmail.com only when there are new items. Automated email is deliberately NOT part of the first iteration.
- **Portal email alerts → inbox parsing** as the primary automated channel (ToS-clean), browsing sweeps as secondary.
- **Hosting:** GitHub Pages under Tom's account (tom.hagander@gmail.com). The repo is already structured for it — push and enable Pages, no build step.
- Possible **agent outreach**: Claude drafts requirement sheets/emails to letting agents; Tom sends them. Log contacts in `playbook.md`.
