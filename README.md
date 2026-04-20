# EMEA FY26 Coverage Dashboard

Static dashboard built from `20260323 EMEA Org Design Analysis FY26`.

Open `index.html` in a browser.

## External publishing

The folder now includes a GitHub Pages workflow at [deploy-pages.yml](/Users/sanj/Documents/emea-org-design-dashboard/.github/workflows/deploy-pages.yml) and a short publish guide at [DEPLOY.md](/Users/sanj/Documents/emea-org-design-dashboard/DEPLOY.md).

Before publishing externally, review [salesforce-data.js](/Users/sanj/Documents/emea-org-design-dashboard/salesforce-data.js) carefully. It contains internal business data and should not be pushed to a public repo unless you explicitly want that data to be public.

## Workbook source

- Google Sheet ID: `1Km3zOONX_ckduKb4tOT9XuEJnJ9v_uA7XOcG3jBh7yg`
- Google Doc ID: `1p4yrsLkA0xEyCaKgWpvV-QbX7_x0aOp4mLAEIFZyYLw`
- Google Slides ID: `1sXfV6TOXO1L0UIwq7XYgb8Dbx_YDLf8lWqDqbGmYSJU`
- Salesforce snapshot: `/Users/sanj/Documents/emea-must-win-dashboard/dashboard_payload.json`
- Linked tab: `Analysis`
- Summary tabs used: `Coverage Summary`, `Org Chart Summary`, `Top 20 by Vertical & Geo`

## What is included

- Executive coverage and headcount KPIs
- Salesforce-sourced account, ARR, pipeline, country, and owner metrics
- Geo allocation
- Territory whitespace ranking
- Territory table with current and recommended coverage
- Segment-level AD / whitespace tiles
- Top-account focus list from the vertical / geo planning tab
- Country filter across the Salesforce account metrics and key-account explorer
- Narrative / recommendation section distilled from `20260316 FY26 EMEA Sales Org Design`
- Market-prioritization section distilled from `Territory Map`

The dashboard is static, but the Must Win block has a real refresh path:

```bash
python3 scripts/sync-must-win.py
```

That command reads [salesforce-data.js](/Users/sanj/Documents/emea-org-design-dashboard/salesforce-data.js), replaces the embedded `mustWin` block in [data.js](/Users/sanj/Documents/emea-org-design-dashboard/data.js), preserves source dates, and flags accounts that changed versus the previous embedded snapshot or carry notes in the Must Win source sheet. Refresh the rest of `data.js` only after workbook planning assumptions change.

## Related dashboard

The Must Win snapshot is integrated from the sibling command deck at `/Users/sanj/Documents/emea-must-win-dashboard/index.html`.
