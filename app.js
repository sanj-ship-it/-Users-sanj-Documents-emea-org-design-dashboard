const data = window.dashboardData;
const salesforce = window.salesforceData || { accounts: [], summary: {}, rollups: {}, meta: {} };
const kepler = window.keplerMetrics || { overallPeriods: [], segments: [] };
const ANALYSIS_SEGMENTS = ["Enterprise", "Digital Natives", "Mid-Market", "Large Enterprise"];

const state = {
  geo: "All",
  country: "All",
  tier: "All",
  segment: "All",
  accountScope: "Top 100 Must-Win",
  search: "",
  accountSegment: "All",
  accountClassification: "All",
  accountVertical: "All",
  accountArr: "All",
  accountPipeline: "All",
  accountSort: "Priority",
  selectedAccountKey: ""
};

const selectors = {
  goalGrid: document.querySelector("#goal-grid"),
  metrics: document.querySelector("#metrics"),
  segmentSummary: document.querySelector("#segment-summary"),
  orgSummary: document.querySelector("#org-summary"),
  heroTitle: document.querySelector("#hero-title"),
  heroLead: document.querySelector("#hero-lead"),
  heroSignalCopy: document.querySelector("#hero-signal-copy"),
  heroMustWinCopy: document.querySelector("#hero-mustwin-copy"),
  mustWinStatusCopy: document.querySelector("#mustwin-status-copy"),
  mustWinBadges: document.querySelector("#mustwin-badges"),
  mustWinKpis: document.querySelector("#mustwin-kpis"),
  mustWinCountryBars: document.querySelector("#mustwin-country-bars"),
  mustWinPriorityBars: document.querySelector("#mustwin-priority-bars"),
  geoFilter: document.querySelector("#geo-filter"),
  countryFilter: document.querySelector("#country-filter"),
  tierFilter: document.querySelector("#tier-filter"),
  segmentFilter: document.querySelector("#segment-filter"),
  accountScopeFilter: document.querySelector("#account-scope-filter"),
  searchFilter: document.querySelector("#search-filter"),
  filterChips: document.querySelector("#filter-chips"),
  resetFilters: document.querySelector("#reset-filters"),
  territoryBars: document.querySelector("#territory-bars"),
  territoryTable: document.querySelector("#territory-table"),
  territoryCount: document.querySelector("#territory-count"),
  whitespaceTotal: document.querySelector("#whitespace-total"),
  geoGrid: document.querySelector("#geo-grid"),
  segmentGrid: document.querySelector("#segment-grid"),
  mustWinStatus: document.querySelector("#must-win-status"),
  accountInsights: document.querySelector("#account-insights"),
  accountSegmentFilter: document.querySelector("#account-segment-filter"),
  accountClassificationFilter: document.querySelector("#account-classification-filter"),
  accountVerticalFilter: document.querySelector("#account-vertical-filter"),
  accountArrFilter: document.querySelector("#account-arr-filter"),
  accountPipelineFilter: document.querySelector("#account-pipeline-filter"),
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

function formatMoney(value) {
  const amount = Number(value || 0);
  if (Math.abs(amount) >= 1000000000) return `$${Math.round(amount / 1000000000)}B`;
  if (Math.abs(amount) >= 1000000) return `$${Math.round(amount / 1000000)}M`;
  if (Math.abs(amount) >= 1000) return `$${(amount / 1000).toFixed(0)}K`;
  return money.format(amount);
}

function formatOptionalMoney(value) {
  if (value === null || value === undefined || value === "") return "Not loaded";
  return formatMoney(value);
}

function formatDecimal(value, digits = 0) {
  return Number(value || 0).toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  });
}

function isLoaded(value) {
  return value !== null && value !== undefined && value !== "";
}

function unique(items) {
  return [...new Set(items.filter(Boolean))].sort();
}

function formatGrowth(value) {
  if (value === null || value === undefined || value === "") return "n/a";
  const amount = Number(value);
  if (!Number.isFinite(amount)) return "n/a";
  return `${amount > 0 ? "+" : ""}${Math.round(amount)}%`;
}

function roundMillions(value) {
  return `$${Math.round(Number(value || 0) / 1000000)}M`;
}

function formatPercentWhole(value) {
  return `${Math.round(Number(value || 0))}%`;
}

function shortDate(value) {
  if (!value) return "n/a";
  const match = String(value).match(/\d{4}-\d{2}-\d{2}/);
  return match ? match[0] : String(value);
}

function periodMetric(periodName) {
  return kepler.overallPeriods.find((item) => item.period === periodName) || {};
}

function mustWinCurrentSummary() {
  const embedded = data.mustWin?.summary || {};
  return {
    accountsInScope: embedded.accountsInScope ?? 0,
    currentArrUsd: embedded.currentArrUsd ?? 0,
    openPipelineUsd: embedded.openPipelineUsd ?? 0,
    loadedArrAccounts: embedded.loadedArrAccounts ?? 0,
    latestArrSnapshot: embedded.latestArrSnapshot,
    latestPipelineSnapshot: embedded.latestPipelineSnapshot
  };
}

function currentTop100Customers() {
  return salesforceKeyAccounts().filter((item) => Number(item.arr || 0) > 0);
}

function top100MustWinAccounts() {
  const accounts = data.mustWin?.accounts || [];
  return accounts.map((account) => {
    const country = normalizeCountry(account.country || "Unknown");
    const territory = countryToTerritory(country);
    const geo = territoryToGeo(territory);
    const tier = territoryToTier(territory);
    const segment = account.segment || "Enterprise";
    const currentArr = Number(account.arr || 0);
    return {
      source: "Top 100 Must-Win",
      sortGroup: 1,
      rank: account.rank,
      name: account.name,
      territory,
      geo,
      tier,
      segment,
      segments: [segment],
      classification: account.bucket || "Top 100",
      vertical: account.vertical || "Top 100",
      priority: account.bucket || "Top 100",
      country,
      owner: account.owner || "Unassigned",
      arr: currentArr,
      pipeline: isLoaded(account.pipeline) ? Number(account.pipeline || 0) : null,
      quarter: account.quarter || "Not loaded",
      productWedge: account.productWedge || "",
      sourceType: account.sourceType || data.mustWin?.source || "Must Win source",
      sourceSnapshotDate: account.sourceSnapshotDate || data.mustWin?.latestReportingDate || data.mustWin?.summary?.latestArrSnapshot,
      lastRefreshedAt: account.lastRefreshedAt || data.mustWin?.sourceGeneratedAt || data.mustWin?.generatedAt,
      execSponsor: account.execSponsor || "",
      accountTag: account.accountTag || "",
      competitiveRisk: account.competitiveRisk || "",
      flags: account.flags || [],
      revenueB: null,
      employees: null,
      accountType: currentArr > 0 ? "Customer" : "Prospect"
    };
  });
}

