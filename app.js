const data = window.dashboardData;

const state = {
  geo: "All",
  tier: "All",
  segment: "All",
  search: "",
  accountSegment: "All",
  accountClassification: "All",
  accountArr: "All",
  accountPipeline: "All",
  accountSource: "All",
  accountSort: "Priority"
};

const selectors = {
  metrics: document.querySelector("#metrics"),
  geoFilter: document.querySelector("#geo-filter"),
  tierFilter: document.querySelector("#tier-filter"),
  segmentFilter: document.querySelector("#segment-filter"),
  searchFilter: document.querySelector("#search-filter"),
  mustWinCountryBars: document.querySelector("#must-win-country-bars"),
  mustWinPriorityBars: document.querySelector("#must-win-priority-bars"),
  mustWinStatus: document.querySelector("#must-win-status"),
  territoryBars: document.querySelector("#territory-bars"),
  territoryTable: document.querySelector("#territory-table"),
  territoryCount: document.querySelector("#territory-count"),
  whitespaceTotal: document.querySelector("#whitespace-total"),
  geoGrid: document.querySelector("#geo-grid"),
  segmentGrid: document.querySelector("#segment-grid"),
  accountInsights: document.querySelector("#account-insights"),
  accountSegmentFilter: document.querySelector("#account-segment-filter"),
  accountClassificationFilter: document.querySelector("#account-classification-filter"),
  accountArrFilter: document.querySelector("#account-arr-filter"),
  accountPipelineFilter: document.querySelector("#account-pipeline-filter"),
  accountSourceFilter: document.querySelector("#account-source-filter"),
  accountSortFilter: document.querySelector("#account-sort-filter"),
  accountTable: document.querySelector("#account-table"),
  accountCount: document.querySelector("#account-count")
};

const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0
});

const whole = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 0
});

