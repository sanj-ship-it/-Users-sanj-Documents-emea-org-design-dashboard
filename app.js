const data = window.dashboardData;
const salesforce = window.salesforceData || { accounts: [], summary: {}, rollups: {}, meta: {} };

const state = {
  geo: "All",
  country: "All",
  tier: "All",
  segment: "All",
  search: "",
  accountSegment: "All",
  accountClassification: "All",
  accountArr: "All",
  accountPipeline: "All",
  accountSource: "All",
  accountSort: "Priority",
  selectedAccountKey: ""
};

const selectors = {
  metrics: document.querySelector("#metrics"),
  geoFilter: document.querySelector("#geo-filter"),
  countryFilter: document.querySelector("#country-filter"),
  tierFilter: document.querySelector("#tier-filter"),
  segmentFilter: document.querySelector("#segment-filter"),
  searchFilter: document.querySelector("#search-filter"),
  filterChips: document.querySelector("#filter-chips"),
  resetFilters: document.querySelector("#reset-filters"),
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
  accountDetail: document.querySelector("#account-detail"),
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

function isLoaded(value) {
  return value !== null && value !== undefined && value !== "";
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
  addOptions(selectors.countryFilter, ["All", ...unique(salesforce.accounts.map((item) => item.country).filter(Boolean))]);
  addOptions(selectors.tierFilter, ["All", ...unique(data.territories.map((item) => item.tier))]);
  addOptions(selectors.segmentFilter, ["All", ...unique(data.segmentDetails.map((item) => item.segment))]);
  populateAccountFilters();

  selectors.geoFilter.addEventListener("change", () => {
    state.geo = selectors.geoFilter.value;
    render();
  });
  selectors.countryFilter.addEventListener("change", () => {
    state.country = selectors.countryFilter.value;
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
  selectors.resetFilters.addEventListener("click", resetFilters);
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

function resetFilters() {
  state.geo = "All";
  state.country = "All";
  state.tier = "All";
  state.segment = "All";
  state.search = "";
  state.accountSegment = "All";
  state.accountClassification = "All";
  state.accountArr = "All";
  state.accountPipeline = "All";
  state.accountSource = "All";
  state.accountSort = "Priority";
  state.selectedAccountKey = "";

  selectors.geoFilter.value = state.geo;
  selectors.countryFilter.value = state.country;
  selectors.tierFilter.value = state.tier;
  selectors.segmentFilter.value = state.segment;
  selectors.searchFilter.value = state.search;
  selectors.accountSegmentFilter.value = state.accountSegment;
  selectors.accountClassificationFilter.value = state.accountClassification;
  selectors.accountArrFilter.value = state.accountArr;
  selectors.accountPipelineFilter.value = state.accountPipeline;
  selectors.accountSourceFilter.value = state.accountSource;
  selectors.accountSortFilter.value = state.accountSort;

  render();
}

function renderFilterChips() {
  const chips = [
    ["Geo", state.geo],
    ["Country", state.country],
    ["Tier", state.tier],
    ["Planning segment", state.segment],
    ["Search", state.search],
    ["Account segment", state.accountSegment],
    ["Classification", state.accountClassification],
    ["ARR", state.accountArr],
    ["Pipeline", state.accountPipeline],
    ["Source", state.accountSource],
    ["Sort", state.accountSort]
  ].filter(([, value]) => value && value !== "All" && value !== "Priority");

  selectors.filterChips.innerHTML = chips.length
    ? chips.map(([label, value]) => `<span class="filter-chip">${label}: ${value}</span>`).join("")
    : `<span class="filter-chip filter-chip--quiet">All markets · all accounts</span>`;
}

function renderMetrics(accounts) {
  const loadedArr = accounts.filter((item) => isLoaded(item.arr));
  const loadedPipeline = accounts.filter((item) => isLoaded(item.pipeline));
  const currentArr = loadedArr.reduce((sum, item) => sum + Number(item.arr || 0), 0);
  const openPipeline = loadedPipeline.reduce((sum, item) => sum + Math.max(0, Number(item.pipeline || 0)), 0);
  const arrCustomers = loadedArr.filter((item) => Number(item.arr || 0) > 0).length;
  const latestArr = salesforce.meta?.sources?.arr?.latest_snapshot || "latest Salesforce ARR snapshot";
  const latestPipeline = salesforce.meta?.sources?.pipeline?.latest_snapshot || "latest Salesforce pipeline snapshot";
  const metrics = [
    { label: "Salesforce accounts", value: formatDecimal(accounts.length), note: "filtered SFDC matched accounts in scope" },
    { label: "Current ARR", value: formatMoney(currentArr), note: `${formatDecimal(loadedArr.length)} accounts loaded from ${latestArr}` },
    { label: "Open pipeline", value: formatMoney(openPipeline), note: `${formatDecimal(loadedPipeline.length)} accounts loaded from ${latestPipeline}` },
    { label: "ARR customers", value: formatDecimal(arrCustomers), note: "accounts with positive current ARR" },
    { label: "Recommended ADs", value: formatDecimal(data.summary.recommendedAds), note: `${data.summary.managers} managers from the planning model` }
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
  const summary = salesforce.summary || {};
  const generatedAt = salesforce.meta?.generatedAt || mustWin.generatedAt;
  const latestArr = salesforce.meta?.sources?.arr?.latest_snapshot || mustWin.summary.latestArrSnapshot;
  const latestPipeline = salesforce.meta?.sources?.pipeline?.latest_snapshot || mustWin.summary.latestPipelineSnapshot;
  selectors.mustWinStatus.textContent = `${formatDecimal(summary.accounts_in_scope || mustWin.summary.accountsInScope)} Salesforce accounts · ${formatMoney(summary.current_arr_usd || mustWin.summary.currentArrUsd)} current ARR · ${formatMoney(summary.open_pipeline_usd || mustWin.summary.openPipelineUsd)} open pipeline. Generated ${generatedAt}; ARR / pipeline snapshots are ${latestArr} / ${latestPipeline}.`;

  const countryPipeline = (salesforce.rollups?.country || mustWin.countryPipeline).map((row) => ({
    country: row.label || row.country,
    accounts: row.count || row.accounts,
    arr: row.current_arr_usd ?? row.arr,
    pipeline: row.open_pipeline_usd ?? row.pipeline
  }));

  const priorityBuckets = (salesforce.rollups?.priority_bucket || mustWin.priorityBuckets).map((row) => ({
    bucket: row.label || row.bucket,
    accounts: row.count || row.accounts,
    arr: row.current_arr_usd ?? row.arr,
    pipeline: row.open_pipeline_usd ?? row.pipeline
  }));

  renderMustWinBars(
    selectors.mustWinCountryBars,
    countryPipeline,
    "country",
    "pipeline",
    (row) => `${formatMoney(row.pipeline)} pipeline · ${row.accounts} accts`
  );
  renderMustWinBars(
    selectors.mustWinPriorityBars,
    priorityBuckets,
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
    .filter((item) => state.country === "All" || item.territory === countryToTerritory(state.country))
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
  return data.segmentCapacity
    .filter((item) => state.geo === "All" || item.geo === state.geo)
    .filter((item) => state.country === "All" || item.geo === countryToGeo(state.country))
    .filter((item) => capacitySegmentMatches(item.segment, state.segment))
    .filter((item) => !state.search || searchable([item.geo, item.segment, ...territoriesForGeo(item.geo)]).includes(state.search));
}

function capacitySegmentMatches(itemSegment, selectedSegment) {
  if (selectedSegment === "All") return true;
  if (selectedSegment === "Large Enterprise") return itemSegment === "Enterprise";
  return itemSegment === selectedSegment;
}

function territoriesForGeo(geo) {
  return data.territories
    .filter((item) => item.geo === geo)
    .map((item) => item.territory);
}

function filteredAccounts() {
  return keyAccounts()
    .filter((item) => state.geo === "All" || item.geo === state.geo)
    .filter((item) => state.country === "All" || item.country === state.country)
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

function filteredSalesforceAccounts() {
  return salesforceKeyAccounts()
    .filter((item) => state.geo === "All" || item.geo === state.geo)
    .filter((item) => state.country === "All" || item.country === state.country)
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

function accountKey(item) {
  return `${item.source}::${item.rank}::${item.name}`;
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
  return data.territories.find((item) => item.territory === territory)?.geo || "Other";
}

function territoryToTier(territory) {
  return data.territories.find((item) => item.territory === territory)?.tier || "N/A";
}

function countryToTerritory(country) {
  const normalized = country.toLowerCase();
  if (normalized.includes("netherlands/uk")) return "UKI";
  if (normalized.includes("united kingdom") || normalized === "uk") return "UKI";
  if (normalized.includes("ireland")) return "UKI";
  if (normalized.includes("netherlands") || normalized.includes("belgium")) return "Netherlands/Belgium/Luxembourg";
  if (normalized.includes("sweden") || normalized.includes("finland")) return "Sweden";
  if (normalized.includes("norway") || normalized.includes("denmark")) return "Norway/Denmark";
  if (normalized.includes("israel")) return "Israel";
  if (normalized.includes("germany")) return "Germany";
  if (normalized.includes("switzerland") || normalized.includes("austria")) return "Switzerland/Austria";
  if (normalized.includes("poland") || normalized.includes("czech")) return "Poland";
  if (normalized.includes("france")) return "France";
  if (normalized.includes("spain")) return "Spain";
  if (normalized.includes("italy")) return "Italy";
  if (normalized.includes("united arab emirates") || normalized === "uae" || normalized.includes("bahrain") || normalized.includes("cyprus") || normalized.includes("turkiye") || normalized.includes("türkiye") || normalized.includes("turkey")) return "Rest of MEA";
  if (normalized === "netherlands") return "Netherlands/Belgium/Luxembourg";
  return "Other";
}

function countryToGeo(country) {
  return territoryToGeo(countryToTerritory(country));
}

function normalizeCountry(country) {
  if (!country) return "Unknown";
  if (country === "United Kingdom") return "UK";
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
      country: normalizeCountry(account.country),
      status: account.type,
      owner: account.owner,
      arr: account.arr,
      pipeline: null,
      quarter: null,
      revenueB: account.revenueB,
      employees: account.employees
    };
  });

  return [...salesforceKeyAccounts(), ...planningAccounts];
}

function salesforceKeyAccounts() {
  return salesforce.accounts.map((account) => {
    const country = normalizeCountry(account.country);
    const territory = countryToTerritory(country);
    const geo = territoryToGeo(territory);
    const tier = territoryToTier(territory);
    const segment = account.segment || "Enterprise";
    return {
      source: "Salesforce",
      sortGroup: 1,
      rank: account.rank,
      name: account.name,
      territory,
      geo,
      tier,
      segment,
      segments: [segment],
      priority: account.priorityBucket,
      classification: account.priorityBucket,
      country,
      status: account.nearestCloseQuarter || account.status,
      owner: account.owner,
      arr: account.currentArrUsd,
      pipeline: Math.max(0, Number(account.openPipelineUsd || 0)),
      quarter: account.nearestCloseQuarter,
      revenueB: null,
      employees: null
    };
  });
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
  const sorted = [...items].sort((a, b) => b.gapAds - a.gapAds || b.whitespace - a.whitespace);
  const maxGap = Math.max(...data.segmentCapacity.map((item) => item.gapAds), 1);

  selectors.segmentGrid.innerHTML = sorted.map((item) => `
    <article class="segment-tile segment-tile--capacity">
      <div class="segment-tile__topline">
        <span>${item.geo} / ${item.segment}</span>
        <strong>${formatDecimal(item.recommendedAds)} rec ADs</strong>
      </div>
      <h3>${item.gapAds > 0 ? `+${formatDecimal(item.gapAds)}` : "No"} AD gap</h3>
      <div class="segment-tile__bar">
        <span style="width:${Math.max(4, item.gapAds / maxGap * 100)}%"></span>
      </div>
      <dl class="segment-capacity">
        <div><dt>Current ADs</dt><dd>${formatDecimal(item.currentAds)}</dd></div>
        <div><dt>Whitespace</dt><dd>+${formatDecimal(item.whitespace)}</dd></div>
        <div><dt>Customers</dt><dd>${formatDecimal(item.customers)}</dd></div>
        <div><dt>ARR</dt><dd>${formatMoney(item.arr)}</dd></div>
      </dl>
    </article>
  `).join("") || `<article class="segment-tile segment-tile--empty"><h3>No matching segment capacity</h3><p>Clear the segment search to bring the regional headcount model back into view.</p></article>`;
}

function renderAccounts(items) {
  const sorted = sortAccounts(items);
  const loadedArr = sorted.filter((item) => isLoaded(item.arr));
  const loadedPipeline = sorted.filter((item) => isLoaded(item.pipeline));
  const totalArr = loadedArr.reduce((sum, item) => sum + Number(item.arr || 0), 0);
  const totalPipeline = loadedPipeline.reduce((sum, item) => sum + Number(item.pipeline || 0), 0);
  const selectedAccount = selectedOrFirstAccount(sorted);

  selectors.accountCount.textContent = `${sorted.length} accounts`;

  selectors.accountInsights.innerHTML = [
    { label: "Filtered accounts", value: formatDecimal(sorted.length), note: `${state.geo} geo · ${state.country} country · ${state.segment} planning segment` },
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

  renderAccountDetail(selectedAccount);

  selectors.accountTable.innerHTML = sorted.map((item) => `
    <tr class="${accountKey(item) === state.selectedAccountKey ? "is-selected" : ""}" data-account-key="${escapeAttr(accountKey(item))}">
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

  selectors.accountTable.querySelectorAll("tr[data-account-key]").forEach((row) => {
    row.addEventListener("click", () => {
      state.selectedAccountKey = row.dataset.accountKey;
      renderAccounts(filteredAccounts());
    });
  });
}

function selectedOrFirstAccount(items) {
  const selected = items.find((item) => accountKey(item) === state.selectedAccountKey);
  if (selected) return selected;
  const first = items[0];
  state.selectedAccountKey = first ? accountKey(first) : "";
  return first || null;
}

function renderAccountDetail(account) {
  if (!account) {
    selectors.accountDetail.innerHTML = `
      <div>
        <p class="eyebrow">Selected Account</p>
        <h3>No account selected.</h3>
      </div>
      <p>Loosen the filters to bring account records back into scope.</p>
    `;
    return;
  }

  const pipelineNote = isLoaded(account.pipeline) ? `${formatMoney(account.pipeline)} open pipeline` : "No pipeline loaded";
  const arrNote = isLoaded(account.arr) ? `${formatMoney(account.arr)} current ARR` : "No ARR loaded";

  selectors.accountDetail.innerHTML = `
    <div>
      <p class="eyebrow">Selected Account</p>
      <h3>${account.name}</h3>
      <p>${account.classification} · ${account.segment} · ${account.geo} / ${account.territory}</p>
    </div>
    <dl>
      <div><dt>ARR</dt><dd>${arrNote}</dd></div>
      <div><dt>Pipeline</dt><dd>${pipelineNote}</dd></div>
      <div><dt>Owner</dt><dd>${account.owner}</dd></div>
      <div><dt>Source</dt><dd>${account.source}</dd></div>
    </dl>
  `;
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
  const salesforceAccounts = filteredSalesforceAccounts();

  renderMetrics(salesforceAccounts);
  renderTerritories(territories);
  renderSegments(segments);
  renderAccounts(accounts);
  renderFilterChips();
}

renderMustWin();
renderGeos();
populateFilters();
render();