function addOptions(select, options) {
  select.innerHTML = options.map((option) => `<option value="${escapeAttr(option)}">${option}</option>`).join("");
}

function searchable(parts) {
  return parts.filter(Boolean).join(" ").toLowerCase();
}

function normalizeCountry(country) {
  if (!country) return "Unknown";
  if (country === "United Kingdom") return "UK";
  return country;
}

function territoryToGeo(territory) {
  const match = data.territories.find((item) => item.territory === territory);
  return match ? match.geo : "Other";
}

function territoryToTier(territory) {
  const match = data.territories.find((item) => item.territory === territory);
  return match ? match.tier : "N/A";
}

function countryToTerritory(country) {
  const normalized = country.toLowerCase();
  if (normalized.includes("netherlands/uk")) return "UKI";
  if (normalized.includes("united kingdom") || normalized === "uk") return "UKI";
  if (normalized.includes("ireland")) return "UKI";
  if (normalized.includes("netherlands") || normalized.includes("belgium") || normalized.includes("luxembourg")) return "Netherlands/Belgium/Luxembourg";
  if (normalized.includes("sweden") || normalized.includes("finland")) return "Sweden";
  if (normalized.includes("norway") || normalized.includes("denmark")) return "Norway/Denmark";
  if (normalized.includes("israel")) return "Israel";
  if (normalized.includes("germany")) return "Germany";
  if (normalized.includes("switzerland") || normalized.includes("austria")) return "Switzerland/Austria";
  if (normalized.includes("poland") || normalized.includes("czech")) return "Poland";
  if (normalized.includes("france")) return "France";
  if (normalized.includes("spain")) return "Spain";
  if (normalized.includes("italy")) return "Italy";
  if (
    normalized.includes("united arab emirates") ||
    normalized === "uae" ||
    normalized.includes("bahrain") ||
    normalized.includes("cyprus") ||
    normalized.includes("turkiye") ||
    normalized.includes("türkiye") ||
    normalized.includes("turkey") ||
    normalized.includes("saudi")
  ) return "Rest of MEA";
  return "Other";
}

function countryToGeo(country) {
  return territoryToGeo(countryToTerritory(country));
}

function allAccounts() {
  return [...top100MustWinAccounts(), ...planningAccounts()];
}

function accountUniverse() {
  if (state.accountScope === "Top 100 Must-Win") return top100MustWinAccounts();
  if (state.accountScope === "All Customers") {
    return allAccounts()
      .filter((item) => Number(item.arr || 0) > 0)
      .map((item) => ({
        ...item,
        source: item.source === "Top 100 Must-Win" ? "Top 100 Customer" : item.source
      }));
  }
  return allAccounts();
}

function accountInAnalysisScope(account) {
  return (account.segments || []).some((segment) => ANALYSIS_SEGMENTS.includes(segment));
}

function planningAccounts() {
  return data.topAccounts.map((account) => {
    const country = normalizeCountry(account.country);
    const territory = account.territory;
    return {
      source: "Planning Longlist",
      sortGroup: 2,
      rank: account.rank,
      name: account.account,
      territory,
      geo: territoryToGeo(territory),
      tier: territoryToTier(territory),
      segment: "Enterprise / Large Enterprise",
      segments: ["Enterprise", "Large Enterprise"],
      classification: account.type,
      vertical: account.vertical,
      priority: account.vertical,
      country,
      owner: account.owner,
      arr: account.arr,
      pipeline: null,
      quarter: null,
      productWedge: "",
      revenueB: account.revenueB,
      employees: account.employees,
      accountType: account.type
    };
  });
}

function salesforceKeyAccounts() {
  return salesforce.accounts.map((account) => {
    const country = normalizeCountry(account.country);
    const territory = countryToTerritory(country);
    const geo = territoryToGeo(territory);
    const tier = territoryToTier(territory);
    const segment = account.segment || "Enterprise";
    const currentArr = Number(account.currentArrUsd || 0);
    return {
      source: "Top 100 Must-Win",
      sortGroup: 1,
      rank: account.rank,
      name: account.name,
      territory,
      geo,
      tier,
      segment,
      segments: [segment],
      classification: account.priorityBucket || "Top 100",
      vertical: account.industry || "Unspecified",
      priority: account.priorityBucket || "Top 100",
      country,
      owner: account.owner || "Unassigned",
      arr: currentArr,
      pipeline: Math.max(0, Number(account.openPipelineUsd || 0)),
      quarter: account.nearestCloseQuarter || "Not loaded",
      productWedge: account.productWedge || "",
      sourceType: account.sourceType || salesforce.meta?.source || "Salesforce source",
      sourceSnapshotDate: account.snapshotDate || salesforce.meta?.latestReportingDate,
      lastRefreshedAt: account.lastRefreshedAt || salesforce.meta?.generatedAt,
      execSponsor: account.execSponsor || "",
      accountTag: account.accountTag || "",
      competitiveRisk: account.competitiveRisk || "",
      flags: [],
      revenueB: null,
      employees: null,
      accountType: currentArr > 0 ? "Customer" : "Prospect"
    };
  });
}

function accountKey(item) {
  return `${item.source}::${item.rank}::${item.name}`;
}

function passesMoneyFilter(value, filter, kind) {
  if (filter === "All") return true;
  const loaded = isLoaded(value);
  if (filter === `${kind} loaded`) return loaded;
  if (filter === "Not loaded") return !loaded;
  if (!loaded) return false;
  if (filter === "$100K+") return Number(value) >= 100000;
  if (filter === "$1M+") return Number(value) >= 1000000;
  if (filter === "$5M+") return Number(value) >= 5000000;
  return true;
}