function formatMoney(value) {
  if (Math.abs(value) >= 1000000000) return `$${(value / 1000000000).toFixed(1)}B`;
  if (Math.abs(value) >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
  if (Math.abs(value) >= 1000) return `$${(value / 1000).toFixed(0)}K`;
  return money.format(value);
}

function formatOptionalMoney(value) {
  if (value === null || value === undefined || value === "") return "Not loaded";
  return formatMoney(value);
}

function formatPercent(value) {
  return `${(value * 100).toFixed(1)}%`;
}

function formatDecimal(value, digits = 0) {
  return whole.format(Number(value).toFixed(digits));
}

function unique(items) {
  return [...new Set(items)].sort();
}

function populateFilters() {
  addOptions(selectors.geoFilter, ["All", ...unique(data.territories.map((item) => item.geo))]);
  addOptions(selectors.tierFilter, ["All", ...unique(data.territories.map((item) => item.tier))]);
  addOptions(selectors.segmentFilter, ["All", ...unique(data.segmentDetails.map((item) => item.segment))]);
  populateAccountFilters();

  selectors.geoFilter.addEventListener("change", () => {
    state.geo = selectors.geoFilter.value;
    render();
  });
  selectors.tierFilter.addEventListener("change", () => {
    state.tier = selectors.tierFilter.value;
    render();
  });
  selectors.segmentFilter.addEventListener("change", () => {
    state.segment = selectors.segmentFilter.value;
    render();
  });
  selectors.searchFilter.addEventListener("input", () => {
    state.search = selectors.searchFilter.value.trim().toLowerCase();
    render();
  });
}

function populateAccountFilters() {
  const accounts = keyAccounts();
  const accountSegments = unique(accounts.flatMap((item) => item.segments));
  const classifications = unique(accounts.map((item) => item.classification));
  const sources = unique(accounts.map((item) => item.source));

  addOptions(selectors.accountSegmentFilter, ["All", ...accountSegments]);
  addOptions(selectors.accountClassificationFilter, ["All", ...classifications]);
  addOptions(selectors.accountArrFilter, ["All", "ARR loaded", "$100K+", "$1M+", "$5M+", "Not loaded"]);
  addOptions(selectors.accountPipelineFilter, ["All", "Pipeline loaded", "$1M+", "$5M+", "Not loaded"]);
  addOptions(selectors.accountSourceFilter, ["All", ...sources]);

  selectors.accountSegmentFilter.addEventListener("change", () => {
    state.accountSegment = selectors.accountSegmentFilter.value;
    render();
  });
  selectors.accountClassificationFilter.addEventListener("change", () => {
    state.accountClassification = selectors.accountClassificationFilter.value;
    render();
  });
  selectors.accountArrFilter.addEventListener("change", () => {
    state.accountArr = selectors.accountArrFilter.value;
    render();
  });
  selectors.accountPipelineFilter.addEventListener("change", () => {
    state.accountPipeline = selectors.accountPipelineFilter.value;
    render();
  });
  selectors.accountSourceFilter.addEventListener("change", () => {
    state.accountSource = selectors.accountSourceFilter.value;
    render();
  });
  selectors.accountSortFilter.addEventListener("change", () => {
    state.accountSort = selectors.accountSortFilter.value;
    render();
  });
}

function addOptions(select, options) {
  select.innerHTML = options.map((option) => `<option value="${escapeAttr(option)}">${option}</option>`).join("");
}

function renderMetrics() {
  const metrics = [
    { label: "Current coverage", value: formatPercent(data.summary.currentCoverage), note: `${formatDecimal(data.summary.accountsInBooks)} / ${formatDecimal(data.summary.totalAccounts)} accounts in books` },
    { label: "Recommended coverage", value: formatPercent(data.summary.recommendedCoverage), note: `+${formatPercent(data.summary.coverageGap)} coverage gap to close` },
    { label: "Whitespace", value: `+${formatDecimal(data.summary.incrementalAccounts)}`, note: "incremental accounts covered at target" },
    { label: "Recommended ADs", value: formatDecimal(data.summary.recommendedAds), note: `${data.summary.managers} managers at the planning ratio` },
    { label: "Book ARR", value: formatMoney(data.summary.bookArr), note: `${formatDecimal(data.summary.customers)} customers in the roll-up` }
  ];

  selectors.metrics.innerHTML = metrics.map((metric) => `
    <article class="metric">
      <span>${metric.label}</span>
      <strong>${metric.value}</strong>
      <p>${metric.note}</p>
    </article>
  `).join("");
}

function renderMustWin() {
  const mustWin = data.mustWin;
  const summary = mustWin.summary;
  selectors.mustWinStatus.textContent = `${formatDecimal(summary.accountsInScope)} must-win accounts · ${formatMoney(summary.currentArrUsd)} current ARR · ${formatMoney(summary.openPipelineUsd)} open pipeline. Generated ${mustWin.generatedAt}; ARR / pipeline snapshots are ${summary.latestArrSnapshot} / ${summary.latestPipelineSnapshot}.`;

  renderMustWinBars(
    selectors.mustWinCountryBars,
    mustWin.countryPipeline,
    "country",
    "pipeline",
    (row) => `${formatMoney(row.pipeline)} pipeline · ${row.accounts} accts`
  );
  renderMustWinBars(
    selectors.mustWinPriorityBars,
    mustWin.priorityBuckets,
    "bucket",
    "pipeline",
    (row) => `${row.accounts} accts · ${formatMoney(row.arr)} ARR`
  );
}

function renderMustWinBars(target, rows, labelKey, valueKey, note) {
  const max = Math.max(...rows.map((row) => Number(row[valueKey] || 0)), 1);
  target.innerHTML = rows.map((row) => {
    const value = Number(row[valueKey] || 0);
    const width = Math.max(value / max * 100, value > 0 ? 4 : 0);
    return `
      <div class="bar-row bar-row--static">
        <span class="bar-row__label">${row[labelKey]}</span>
        <span class="bar-row__value">${formatMoney(value)}</span>
        <span class="bar-row__track"><span class="bar-row__fill" style="width:${width}%"></span></span>
        <small>${note(row)}</small>
      </div>
    `;
  }).join("");
}

function filteredTerritories() {
  return data.territories
    .filter((item) => state.geo === "All" || item.geo === state.geo)
    .filter((item) => state.tier === "All" || item.tier === state.tier)
    .filter((item) => {
      if (state.segment === "All") return true;
      return item.segmentAds[state.segment] > 0;
    })
    .filter((item) => {
      if (!state.search) return true;
      return searchable([
        item.territory,
        item.geo,
        item.tier,
        ...Object.keys(item.segmentAds)
      ]).includes(state.search);
    });
}

function filteredSegments() {
  return data.segmentDetails
    .filter((item) => state.geo === "All" || item.geo === state.geo)
    .filter((item) => state.tier === "All" || item.tier === state.tier)
    .filter((item) => state.segment === "All" || item.segment === state.segment)
    .filter((item) => !state.search || searchable([item.territory, item.geo, item.tier, item.segment]).includes(state.search));
}

function filteredAccounts() {
  return keyAccounts()
    .filter((item) => state.geo === "All" || item.geo === state.geo)
    .filter((item) => state.tier === "All" || item.tier === state.tier)
    .filter((item) => state.segment === "All" || item.segments.includes(state.segment))
    .filter((item) => state.accountSegment === "All" || item.segments.includes(state.accountSegment))
    .filter((item) => state.accountClassification === "All" || item.classification === state.accountClassification)
    .filter((item) => state.accountSource === "All" || item.source === state.accountSource)
    .filter((item) => passesMoneyFilter(item.arr, state.accountArr, "ARR"))
    .filter((item) => passesMoneyFilter(item.pipeline, state.accountPipeline, "Pipeline"))
    .filter((item) => {
      if (!state.search) return true;
      return searchable([
        item.name,
        item.territory,
        item.geo,
        item.tier,
        item.segment,
        item.priority,
        item.classification,
        item.country,
        item.status,
        item.owner,
        item.source
      ]).includes(state.search);
    });
}

function passesMoneyFilter(value, filter, kind) {
  if (filter === "All") return true;
  const loaded = value !== null && value !== undefined && value !== "";
  if (filter === `${kind} loaded`) return loaded;
  if (filter === "Not loaded") return !loaded;
  if (!loaded) return false;
  if (filter === "$100K+") return Number(value) >= 100000;
  if (filter === "$1M+") return Number(value) >= 1000000;
  if (filter === "$5M+") return Number(value) >= 5000000;
  return true;
}

function territoryToGeo(territory) {
  return data.territories.find((item) => item.territory === territory)?.geo || "North";
}

function territoryToTier(territory) {
  return data.territories.find((item) => item.territory === territory)?.tier || "Tier 1";
}

function countryToTerritory(country) {
  const normalized = country.toLowerCase();
  if (normalized.includes("netherlands/uk")) return "UKI";
  if (normalized === "netherlands") return "Netherlands/Belgium/Luxembourg";
  if (normalized.includes("uk") || normalized.includes("ireland")) return "UKI";
  if (normalized.includes("germany")) return "Germany";
  if (normalized.includes("france")) return "France";
  if (normalized.includes("sweden")) return "Sweden";
  if (normalized.includes("spain")) return "Spain";
  if (normalized.includes("switzerland")) return "Switzerland/Austria";
  if (normalized.includes("denmark")) return "Norway/Denmark";
  return country;
}

function mustWinSegment(account) {
  return account.segment || "Enterprise";
}

function keyAccounts() {
  const planningAccounts = data.topAccounts.map((account) => {
    const geo = territoryToGeo(account.territory);
    const tier = territoryToTier(account.territory);
    return {
      source: "Market planning",
      sortGroup: 2,
      rank: account.rank,
      name: account.account,
      territory: account.territory,
      geo,
      tier,
      segment: "Enterprise / Large Enterprise",
      segments: ["Enterprise", "Large Enterprise"],
      priority: account.vertical,
      classification: account.type,
      country: account.country,
      status: account.type,
      owner: account.owner,
      arr: account.arr,
      pipeline: null,
      quarter: null,
      revenueB: account.revenueB,
      employees: account.employees
    };
  });

  const mustWinAccounts = data.mustWin.accounts.map((account) => {
    const territory = countryToTerritory(account.country);
    const geo = territoryToGeo(territory);
    const tier = territoryToTier(territory);
    return {
      source: "Must-win command deck",
      sortGroup: 1,
      rank: account.rank,
      name: account.name,
      territory,
      geo,
      tier,
      segment: mustWinSegment(account),
      segments: [mustWinSegment(account)],
      priority: account.bucket,
      classification: account.bucket,
      country: account.country,
      status: account.quarter || "Execution watch",
      owner: account.owner,
      arr: account.arr,
      pipeline: account.pipeline,
      quarter: account.quarter,
      revenueB: null,
      employees: null
    };
  });

  return [...mustWinAccounts, ...planningAccounts];
}

function searchable(parts) {
  return parts.filter(Boolean).join(" ").toLowerCase();
}

function renderTerritories(items) {
  const sorted = [...items].sort((a, b) => b.incrementalAccounts - a.incrementalAccounts);
  const maxWhitespace = Math.max(...data.territories.map((item) => item.incrementalAccounts));
  const totalWhitespace = sorted.reduce((sum, item) => sum + item.incrementalAccounts, 0);
  const totalAds = sorted.reduce((sum, item) => sum + item.recommendedAds, 0);

  selectors.territoryCount.textContent = `${sorted.length} territories`;
  selectors.whitespaceTotal.textContent = `+${formatDecimal(totalWhitespace)} accounts | ${formatDecimal(totalAds)} ADs`;

  selectors.territoryBars.innerHTML = sorted.map((item) => {
    const width = Math.max(4, item.incrementalAccounts / maxWhitespace * 100);
    return `
      <button class="bar-row" data-territory="${escapeAttr(item.territory)}" title="Filter to ${escapeAttr(item.territory)}">
        <span class="bar-row__label">${item.territory}</span>
        <span class="bar-row__track"><span class="bar-row__fill" style="width:${width}%"></span></span>
        <span class="bar-row__value">+${formatDecimal(item.incrementalAccounts)}</span>
      </button>
    `;
  }).join("");

  document.querySelectorAll(".bar-row").forEach((button) => {
    button.addEventListener("click", () => {
      selectors.searchFilter.value = button.dataset.territory;
      state.search = button.dataset.territory.toLowerCase();
      render();
    });
  });

  selectors.territoryTable.innerHTML = sorted.map((item) => `
    <tr>
      <td><strong>${item.territory}</strong></td>
      <td>${item.geo}</td>
      <td>${item.tier}</td>
      <td>${coverageMeter(item.currentCoverage)}</td>
      <td>${formatPercent(item.recommendedCoverage)}</td>
      <td>+${formatDecimal(item.incrementalAccounts)}</td>
      <td>${item.recommendedAds}</td>
      <td>${formatMoney(item.arr)}</td>
    </tr>
  `).join("");
}

function renderGeos() {
  const maxAccounts = Math.max(...data.geos.map((item) => item.incrementalAccounts));
  selectors.geoGrid.innerHTML = data.geos.map((item) => {
    const width = Math.max(4, item.incrementalAccounts / maxAccounts * 100);
    return `
      <button class="geo-tile" data-geo="${escapeAttr(item.geo)}">
        <div>
          <span>${item.geo}</span>
          <strong>${item.recommendedAds} ADs</strong>
        </div>
        <div class="geo-tile__meter"><span style="width:${width}%"></span></div>
        <p>+${formatDecimal(item.incrementalAccounts)} accounts · ${formatMoney(item.arr)} ARR</p>
      </button>
    `;
  }).join("");

  document.querySelectorAll(".geo-tile").forEach((button) => {
    button.addEventListener("click", () => {
      state.geo = button.dataset.geo;
      selectors.geoFilter.value = state.geo;
      render();
    });
  });
}

function renderSegments(items) {
  const sorted = [...items].sort((a, b) => b.whitespace - a.whitespace).slice(0, 12);
  const maxWhitespace = Math.max(...data.segmentDetails.map((item) => item.whitespace));
  selectors.segmentGrid.innerHTML = sorted.map((item) => `
    <article class="segment-tile">
      <div class="segment-tile__topline">
        <span>${item.geo} / ${item.tier}</span>
        <strong>${item.ads} ADs</strong>
      </div>
      <h3>${item.territory} · ${item.segment}</h3>
      <div class="segment-tile__bar">
        <span style="width:${Math.max(4, item.whitespace / maxWhitespace * 100)}%"></span>
      </div>
      <p>+${formatDecimal(item.whitespace)} accounts · ${formatMoney(item.arr)} ARR · ${formatDecimal(item.customers)} customers</p>
    </article>
  `).join("");
}

function renderAccounts(items) {
  const sorted = sortAccounts(items);
  const loadedArr = sorted.filter((item) => item.arr !== null && item.arr !== undefined);
  const loadedPipeline = sorted.filter((item) => item.pipeline !== null && item.pipeline !== undefined);
  const totalArr = loadedArr.reduce((sum, item) => sum + Number(item.arr || 0), 0);
  const totalPipeline = loadedPipeline.reduce((sum, item) => sum + Number(item.pipeline || 0), 0);

  selectors.accountCount.textContent = `${sorted.length} accounts`;

  selectors.accountInsights.innerHTML = [
    { label: "Filtered accounts", value: formatDecimal(sorted.length), note: `${state.geo} geo · ${state.tier} tier · ${state.segment} planning segment` },
    { label: "Loaded ARR", value: formatMoney(totalArr), note: `${loadedArr.length} accounts with ARR loaded` },
    { label: "Open pipeline", value: formatMoney(totalPipeline), note: `${loadedPipeline.length} accounts with pipeline loaded` },
    { label: "Classifications", value: formatDecimal(unique(sorted.map((item) => item.classification)).length), note: unique(sorted.map((item) => item.classification)).join(", ") || "No matching accounts" }
  ].map((item) => `
    <article class="account-insight">
      <span>${item.label}</span>
      <strong>${item.value}</strong>
      <p>${item.note}</p>
    </article>
  `).join("");

  selectors.accountTable.innerHTML = sorted.map((item) => `
    <tr>
      <td><strong>${item.name}</strong><small>#${item.rank} · ${item.country}${item.revenueB ? ` · $${item.revenueB.toFixed(1)}B revenue` : ""}</small></td>
      <td>${item.segment}</td>
      <td><span class="account-pill">${item.classification}</span></td>
      <td>${item.geo}</td>
      <td>${item.territory}</td>
      <td>${formatOptionalMoney(item.arr)}</td>
      <td>${formatOptionalMoney(item.pipeline)}</td>
      <td>${item.owner}</td>
      <td>${item.source}</td>
    </tr>
  `).join("") || `<tr><td colspan="9"><strong>No matching accounts</strong><small>Loosen the account filters or clear the global search.</small></td></tr>`;
}

function sortAccounts(items) {
  return [...items].sort((a, b) => {
    if (state.accountSort === "ARR") return Number(b.arr || -1) - Number(a.arr || -1);
    if (state.accountSort === "Pipeline") return Number(b.pipeline || -1) - Number(a.pipeline || -1);
    if (state.accountSort === "Revenue") return Number(b.revenueB || -1) - Number(a.revenueB || -1);
    if (state.accountSort === "Name") return a.name.localeCompare(b.name);
    if (a.sortGroup !== b.sortGroup) return a.sortGroup - b.sortGroup;
    return (a.rank || 99) - (b.rank || 99);
  });
}

function coverageMeter(value) {
  return `
    <span class="coverage-meter">
      <span class="coverage-meter__track"><span style="width:${Math.min(value * 100, 100)}%"></span></span>
      <span>${formatPercent(value)}</span>
    </span>
  `;
}

function escapeAttr(value) {
  return String(value).replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;");
}

function render() {
  const territories = filteredTerritories();
  const segments = filteredSegments();
  const accounts = filteredAccounts();

  renderTerritories(territories);
  renderSegments(segments);
  renderAccounts(accounts);
}

renderMetrics();
renderMustWin();
renderGeos();
populateFilters();
render();
