// Data for the 2-person search page (duo.html). See CLAUDE.md for schema & rules.
// Keep the object valid JSON. Bump "updated" after every change.
window.HOUSING_DATA = {
  "updated": "2026-07-12",
  "page": {
    "id": "duo",
    "title": "London Housing — 2-person search",
    "description": "2 bedrooms, weighted towards Paddington. Price guide £2,200–3,200 pcm total (soft — filter with the slider)."
  },
  "stations": [
    { "key": "paddington", "name": "Paddington", "label": "Padd", "lat": 51.5154, "lng": -0.1755 }
  ],
  "agents": [
    { "id": "chestertons", "name": "Chestertons (Paddington)", "url": "https://www.chestertons.co.uk/property-to-rent/", "coverage": "Paddington, Hyde Park", "status": "planned", "contacted": null, "note": "" },
    { "id": "kayandco", "name": "Kay & Co", "url": "https://www.kayandco.com/", "coverage": "Paddington, Bayswater, Marylebone", "status": "planned", "contacted": null, "note": "" },
    { "id": "winkworth", "name": "Winkworth (Paddington / Maida Vale)", "url": "https://www.winkworth.co.uk/rent", "coverage": "W2, W9", "status": "planned", "contacted": null, "note": "" },
    { "id": "dexters", "name": "Dexters (Paddington)", "url": "https://www.dexters.co.uk/property-lettings", "coverage": "W2 and network-wide", "status": "planned", "contacted": null, "note": "" },
    { "id": "foxtons", "name": "Foxtons (Paddington)", "url": "https://www.foxtons.co.uk/properties-to-rent/", "coverage": "W2 and network-wide", "status": "planned", "contacted": null, "note": "" },
    { "id": "marshparsons", "name": "Marsh & Parsons (Little Venice)", "url": "https://www.marshandparsons.co.uk/rent/", "coverage": "W9, W2, NW6", "status": "planned", "contacted": null, "note": "" },
    { "id": "hamptons", "name": "Hamptons (Maida Vale)", "url": "https://www.hamptons.co.uk/rent/", "coverage": "W9, NW6", "status": "planned", "contacted": null, "note": "" },
    { "id": "quintain", "name": "Quintain Living", "url": "https://www.quintainliving.com/", "coverage": "Wembley Park (BTR)", "status": "planned", "contacted": null, "note": "Build-to-rent: instant availability, sharers welcome" },
    { "id": "uncle", "name": "Uncle", "url": "https://uncle.co.uk/", "coverage": "Wembley, Elephant, Deptford (BTR)", "status": "planned", "contacted": null, "note": "" }
  ],
  "options": [
    {
      "id": "otm-19905748",
      "url": "https://www.onthemarket.com/details/19905748/",
      "source": "OnTheMarket (Hamptons)",
      "address": "Saltram Crescent, Maida Vale",
      "area": "Maida Vale / Queen's Park border, W9",
      "lat": 51.5310, "lng": -0.2060, "approx_location": true,
      "price_pcm": 2400, "price_note": "£554 pw",
      "beds": 2, "baths": 1, "furnished": "part",
      "availability": "live", "status": "inbox",
      "commute_est": { "paddington": 20 },
      "added": "2026-07-12", "last_checked": "2026-07-12", "needs_check": false,
      "available_from": "2026-09-09",
      "summary": "Two-double-bed first-floor flat with separate kitchen — available 9 Sep, near-perfect timing."
    },
    {
      "id": "otm-17803875",
      "url": "https://www.onthemarket.com/details/17803875/",
      "source": "OnTheMarket (Chase Evans)",
      "address": "Clarendon Court, 33 Maida Vale",
      "area": "Maida Vale / Little Venice, W9",
      "lat": 51.5270, "lng": -0.1830, "approx_location": true,
      "price_pcm": 2925, "price_note": "£675 pw",
      "beds": 2, "baths": 2, "furnished": "yes",
      "availability": "live", "status": "inbox",
      "commute_est": { "paddington": 12 },
      "added": "2026-07-12", "last_checked": "2026-07-12", "needs_check": false,
      "available_from": "2026-08-18",
      "summary": "Refurbished 759 sq ft mansion-block flat, 2 baths, balcony, concierge, 6 min walk to Warwick Avenue."
    },
    {
      "id": "otm-19438411",
      "url": "https://www.onthemarket.com/details/19438411/",
      "source": "OnTheMarket (Marsh & Parsons)",
      "address": "Harvist Road, Queen's Park",
      "area": "Queen's Park, NW6",
      "lat": 51.5310, "lng": -0.2130, "approx_location": true,
      "price_pcm": 2800, "price_note": "£646 pw; furnishing not stated — confirm with agent",
      "beds": 2, "baths": 1, "furnished": "unknown",
      "availability": "live", "status": "inbox",
      "commute_est": { "paddington": 18 },
      "added": "2026-07-12", "last_checked": "2026-07-12", "needs_check": false,
      "summary": "Newly refurbished 871 sq ft period conversion moments from Queen's Park (Bakerloo direct to Paddington)."
    },
    {
      "id": "otm-19897236",
      "url": "https://www.onthemarket.com/details/19897236/",
      "source": "OnTheMarket (Marsh & Parsons)",
      "address": "Plympton Road, Brondesbury",
      "area": "Kilburn / Brondesbury, NW6",
      "lat": 51.5390, "lng": -0.1990, "approx_location": true,
      "price_pcm": 2600, "price_note": "£600 pw; furnishing not stated — confirm with agent; added <7 days ago",
      "beds": 2, "baths": 1, "furnished": "unknown",
      "availability": "live", "status": "inbox",
      "commute_est": { "paddington": 20 },
      "added": "2026-07-12", "last_checked": "2026-07-12", "needs_check": false,
      "summary": "First-floor flat with two equal doubles and high-ceilinged open-plan kitchen/reception; Bakerloo walkable."
    },
    {
      "id": "otm-19176368",
      "url": "https://www.onthemarket.com/details/19176368/",
      "source": "OnTheMarket (Foundation Estates)",
      "address": "Gaydon House, Bourne Terrace",
      "area": "Little Venice / Royal Oak, W2",
      "lat": 51.5225, "lng": -0.1900, "approx_location": true,
      "price_pcm": 2200, "price_note": "£508 pw, recently reduced; furnished or unfurnished",
      "beds": 2, "baths": 1, "furnished": "yes",
      "availability": "live", "status": "inbox",
      "commute_est": { "paddington": 8 },
      "added": "2026-07-12", "last_checked": "2026-07-12", "needs_check": false,
      "available_from": "now",
      "summary": "Split-level 710 sq ft 8th-floor flat with balcony near Royal Oak — one stop from Paddington. Cheapest find."
    },
    {
      "id": "otm-19276329",
      "url": "https://www.onthemarket.com/details/19276329/",
      "source": "OnTheMarket (Hamptons)",
      "address": "Amberley Road, Maida Vale",
      "area": "Maida Vale / Little Venice, W9",
      "lat": 51.5235, "lng": -0.1935, "approx_location": true,
      "price_pcm": 3250, "price_note": "£750 pw ALL BILLS INCLUDED — but SHORT-TERM let only; stopgap unless agent agrees long-term",
      "beds": 2, "baths": 2, "furnished": "yes",
      "availability": "live", "status": "inbox",
      "commute_est": { "paddington": 10 },
      "added": "2026-07-12", "last_checked": "2026-07-12", "needs_check": false,
      "available_from": "now",
      "summary": "Duplex with two doubles, two shower rooms and private SE-facing terrace."
    }
  ]
};