function populateFilters() {
  addOptions(selectors.geoFilter, ["All", ...unique(data.territories.map((item) => item.geo))]);
  addOptions(selectors.countryFilter, ["All", ...unique(allAccounts().filter(accountInAnalysisScope).map((item) => item.country))]);
  addOptions(selectors.tierFilter, ["All", ...unique(data.territories.map((item) => item.tier))]);
  addOptions(selectors.segmentFilter, ["All", "Enterprise", "Digital Natives", "Mid-Market"]);
  refreshAccountFilters();

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
  selectors.accountScopeFilter.addEventListener("change", () => {
    state.accountScope = selectors.accountScopeFilter.value;
    state.selectedAccountKey = "";
    resetAccountFilters();
    render();
  });
  selectors.searchFilter.addEventListener("input", () => {
    state.search = selectors.searchFilter.value.trim().toLowerCase();
    render();
  });
  selectors.resetFilters.addEventListener("click", resetFilters);

  selectors.accountSegmentFilter.addEventListener("change", () => {
    state.accountSegment = selectors.accountSegmentFilter.value;
    render();
  });
  selectors.accountClassificationFilter.addEventListener("change", () => {
    state.accountClassification = selectors.accountClassificationFilter.value;
    render();
  });
  selectors.accountVerticalFilter.addEventListener("change", () => {
    state.accountVertical = selectors.accountVerticalFilter.value;
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
  selectors.accountSortFilter.addEventListener("change", () => {
    state.accountSort = selectors.accountSortFilter.value;
    render();
  });
}

function resetAccountFilters() {
  state.accountSegment = "All";
  state.accountClassification = "All";
  state.accountVertical = "All";
  state.accountArr = "All";
  state.accountPipeline = "All";
  state.accountSort = "Priority";
}

function refreshAccountFilters() {
  const accounts = accountUniverse().filter(accountInAnalysisScope);
  addOptions(selectors.accountSegmentFilter, ["All", ...unique(accounts.flatMap((item) => item.segments).filter((segment) => ANALYSIS_SEGMENTS.includes(segment)))]);
  addOptions(selectors.accountClassificationFilter, ["All", ...unique(accounts.map((item) => item.classification))]);
  addOptions(selectors.accountVerticalFilter, ["All", ...unique(accounts.map((item) => item.vertical))]);
  addOptions(selectors.accountArrFilter, ["All", "ARR loaded", "$100K+", "$1M+", "$5M+", "Not loaded"]);
  addOptions(selectors.accountPipelineFilter, ["All", "Pipeline loaded", "$1M+", "$5M+", "Not loaded"]);

  if (![...selectors.accountSegmentFilter.options].some((option) => option.value === state.accountSegment)) state.accountSegment = "All";
  if (![...selectors.accountClassificationFilter.options].some((option) => option.value === state.accountClassification)) state.accountClassification = "All";
  if (![...selectors.accountVerticalFilter.options].some((option) => option.value === state.accountVertical)) state.accountVertical = "All";

  selectors.accountSegmentFilter.value = state.accountSegment;
  selectors.accountClassificationFilter.value = state.accountClassification;
  selectors.accountVerticalFilter.value = state.accountVertical;
  selectors.accountArrFilter.value = state.accountArr;
  selectors.accountPipelineFilter.value = state.accountPipeline;
  selectors.accountSortFilter.value = state.accountSort;
}

function resetFilters() {
  state.geo = "All";
  state.country = "All";
  state.tier = "All";
  state.segment = "All";
  state.accountScope = "Top 100 Must-Win";
  state.search = "";
  resetAccountFilters();
  state.selectedAccountKey = "";

  selectors.geoFilter.value = state.geo;
  selectors.countryFilter.value = state.country;
  selectors.tierFilter.value = state.tier;
  selectors.segmentFilter.value = state.segment;
  selectors.accountScopeFilter.value = state.accountScope;
  selectors.searchFilter.value = state.search;

  render();
}

function renderGoalCards() {
  const current = periodMetric("Q1 2026");
  const qoq = periodMetric("Q4 2025");
  const yoy = periodMetric("Q1 2025");
  const tam = data.summary.totalAccounts;
  const customers = current.customers;
  const penetration = customers / tam;
  const arrYoyUsd = current.arr - yoy.arr;
  const arrQoqUsd = current.arr - qoq.arr;
  const goals = [
    {
      label: "ARR",
      value: roundMillions(current.arr),
      detail: "Q1 FY26 ARR",
      note: `YoY ${formatGrowth(overallGrowth(current.arr, yoy.arr))} · QoQ ${formatGrowth(overallGrowth(current.arr, qoq.arr))}`
    },
    {
      label: "Growth",
      value: formatPercentWhole(overallGrowth(current.arr, yoy.arr)),
      detail: "ARR YoY growth",
      note: `QoQ ${formatPercentWhole(overallGrowth(current.arr, qoq.arr))}`
    },
    {
      label: "Customers",
      value: formatDecimal(customers),
      detail: `${formatDecimal(tam)} total accounts`,
      note: `YoY ${formatGrowth(overallGrowth(current.customers, yoy.customers))} · QoQ ${formatGrowth(overallGrowth(current.customers, qoq.customers))}`
    },
    {
      label: "Penetration",
      value: formatPercentWhole(penetration * 100),
      detail: `${formatDecimal(customers)} of ${formatDecimal(tam)} accounts`,
      note: "Light penetration means there is still a large market left to cover"
    },
    {
      label: "Customers > $1M",
      value: formatDecimal(current.customersOver1m),
      detail: "high-value customer base",
      note: `YoY ${formatGrowth(overallGrowth(current.customersOver1m, yoy.customersOver1m))} · QoQ ${formatGrowth(overallGrowth(current.customersOver1m, qoq.customersOver1m))}`
    }
  ];

  selectors.goalGrid.innerHTML = goals.map((goal) => `
    <article class="goal-card">
      <span>${goal.label}</span>
      <strong>${goal.value}</strong>
      <em>${goal.detail}</em>
      <p>${goal.note}</p>
    </article>
  `).join("");
}

function renderHeroNarrative() {
  const current = periodMetric("Q1 2026");
  const yoy = periodMetric("Q1 2025");
  const tam = data.summary.totalAccounts;
  const penetration = current.customers / tam;
  const arrYoyPct = overallGrowth(current.arr, yoy.arr);

  selectors.heroTitle.textContent = `EMEA Enterprise, Mid Market and Digital Natives grew ARR ${formatPercentWhole(arrYoyPct)} YoY in Q1 FY26, but remain lightly penetrated at ${formatPercentWhole(penetration * 100)}.`;
  selectors.heroLead.textContent = `The market is still only ${formatPercentWhole(penetration * 100)} penetrated with ${formatDecimal(current.customers)} customers across ${formatDecimal(tam)} total accounts. The opportunity is to expand coverage and accelerate growth with a stronger AD footprint and a more focused regional operating model.`;
  selectors.heroSignalCopy.textContent = `Core summary metrics: ARR ${roundMillions(current.arr)}, growth ${formatPercentWhole(arrYoyPct)} YoY, ${formatDecimal(current.customers)} customers, ${formatPercentWhole(penetration * 100)} penetration, and ${formatDecimal(current.customersOver1m)} customers over $1M ARR.`;
  selectors.heroMustWinCopy.textContent = "";
}

function renderMustWinDeck() {
  const mustWin = data.mustWin || {};
  const summary = mustWinCurrentSummary();
  const countryRows = mustWin.countryPipeline || [];
  const priorityRows = mustWin.priorityBuckets || [];
  const maxCountry = Math.max(...countryRows.map((row) => row.accounts || 0), 1);
  const maxPriority = Math.max(...priorityRows.map((row) => row.accounts || 0), 1);
  const loadedArrAccounts = Number(summary.loadedArrAccounts || 0);
  const accountsInScope = Number(summary.accountsInScope || 0);
  const penetration = accountsInScope ? (loadedArrAccounts / accountsInScope) * 100 : 0;

  selectors.mustWinStatusCopy.textContent = `Top 100 Must Win account data is synced from salesforce-data.js generated ${shortDate(mustWin.sourceGeneratedAt || mustWin.generatedAt)}; the org coverage model remains from ${shortDate(data.refreshedAt)}.`;
  selectors.mustWinBadges.innerHTML = [
    `Status ${mustWin.status || "n/a"}`,
    `Must Win source ${shortDate(mustWin.sourceUpdatedAt || mustWin.generatedAt)}`,
    `ARR snapshot ${summary.latestArrSnapshot || "n/a"}`,
    `Pipeline snapshot ${summary.latestPipelineSnapshot || "n/a"}`,
    `Coverage model ${shortDate(data.refreshedAt)}`,
    `${formatDecimal(accountsInScope)} accounts in scope`
  ].map((item) => `<span class="mustwin-badge">${item}</span>`).join("");

  selectors.mustWinKpis.innerHTML = [
    { label: "Accounts In Scope", value: formatDecimal(accountsInScope), note: "Top 100 Must Win portfolio" },
    { label: "Current ARR", value: roundMillions(summary.currentArrUsd), note: "current Must Win ARR snapshot" },
    { label: "Open Pipeline", value: roundMillions(summary.openPipelineUsd), note: "pipeline across the Must Win book" },
    { label: "Penetration", value: formatPercentWhole(penetration), note: `${formatDecimal(loadedArrAccounts)} of ${formatDecimal(accountsInScope)} accounts with ARR loaded` }
  ].map((item) => `
    <article class="mustwin-kpi">
      <span>${item.label}</span>
      <strong>${item.value}</strong>
      <p>${item.note}</p>
    </article>
  `).join("");

  selectors.mustWinCountryBars.innerHTML = countryRows.slice(0, 8).map((row) => `
    <div class="mustwin-bar-row">
      <div class="mustwin-bar-head">
        <strong>${row.country}</strong>
        <span>${formatDecimal(row.accounts)} accounts</span>
      </div>
      <div class="mustwin-bar-track"><span style="width:${Math.max(6, ((row.accounts || 0) / maxCountry) * 100)}%"></span></div>
      <p>${roundMillions(row.arr)} ARR · ${roundMillions(row.pipeline)} pipeline</p>
    </div>
  `).join("");

  selectors.mustWinPriorityBars.innerHTML = priorityRows.map((row) => `
    <div class="mustwin-bar-row">
      <div class="mustwin-bar-head">
        <strong>${row.bucket}</strong>
        <span>${formatDecimal(row.accounts)} accounts</span>
      </div>
      <div class="mustwin-bar-track"><span style="width:${Math.max(6, ((row.accounts || 0) / maxPriority) * 100)}%"></span></div>
      <p>${roundMillions(row.arr)} ARR · ${roundMillions(row.pipeline)} pipeline</p>
    </div>
  `).join("");
}

function overallGrowth(current, previous) {
  return previous ? ((current - previous) / previous) * 100 : null;
}

function renderMetrics() {
  const current = periodMetric("Q1 2026");
  const qoq = periodMetric("Q4 2025");
  const yoy = periodMetric("Q1 2025");
  const tam = data.summary.totalAccounts;
  const customers = current.customers;
  const penetration = customers / tam;
  const metrics = [
    {
      label: "ARR",
      value: roundMillions(current.arr),
      note: `QoQ ${formatGrowth(overallGrowth(current.arr, qoq.arr))} · YoY ${formatGrowth(overallGrowth(current.arr, yoy.arr))}`
    },
    {
      label: "Growth",
      value: formatPercentWhole(overallGrowth(current.arr, yoy.arr)),
      note: `QoQ ${formatPercentWhole(overallGrowth(current.arr, qoq.arr))} · YoY ${formatPercentWhole(overallGrowth(current.arr, yoy.arr))}`
    },
    {
      label: "Customers",
      value: formatDecimal(customers),
      note: `QoQ ${formatPercentWhole(overallGrowth(current.customers, qoq.customers))} · YoY ${formatPercentWhole(overallGrowth(current.customers, yoy.customers))}`
    },
    {
      label: "Penetration",
      value: formatPercentWhole(penetration * 100),
      note: `${formatDecimal(customers)} customers across ${formatDecimal(tam)} total accounts`
    },
    {
      label: "Customers > $1M",
      value: formatDecimal(current.customersOver1m),
      note: `QoQ ${formatPercentWhole(overallGrowth(current.customersOver1m, qoq.customersOver1m))} · YoY ${formatPercentWhole(overallGrowth(current.customersOver1m, yoy.customersOver1m))}`
    }
  ];

  selectors.metrics.innerHTML = metrics.map((metric) => `
    <article class="metric metric--compact">
      <span>${metric.label}</span>
      <strong>${metric.value}</strong>
      <p>${metric.note}</p>
    </article>
  `).join("");
}

function renderSegmentSummary() {
  const focusOrder = ["Enterprise", "Digital Natives", "Mid-Market"];
  const focusSegments = focusOrder
    .map((segment) => kepler.segments.find((item) => item.segment === segment))
    .filter(Boolean);

  selectors.segmentSummary.innerHTML = focusSegments.map((segment) => `
    <article class="segment-summary__card">
      <div class="segment-summary__header">
        <span>${segment.segment}</span>
        <strong>${formatMoney(segment.arr)} ARR</strong>
      </div>
      <p>${formatDecimal(segment.customers)} customers · ${formatMoney(segment.bookings)} Q1 bookings · ${formatMoney(segment.revenue)} Q1 revenue</p>
      <dl>
        <div><dt>ARR</dt><dd>${formatPercentWhole(segment.arrQoqPct)} QoQ · ${formatPercentWhole(segment.arrYoyPct)} YoY</dd></div>
        <div><dt>Customers</dt><dd>${formatPercentWhole(segment.customersQoqPct)} QoQ · ${formatPercentWhole(segment.customersYoyPct)} YoY</dd></div>
        <div><dt>$1M+ ARR</dt><dd>${formatDecimal(segment.customersOver1m)} accounts</dd></div>
      </dl>
    </article>
  `).join("");
}

function renderOrgSummary() {
  const currentAds = data.segmentCapacity.reduce((sum, item) => sum + item.currentAds, 0);
  const requiredAds = data.segmentCapacity.reduce((sum, item) => sum + item.recommendedAds, 0);
  const totalAccounts = data.summary.totalAccounts;
  const totalCustomers = data.summary.customers;
  const arr = data.summary.bookArr;
  const cards = [
    {
      label: "AD Footprint",
      currentLabel: "Current",
      currentValue: formatDecimal(currentAds),
      targetLabel: "Target",
      targetValue: formatDecimal(requiredAds),
      delta: `+${formatDecimal(requiredAds - currentAds)} ADs`,
      note: "Scale the field from today’s footprint to the target operating model."
    },
    {
      label: "Accounts / AD",
      currentLabel: "Current",
      currentValue: formatDecimal(totalAccounts / currentAds, 1),
      targetLabel: "Target",
      targetValue: formatDecimal(totalAccounts / requiredAds, 1),
      delta: `${formatDecimal((totalAccounts / currentAds) - (totalAccounts / requiredAds), 1)} fewer`,
      note: "Bring account load down so each patch can actually be worked."
    },
    {
      label: "Customers / AD",
      currentLabel: "Current",
      currentValue: formatDecimal(totalCustomers / currentAds, 1),
      targetLabel: "Target",
      targetValue: formatDecimal(totalCustomers / requiredAds, 1),
      delta: `${formatDecimal((totalCustomers / currentAds) - (totalCustomers / requiredAds), 1)} fewer`,
      note: "Create a more realistic customer book per AD."
    },
    {
      label: "ARR / AD",
      currentLabel: "Current",
      currentValue: formatMoney(arr / currentAds),
      targetLabel: "Target",
      targetValue: formatMoney(arr / requiredAds),
      delta: `${formatMoney((arr / currentAds) - (arr / requiredAds))} lighter`,
      note: "Reset average ARR load per AD to support cleaner expansion coverage."
    }
  ];

  selectors.orgSummary.innerHTML = cards.map((card) => `
    <article class="account-insight account-insight--compare">
      <span>${card.label}</span>
      <div class="compare-metric">
        <div>
          <small>${card.currentLabel}</small>
          <strong>${card.currentValue}</strong>
        </div>
        <i aria-hidden="true"></i>
        <div>
          <small>${card.targetLabel}</small>
          <strong>${card.targetValue}</strong>
        </div>
      </div>
      <b>${card.delta}</b>
      <p>${card.note}</p>
    </article>
  `).join("");
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
      return searchable([item.territory, item.geo, item.tier, ...Object.keys(item.segmentAds)]).includes(state.search);
    });
}

