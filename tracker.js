/* Shared tracker logic. Each page loads its own data file (window.HOUSING_DATA)
   with: { updated, page: {title, description}, stations: [{key,name,label,lat,lng}],
   options: [...], agents: [...] }. See CLAUDE.md for the schema. */
(function () {
  var DATA = window.HOUSING_DATA;
  var STATUSES = ["inbox", "promising", "shortlist", "viewing", "rejected"];
  var STATUS_COLORS = { inbox: "#d97706", promising: "#7c3aed", shortlist: "#2563eb", viewing: "#059669", rejected: "#9ca3af" };

  // ---- pending status changes (stored locally until applied to the data file) ----
  var PAGE_ID = (DATA.page && DATA.page.id) || "page";
  var LS_KEY = "housing-status-overrides-" + PAGE_ID;
  var overrides = {};
  try { overrides = JSON.parse(localStorage.getItem(LS_KEY) || "{}"); } catch (e) { overrides = {}; }
  // self-heal: drop overrides that no longer differ from (or refer to) the data file
  Object.keys(overrides).forEach(function (id) {
    var opt = DATA.options.find(function (o) { return o.id === id; });
    if (!opt || opt.status === overrides[id]) delete overrides[id];
  });
  function saveOverrides() {
    try { localStorage.setItem(LS_KEY, JSON.stringify(overrides)); } catch (e) {}
  }
  saveOverrides();
  // ---- pending data-check notes (free text, same copy/paste flow) ----
  var CK_KEY = "housing-check-notes-" + PAGE_ID;
  var checks = {};
  try { checks = JSON.parse(localStorage.getItem(CK_KEY) || "{}"); } catch (e) { checks = {}; }
  // self-heal: drop notes whose option is gone or was touched since (last_checked changed)
  Object.keys(checks).forEach(function (id) {
    var opt = DATA.options.find(function (o) { return o.id === id; });
    if (!opt || (opt.last_checked || null) !== checks[id].base) delete checks[id];
  });
  function saveChecks() {
    try { localStorage.setItem(CK_KEY, JSON.stringify(checks)); } catch (e) {}
  }
  saveChecks();
  function setCheck(id) {
    var opt = DATA.options.find(function (o) { return o.id === id; });
    if (!opt) return;
    var existing = checks[id] ? checks[id].note : "";
    var t = window.prompt(
      'Data check for "' + opt.address + '" — write what you found, e.g. "still live", "gone/let", "price now £6,400", "actually 2 baths, available 1 Sep". Leave empty to clear.',
      existing
    );
    if (t === null) return;
    t = t.trim();
    if (!t) delete checks[id]; else checks[id] = { note: t, base: opt.last_checked || null };
    saveChecks();
    renderPending();
    render();
  }
  function effStatus(o) { return overrides[o.id] || o.status; }
  function setStatus(id, s) {
    var opt = DATA.options.find(function (o) { return o.id === id; });
    if (!opt) return;
    if (opt.status === s) delete overrides[id]; else overrides[id] = s;
    saveOverrides();
    renderPending();
    render();
  }
  function changesBlob() {
    return "Apply to data-" + PAGE_ID + ".js: set statuses per 'changes'; for each 'checks' entry update the option's fields per the note, set last_checked to today, clear needs_check if resolved; bump 'updated'.\n" +
      JSON.stringify({
        page: PAGE_ID,
        changes: Object.keys(overrides).map(function (id) {
          var opt = DATA.options.find(function (o) { return o.id === id; });
          return { id: id, from: opt ? opt.status : "?", to: overrides[id] };
        }),
        checks: Object.keys(checks).map(function (id) {
          return { id: id, note: checks[id].note };
        })
      }, null, 1);
  }
  function renderPending() {
    var bar = document.getElementById("pendingbar");
    var n = Object.keys(overrides).length + Object.keys(checks).length;
    if (!n) { bar.style.display = "none"; bar.innerHTML = ""; return; }
    bar.style.display = "";
    bar.innerHTML = "<b>" + n + "</b> pending update" + (n > 1 ? "s" : "") +
      " (saved only in this browser) " +
      '<button id="copyChanges">Copy for Claude</button>' +
      '<button id="discardChanges">Discard</button>' +
      '<span id="copyDone" style="display:none"> copied ✓</span>';
    document.getElementById("copyChanges").onclick = function () {
      var txt = changesBlob();
      function done() {
        var el = document.getElementById("copyDone");
        if (el) el.style.display = "";
      }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(txt).then(done, function () { window.prompt("Copy this:", txt); });
      } else {
        window.prompt("Copy this:", txt);
      }
    };
    document.getElementById("discardChanges").onclick = function () {
      if (window.confirm("Discard all pending status changes and data-check notes?")) {
        overrides = {};
        checks = {};
        saveOverrides();
        saveChecks();
        renderPending();
        render();
      }
    };
  }
  var state = {
    view: "listings",
    priceMax: 0,
    minBeds: 0,
    statuses: { inbox: true, promising: true, shortlist: true, viewing: true, rejected: false },
    hideGone: false,
    q: ""
  };

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function fmtPrice(o) {
    if (o.price_pcm == null) return "£? pcm";
    return "£" + o.price_pcm.toLocaleString("en-GB") + " <small>pcm</small>";
  }
  function daysSince(dateStr) {
    if (!dateStr) return 9999;
    return Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
  }

  // ---------- shell ----------
  document.title = DATA.page.title;
  var app = document.getElementById("app");
  app.innerHTML =
    '<header>' +
    "<h1>" + esc(DATA.page.title) + "</h1>" +
    '<div class="sub">' + esc(DATA.page.description) + " · data updated " + esc(DATA.updated) + "</div>" +
    '<div class="viewtabs" id="viewtabs"></div>' +
    '<div class="pendingbar" id="pendingbar" style="display:none"></div>' +
    '<div class="queue" id="queue"></div>' +
    '<div class="filters" id="filters">' +
    '<label>Max price <input type="range" id="priceMax" min="0" max="12000" step="100"> <span id="priceMaxLabel"></span></label>' +
    '<label>Min beds <select id="minBeds"><option value="0">any</option><option value="2">2+</option><option value="3">3+</option><option value="4">4+</option><option value="5">5+</option></select></label>' +
    '<span class="statuschips" id="statusChips"></span>' +
    '<label><input type="checkbox" id="hideGone"> hide gone</label>' +
    '<label>Search <input type="text" id="q" placeholder="area, address, source…" size="16"></label>' +
    '<span id="count" style="margin-left:auto;color:var(--muted)"></span>' +
    "</div>" +
    "</header>" +
    '<main class="listings" id="listingsView"><div id="list"></div><div id="map"></div></main>' +
    '<main class="agencies" id="agenciesView" style="display:none"><table class="agtable"><thead><tr>' +
    '<th>Agency</th><th>Coverage</th><th>Status</th><th>Contacted</th><th>Notes</th></tr></thead><tbody id="agbody"></tbody></table></main>' +
    "<footer>Details live on the linked listing sites — this page is only the overview. Data is maintained in the repo's data file.</footer>";

  // ---------- view tabs ----------
  var vt = document.getElementById("viewtabs");
  function buildViewTabs() {
    vt.innerHTML = "";
    [
      { id: "listings", label: "Listings", cnt: DATA.options.length },
      { id: "agencies", label: "Agencies", cnt: (DATA.agents || []).length }
    ].forEach(function (v) {
      var b = document.createElement("button");
      b.className = "vtab" + (state.view === v.id ? " active" : "");
      b.innerHTML = esc(v.label) + ' <span class="cnt">' + v.cnt + "</span>";
      b.onclick = function () {
        state.view = v.id;
        buildViewTabs();
        document.getElementById("listingsView").style.display = v.id === "listings" ? "" : "none";
        document.getElementById("filters").style.display = v.id === "listings" ? "" : "none";
        document.getElementById("agenciesView").style.display = v.id === "agencies" ? "" : "none";
        if (v.id === "listings" && map) map.invalidateSize();
      };
      vt.appendChild(b);
    });
  }

  // ---------- filters ----------
  var chipsEl = document.getElementById("statusChips");
  STATUSES.forEach(function (s) {
    var c = document.createElement("span");
    c.className = "chip" + (state.statuses[s] ? " on" : "");
    c.dataset.s = s;
    c.textContent = s;
    c.onclick = function () { state.statuses[s] = !state.statuses[s]; c.classList.toggle("on"); render(); };
    chipsEl.appendChild(c);
  });
  var priceMaxInput = document.getElementById("priceMax");
  var maxData = Math.max.apply(null, DATA.options.map(function (o) { return o.price_pcm || 0; }).concat([3000]));
  priceMaxInput.max = Math.ceil((maxData + 1000) / 500) * 500;
  priceMaxInput.value = priceMaxInput.max;
  state.priceMax = +priceMaxInput.value;
  function priceLabel() {
    document.getElementById("priceMaxLabel").textContent =
      (+priceMaxInput.value >= +priceMaxInput.max) ? "any" : "£" + (+priceMaxInput.value).toLocaleString("en-GB");
  }
  priceLabel();
  priceMaxInput.oninput = function () { state.priceMax = +this.value; priceLabel(); render(); };
  document.getElementById("minBeds").onchange = function () { state.minBeds = +this.value; render(); };
  document.getElementById("hideGone").onchange = function () { state.hideGone = this.checked; render(); };
  document.getElementById("q").oninput = function () { state.q = this.value.toLowerCase(); render(); };

  function visible() {
    return DATA.options.filter(function (o) {
      if (!state.statuses[effStatus(o)]) return false;
      if (state.hideGone && o.availability === "gone") return false;
      if (o.price_pcm != null && +priceMaxInput.value < +priceMaxInput.max && o.price_pcm > state.priceMax) return false;
      if (state.minBeds && (o.beds == null ? false : o.beds < state.minBeds)) return false;
      if (state.q) {
        var hay = [o.address, o.area, o.source, o.summary].join(" ").toLowerCase();
        if (hay.indexOf(state.q) === -1) return false;
      }
      return true;
    });
  }

  // ---------- queue ----------
  function buildQueue() {
    var opts = DATA.options;
    var inbox = opts.filter(function (o) { return effStatus(o) === "inbox" && o.availability !== "gone"; }).length;
    var check = opts.filter(function (o) { return o.needs_check; }).length;
    var stale = opts.filter(function (o) { return o.availability === "live" && daysSince(o.last_checked) > 14; }).length;
    var agents = DATA.agents || [];
    var contacted = agents.filter(function (a) { return a.status !== "planned"; }).length;
    var q = document.getElementById("queue");
    q.innerHTML = "";
    var items = [
      { n: inbox, label: "in inbox — triage me", ok: inbox === 0 },
      { n: check, label: "incomplete — need a data check", ok: check === 0 },
      { n: stale, label: "not verified in 14+ days", ok: stale === 0 }
    ];
    if (agents.length) items.push({ n: agents.length - contacted, label: "agencies planned, " + contacted + " contacted", ok: agents.length - contacted === 0 });
    items.forEach(function (item) {
      var d = document.createElement("div");
      d.className = "queue-item" + (item.ok ? " ok" : "");
      d.innerHTML = "<b>" + item.n + "</b> " + esc(item.label);
      q.appendChild(d);
    });
  }

  // ---------- map ----------
  var map = L.map("map").setView([51.5155, -0.13], 12);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: "&copy; OpenStreetMap contributors"
  }).addTo(map);
  (DATA.stations || []).forEach(function (st) {
    L.circleMarker([st.lat, st.lng], { radius: 6, color: "#111", weight: 2, fillColor: "#fff", fillOpacity: 1 })
      .addTo(map).bindTooltip(st.name + " station");
  });
  var markerLayer = L.layerGroup().addTo(map);
  var markersById = {};

  function popupHtml(o) {
    return '<div class="popup"><div class="addr">' + esc(o.address) + "</div>" +
      "<div>" + fmtPrice(o) + " · " + (o.beds != null ? o.beds : "?") + " bed / " + (o.baths != null ? o.baths : "?") + " bath</div>" +
      "<div>" + esc(o.area) + "</div>" +
      '<a href="' + esc(o.url) + '" target="_blank" rel="noopener">Open listing ↗</a></div>';
  }

  // ---------- listing cards ----------
  function commuteText(o) {
    if (!o.commute_est) return "";
    var parts = [];
    (DATA.stations || []).forEach(function (st) {
      var v = o.commute_est[st.key];
      if (v != null) parts.push("~" + v + "′ " + st.label);
    });
    return parts.length ? parts.join(" · ") + " (est.)" : "";
  }
  function cardHtml(o) {
    var st = effStatus(o);
    var badges = ['<span class="badge b-' + esc(st) + '">' + esc(st) + "</span>"];
    if (overrides[o.id] || checks[o.id]) badges.push('<span class="badge b-check" title="Not yet saved to the data file">pending</span>');
    if (o.availability === "gone") badges.push('<span class="badge b-gone">gone</span>');
    if (o.availability === "unknown") badges.push('<span class="badge b-check">availability?</span>');
    if (o.needs_check) badges.push('<span class="badge b-check">needs check</span>');
    var statusBtns = '<div class="statusbtns">' + STATUSES.map(function (s) {
      return '<button class="sbtn' + (s === st ? " cur" : "") + '" data-id="' + esc(o.id) + '" data-s="' + esc(s) + '">' + esc(s) + "</button>";
    }).join("") + '<button class="sbtn cbtn" data-id="' + esc(o.id) + '" title="Record what you found when checking this listing’s data">✎ check</button></div>';
    var commute = commuteText(o);
    return '<div class="row1"><span class="addr">' + esc(o.address) + '</span><span class="price">' + fmtPrice(o) + "</span></div>" +
      '<div class="meta"><span>' + (o.beds != null ? o.beds : "?") + " bed · " + (o.baths != null ? o.baths : "?") + " bath</span>" +
      "<span>" + esc(o.area) + "</span>" +
      "<span>" + esc(o.source) + "</span>" +
      (commute ? "<span>" + esc(commute) + "</span>" : "") +
      (o.furnished === "yes" ? "<span>furnished</span>" : o.furnished === "part" ? "<span>part-furnished</span>" : o.furnished === "no" ? "<span>unfurnished</span>" : "") +
      (o.available_from ? "<span>from " + esc(o.available_from) + "</span>" : "") +
      "</div>" +
      '<div class="badges">' + badges.join("") + "</div>" +
      (o.summary ? '<div class="summary">' + esc(o.summary) + "</div>" : "") +
      (o.price_note && o.price_note !== "unknown" ? '<div class="summary" style="color:var(--muted)">' + esc(o.price_note) + "</div>" : "") +
      (checks[o.id] ? '<div class="summary checknote">✎ pending data check: ' + esc(checks[o.id].note) + "</div>" : "") +
      '<div style="margin-top:7px;display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap">' +
      '<a class="out" href="' + esc(o.url) + '" target="_blank" rel="noopener">Open listing ↗</a>' + statusBtns + "</div>";
  }

  // ---------- agencies ----------
  function renderAgents() {
    var body = document.getElementById("agbody");
    body.innerHTML = "";
    (DATA.agents || []).forEach(function (a) {
      var tr = document.createElement("tr");
      tr.innerHTML =
        '<td><a href="' + esc(a.url) + '" target="_blank" rel="noopener">' + esc(a.name) + "</a></td>" +
        "<td>" + esc(a.coverage) + "</td>" +
        '<td><span class="badge ag-' + esc(a.status) + '">' + esc(a.status) + "</span></td>" +
        "<td>" + esc(a.contacted || "—") + "</td>" +
        "<td>" + esc(a.note || "") + "</td>";
      body.appendChild(tr);
    });
  }

  // ---------- render ----------
  var listEl = document.getElementById("list");
  function render() {
    buildQueue();
    var opts = visible();
    document.getElementById("count").textContent = opts.length + " of " + DATA.options.length + " shown";
    listEl.innerHTML = "";
    markerLayer.clearLayers();
    markersById = {};
    if (!opts.length) listEl.innerHTML = '<div class="empty">Nothing matches the current filters.</div>';
    var bounds = [];
    opts.forEach(function (o) {
      var card = document.createElement("div");
      card.className = "card" + (o.availability === "gone" ? " gone" : "");
      card.innerHTML = cardHtml(o);
      card.onclick = function (e) {
        if (e.target.tagName === "A" || e.target.tagName === "BUTTON") return;
        var m = markersById[o.id];
        if (m) { map.setView(m.getLatLng(), Math.max(map.getZoom(), 14)); m.openPopup(); }
      };
      card.querySelectorAll(".sbtn").forEach(function (b) {
        b.onclick = function (e) {
          e.stopPropagation();
          if (b.classList.contains("cbtn")) setCheck(b.dataset.id);
          else setStatus(b.dataset.id, b.dataset.s);
        };
      });
      listEl.appendChild(card);
      if (o.lat != null && o.lng != null) {
        var m = L.circleMarker([o.lat, o.lng], {
          radius: 9, color: "#fff", weight: 2,
          fillColor: STATUS_COLORS[effStatus(o)] || "#666",
          fillOpacity: o.availability === "gone" ? 0.35 : 0.95
        }).bindPopup(popupHtml(o));
        m.addTo(markerLayer);
        markersById[o.id] = m;
        bounds.push([o.lat, o.lng]);
      }
    });
    if (bounds.length) map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
  }

  buildViewTabs();
  renderAgents();
  renderPending();
  render();
})();