function filteredSegments() {
  return data.segmentCapacity
    .filter((item) => state.geo === "All" || item.geo === state.geo)
    .filter((item) => state.country === "All" || item.geo === countryToGeo(state.country))
    .filter((item) => capacitySegmentMatches(item.segment, state.segment))
    .filter((item) => !state.search || searchable([item.geo, item.segment]).includes(state.search));
}

function capacitySegmentMatches(itemSegment, selectedSegment) {
  if (selectedSegment === "All") return true;
  if (selectedSegment === "Large Enterprise") return itemSegment === "Enterprise";
  return itemSegment === selectedSegment;
}

function selectedAnalysisSegment() {
  return state.segment === "All" ? null : state.segment;
}

function segmentRowsForGeo(geo) {
  return data.segmentCapacity.filter((item) =>
    item.geo === geo && capacitySegmentMatches(item.segment, state.segment)
  );
}

function aggregateSegmentMetricsForGeo(geo) {
  const rows = segmentRowsForGeo(geo);
  return rows.reduce((acc, item) => {
    acc.totalAccounts += Number(item.totalAccounts || 0);
    acc.customers += Number(item.customers || 0);
    acc.arr += Number(item.arr || 0);
    acc.whitespace += Number(item.whitespace || 0);
    acc.currentAds += Number(item.currentAds || 0);
    acc.recommendedAds += Number(item.recommendedAds || 0);
    return acc;
  }, {
    totalAccounts: 0,
    customers: 0,
    arr: 0,
    whitespace: 0,
    currentAds: 0,
    recommendedAds: 0
  });
}

function territoryMetrics(item) {
  const segment = selectedAnalysisSegment();
  if (!segment) {
    return {
      totalAccounts: Number(item.totalAccounts || 0),
      customers: Number(item.customers || 0),
      arr: Number(item.arr || 0),
      whitespace: Number(item.incrementalAccounts || 0),
      currentAds: Number(item.segmentAds?.["Large Enterprise"] || 0) + Number(item.segmentAds?.Enterprise || 0) + Number(item.segmentAds?.["Digital Natives"] || 0) + Number(item.segmentAds?.["Mid-Market"] || 0),
      recommendedAds: Number(item.recommendedAds || 0)
    };
  }

  const geoTotals = aggregateSegmentMetricsForGeo(item.geo);
  const territoryCurrentAds = Number(item.segmentAds?.[segment] || 0);
  const geoCurrentAds = Math.max(geoTotals.currentAds, 0);
  const allocationShare = geoCurrentAds > 0 ? territoryCurrentAds / geoCurrentAds : 0;

  return {
    totalAccounts: geoTotals.totalAccounts * allocationShare,
    customers: geoTotals.customers * allocationShare,
    arr: geoTotals.arr * allocationShare,
    whitespace: geoTotals.whitespace * allocationShare,
    currentAds: territoryCurrentAds,
    recommendedAds: geoTotals.recommendedAds * allocationShare
  };
}

function currentAdsByGeo(geo) {
  return data.segmentCapacity
    .filter((item) => item.geo === geo)
    .reduce((sum, item) => sum + item.currentAds, 0);
}

function visibleGeoSummaries(territories) {
  const byGeo = new Map();

  territories.forEach((territory) => {
    const metrics = territoryMetrics(territory);
    const existing = byGeo.get(territory.geo) || {
      geo: territory.geo,
      totalAccounts: 0,
      customers: 0,
      arr: 0,
      whitespace: 0,
      currentAds: 0,
      recommendedAds: 0
    };

    existing.totalAccounts += metrics.totalAccounts;
    existing.customers += metrics.customers;
    existing.arr += metrics.arr;
    existing.whitespace += metrics.whitespace;
    existing.currentAds += metrics.currentAds;
    existing.recommendedAds += metrics.recommendedAds;
    byGeo.set(territory.geo, existing);
  });

  return [...byGeo.values()];
}

function filteredAccounts() {
  return accountUniverse()
    .filter(accountInAnalysisScope)
    .filter((item) => state.geo === "All" || item.geo === state.geo)
    .filter((item) => state.country === "All" || item.country === state.country)
    .filter((item) => state.tier === "All" || item.tier === state.tier)
    .filter((item) => state.segment === "All" || item.segments.includes(state.segment))
    .filter((item) => state.accountSegment === "All" || item.segments.includes(state.accountSegment))
    .filter((item) => state.accountClassification === "All" || item.classification === state.accountClassification)
    .filter((item) => state.accountVertical === "All" || item.vertical === state.accountVertical)
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
        item.vertical,
        item.country,
        item.owner,
        item.source
      ]).includes(state.search);
    });
}

function renderTerritories(items) {
  const sorted = [...items].sort((a, b) => territoryMetrics(b).totalAccounts - territoryMetrics(a).totalAccounts);
  const territoryRows = sorted.map((item) => ({ item, metrics: territoryMetrics(item) }));
  const maxAccounts = Math.max(...territoryRows.map(({ metrics }) => metrics.totalAccounts), 1);
  const totalAccounts = territoryRows.reduce((sum, { metrics }) => sum + metrics.totalAccounts, 0);
  const totalArr = territoryRows.reduce((sum, { metrics }) => sum + metrics.arr, 0);
  const totalWhitespace = territoryRows.reduce((sum, { metrics }) => sum + metrics.whitespace, 0);

  selectors.territoryCount.textContent = `${sorted.length} sub-regions`;
  selectors.whitespaceTotal.textContent = `${formatDecimal(totalAccounts)} accounts · ${formatMoney(totalArr)} ARR · ${formatDecimal(totalWhitespace)} whitespace`;

  selectors.territoryBars.innerHTML = territoryRows.map(({ item, metrics }) => {
    const width = Math.max(4, (metrics.totalAccounts / maxAccounts) * 100);
    return `
      <button class="bar-row" data-territory="${escapeAttr(item.territory)}" title="Filter to ${escapeAttr(item.territory)}">
        <span class="bar-row__label">${item.territory}</span>
        <span class="bar-row__track"><span class="bar-row__fill" style="width:${width}%"></span></span>
        <span class="bar-row__value">${formatDecimal(metrics.totalAccounts)}</span>
        <small>${formatDecimal(metrics.customers)} customers · ${formatMoney(metrics.arr)} ARR · ${formatDecimal(metrics.whitespace)} whitespace · ${formatDecimal(metrics.currentAds)} / ${formatDecimal(metrics.recommendedAds)} ADs</small>
      </button>
    `;
  }).join("");

  document.querySelectorAll("#territory-bars .bar-row").forEach((button) => {
    button.addEventListener("click", () => {
      selectors.searchFilter.value = button.dataset.territory;
      state.search = button.dataset.territory.toLowerCase();
      render();
    });
  });

  selectors.territoryTable.innerHTML = territoryRows.map(({ item, metrics }) => `
    <tr>
      <td><strong>${item.territory}</strong></td>
      <td>${item.geo}</td>
      <td>${item.tier}</td>
      <td>${formatDecimal(metrics.totalAccounts)}</td>
      <td>${formatDecimal(metrics.customers)}</td>
      <td>${formatDecimal(metrics.recommendedAds)}</td>
      <td>${formatMoney(metrics.arr)}</td>
      <td>${formatMoney(metrics.arr / Math.max(metrics.recommendedAds, 1))}</td>
      <td>${formatDecimal(metrics.totalAccounts / Math.max(metrics.recommendedAds, 1), 1)}</td>
    </tr>
  `).join("");
}

function renderGeos(territories) {
  const summaries = visibleGeoSummaries(territories);
  const maxAccounts = Math.max(...summaries.map((item) => item.totalAccounts), 1);
  selectors.geoGrid.innerHTML = summaries.map((item) => {
    const width = Math.max(4, (item.totalAccounts / maxAccounts) * 100);
    const customersPerAd = item.customers / Math.max(item.currentAds, 1);
    const accountsPerAd = item.totalAccounts / Math.max(item.currentAds, 1);
    const arrPerAd = item.arr / Math.max(item.currentAds, 1);
    return `
      <button class="geo-tile" data-geo="${escapeAttr(item.geo)}">
        <div>
          <span>${item.geo}${selectedAnalysisSegment() ? ` · ${selectedAnalysisSegment()}` : ""}</span>
          <strong>${formatDecimal(item.currentAds)} / ${formatDecimal(item.recommendedAds)} ADs</strong>
        </div>
        <div class="geo-tile__meter"><span style="width:${width}%"></span></div>
        <p>${formatDecimal(item.totalAccounts)} accounts · ${formatDecimal(item.customers)} customers · ${formatMoney(item.arr)} ARR · ${formatDecimal(item.whitespace)} whitespace</p>
        <small>${formatDecimal(accountsPerAd, 1)} accounts / AD · ${formatDecimal(customersPerAd, 1)} customers / AD · ${formatMoney(arrPerAd)} ARR / AD</small>
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
  const geoOrder = ["North", "Central", "South", "MEA"];
  const segmentOrder = ["Enterprise", "Digital Natives", "Mid-Market"];
  const sorted = [...items].sort((a, b) =>
    geoOrder.indexOf(a.geo) - geoOrder.indexOf(b.geo) ||
    segmentOrder.indexOf(a.segment) - segmentOrder.indexOf(b.segment)
  );
  selectors.segmentGrid.innerHTML = sorted.map((item) => `
    <article class="segment-tile segment-tile--capacity">
      <div class="segment-tile__topline">
        <span>${item.geo} / ${item.segment}</span>
        <strong>${formatDecimal(item.currentAds)} now · ${formatDecimal(item.recommendedAds)} req</strong>
      </div>
      <h3>${formatDecimal(item.totalAccounts)} accounts</h3>
      <div class="segment-tile__bar">
        <span style="width:${Math.max(8, (item.currentAds / Math.max(item.recommendedAds, 1)) * 100)}%"></span>
      </div>
      <dl class="segment-capacity">
        <div><dt>Customers</dt><dd>${formatDecimal(item.customers)}</dd></div>
        <div><dt>ARR</dt><dd>${formatMoney(item.arr)}</dd></div>
        <div><dt>ARR / AD</dt><dd>${formatMoney(item.arr / Math.max(item.currentAds, 1))}</dd></div>
        <div><dt>Accounts / AD</dt><dd>${formatDecimal(item.totalAccounts / Math.max(item.currentAds, 1), 1)}</dd></div>
      </dl>
    </article>
  `).join("") || `<article class="segment-tile segment-tile--empty"><h3>No matching segment capacity</h3><p>Clear the segment filter or search to bring the regional headcount model back into view.</p></article>`;
}

function renderMustWinStatus(accounts) {
  const arrLoaded = accounts.filter((item) => Number(item.arr || 0) > 0).length;
  const pipelineLoaded = accounts.filter((item) => isLoaded(item.pipeline)).length;
  const countries = unique(accounts.map((item) => item.country)).length;
  const flagged = accounts.filter((item) => (item.flags || []).length).length;
  const mustWin = data.mustWin || {};
  const scopeLabel =
    state.accountScope === "Top 100 Must-Win"
      ? "Top 100 Must Win from the EMEA Must Win Dashboard"
      : state.accountScope === "All Customers"
        ? "All customers in the current portfolio view"
        : "All accounts in the current portfolio view";
  selectors.mustWinStatus.textContent = `${scopeLabel} · ${formatDecimal(accounts.length)} accounts in view across Enterprise, Mid-Market, and Digital Natives · ${formatDecimal(arrLoaded)} customer accounts with ARR loaded · ${formatDecimal(pipelineLoaded)} accounts with pipeline loaded · ${formatDecimal(countries)} countries represented · ${formatDecimal(flagged)} accounts flagged from source-sheet notes or April 16 changes · source generated ${shortDate(mustWin.sourceGeneratedAt || mustWin.generatedAt)}.`;
}

function selectedOrFirstAccount(items) {
  const selected = items.find((item) => accountKey(item) === state.selectedAccountKey);
  if (selected) return selected;
  const first = items[0];
  state.selectedAccountKey = first ? accountKey(first) : "";
  return first || null;
}

function sortAccounts(items) {
  return [...items].sort((a, b) => {
    if (state.accountSort === "ARR") return Number(b.arr || -1) - Number(a.arr || -1);
    if (state.accountSort === "Pipeline") return Number(b.pipeline || -1) - Number(a.pipeline || -1);
    if (state.accountSort === "Name") return a.name.localeCompare(b.name);
    if (a.sortGroup !== b.sortGroup) return a.sortGroup - b.sortGroup;
    return (a.rank || 999) - (b.rank || 999);
  });
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

  const flags = account.flags || [];
  selectors.accountDetail.innerHTML = `
    <div>
      <p class="eyebrow">Selected Account</p>
      <h3>${account.name}</h3>
      <p>${account.country} · ${account.segment} · ${account.classification} · ${account.vertical}</p>
    </div>
    ${flags.length ? `<div class="account-flags account-flags--detail">${flags.map((flag) => `<span>${flag}</span>`).join("")}</div>` : ""}
    <dl>
      <div><dt>ARR</dt><dd>${formatOptionalMoney(account.arr)}</dd></div>
      <div><dt>Pipeline</dt><dd>${formatOptionalMoney(account.pipeline)}</dd></div>
      <div><dt>Owner</dt><dd>${account.owner}</dd></div>
      <div><dt>Exec Sponsor</dt><dd>${account.execSponsor || "Not loaded"}</dd></div>
      <div><dt>Quarter</dt><dd>${account.quarter || "Not loaded"}</dd></div>
      <div><dt>Snapshot</dt><dd>${shortDate(account.sourceSnapshotDate)}</dd></div>
      <div><dt>Refreshed</dt><dd>${shortDate(account.lastRefreshedAt)}</dd></div>
      <div><dt>Source</dt><dd>${account.sourceType || "Must Win source"}</dd></div>
    </dl>
  `;
}

function renderAccounts(items) {
  const sorted = sortAccounts(items);
  const loadedArr = sorted.filter((item) => isLoaded(item.arr));
  const loadedPipeline = sorted.filter((item) => isLoaded(item.pipeline));
  const totalArr = loadedArr.reduce((sum, item) => sum + Number(item.arr || 0), 0);
  const totalPipeline = loadedPipeline.reduce((sum, item) => sum + Number(item.pipeline || 0), 0);
  const selectedAccount = selectedOrFirstAccount(sorted);
  const customerCount = sorted.filter((item) => Number(item.arr || 0) > 0).length;
  const customersOver1m = sorted.filter((item) => Number(item.arr || 0) >= 1000000).length;
  const penetration = sorted.length ? (customerCount / sorted.length) * 100 : 0;
  const mustWinSummary = salesforce.summary || {};
  const arrGrowthPct = mustWinSummary.arr_qoq_growth_pct ?? mustWinSummary.arr_yoy_growth_pct;
  const arrGrowthLabel = mustWinSummary.arr_qoq_growth_pct !== null && mustWinSummary.arr_qoq_growth_pct !== undefined ? "QoQ growth" : "Growth";
  const arrGrowthValue = arrGrowthPct === null || arrGrowthPct === undefined ? "n/a" : formatGrowth(arrGrowthPct);
  const scopeNote =
    state.accountScope === "Top 100 Must-Win"
      ? "Top 100 Must Win"
      : state.accountScope === "All Customers"
        ? "All customers"
        : "All accounts";

  selectors.accountCount.textContent = `${sorted.length} accounts`;
  const operatingInsights = [
    { label: "ARR", value: formatMoney(totalArr), note: `${formatDecimal(loadedArr.length)} accounts with ARR loaded in ${scopeNote.toLowerCase()}` },
    { label: "Growth", value: arrGrowthValue, note: arrGrowthValue === "n/a" ? "ARR growth is not populated in the current Must Win snapshot" : `${arrGrowthLabel} from the Must Win snapshot` },
    { label: "Customers", value: formatDecimal(customerCount), note: "accounts with positive ARR" },
    { label: "Penetration", value: `${formatPercentWhole(penetration)}`, note: `${formatDecimal(sorted.length)} accounts in the filtered set` },
    { label: "Customers > $1M", value: formatDecimal(customersOver1m), note: "customers over $1M ARR" },
    { label: "Open pipeline", value: formatMoney(totalPipeline), note: `${formatDecimal(loadedPipeline.length)} accounts with pipeline loaded` }
  ];
  selectors.accountInsights.innerHTML = operatingInsights.map((item) => `
    <article class="account-insight">
      <span>${item.label}</span>
      <strong>${item.value}</strong>
      <p>${item.note}</p>
    </article>
  `).join("");

  renderMustWinStatus(sorted);
  renderAccountDetail(selectedAccount);

  selectors.accountTable.innerHTML = sorted.map((item) => `
    <tr class="${accountKey(item) === state.selectedAccountKey ? "is-selected" : ""}" data-account-key="${escapeAttr(accountKey(item))}">
      <td>
        <strong>${item.name}</strong>
        <small>#${item.rank} · ${item.accountType}${item.revenueB ? ` · $${item.revenueB.toFixed(1)}B revenue` : ""} · refreshed ${shortDate(item.lastRefreshedAt)}</small>
        ${(item.flags || []).length ? `<div class="account-flags">${item.flags.map((flag) => `<span>${flag}</span>`).join("")}</div>` : ""}
      </td>
      <td>${item.country}</td>
      <td>${item.segment}</td>
      <td><span class="account-pill">${item.classification}</span></td>
      <td>${item.vertical}</td>
      <td>${formatOptionalMoney(item.arr)}</td>
      <td>${formatOptionalMoney(item.pipeline)}</td>
      <td>${item.owner}</td>
      <td>${item.quarter || "Not loaded"}</td>
    </tr>
  `).join("") || `<tr><td colspan="9"><strong>No matching accounts</strong><small>Loosen the account filters or clear the global search.</small></td></tr>`;

  selectors.accountTable.querySelectorAll("tr[data-account-key]").forEach((row) => {
    row.addEventListener("click", () => {
      state.selectedAccountKey = row.dataset.accountKey;
      renderAccounts(filteredAccounts());
    });
  });
}

function renderFilterChips() {
  const chips = [
    ["Geo", state.geo],
    ["Country", state.country],
    ["Tier", state.tier],
    ["Segment", state.segment],
    ["Account scope", state.accountScope],
    ["Search", state.search],
    ["Account segment", state.accountSegment],
    ["Classification", state.accountClassification],
    ["Vertical", state.accountVertical],
    ["ARR", state.accountArr],
    ["Pipeline", state.accountPipeline],
    ["Sort", state.accountSort]
  ].filter(([, value]) => value && value !== "All" && value !== "Priority" && value !== "Top 100 Must-Win");

  selectors.filterChips.innerHTML = chips.length
    ? chips.map(([label, value]) => `<span class="filter-chip">${label}: ${value}</span>`).join("")
    : `<span class="filter-chip filter-chip--quiet">Top 100 Must Win · all markets</span>`;
}

function escapeAttr(value) {
  return String(value).replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;");
}

function render() {
  refreshAccountFilters();
  const territories = filteredTerritories();
  const segments = filteredSegments();
  const accounts = filteredAccounts();

  renderHeroNarrative();
  renderGoalCards();
  renderMetrics();
  renderSegmentSummary();
  renderOrgSummary();
  renderMustWinDeck();
  renderTerritories(territories);
  renderGeos(territories);
  renderSegments(segments);
  renderAccounts(accounts);
  renderFilterChips();
}

populateFilters();
render();
