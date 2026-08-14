# QA Task Brief: Site C - Enterprise ERP Analytics Panel (`site-c-admin`)

## Target Site & Page Scenario
- **Domain / Site:** `enterprise-erp-metrics.internal`
- **Page Type:** Analytics Metrics Dashboard with high-density data tables and KPI cards.
- **Target Components:** `UiStatsDashboard`, `UiTableListPage`

## Task Instructions
1. Inspect the legacy metrics tables and `admin.vnr` theme rules.
2. Rely **strictly** on the documentation in `docs/` (`docs/veneer-reference.md`, `docs/component-specs.md`, `docs/manifest-schema.md`, `docs/cli-tooling.md`).
3. Conduct destructive testing on edge cases:
   - Data tables exceeding 15 columns to evaluate horizontal overflow behavior.
   - Asynchronous loading (`onLoadMore`) under extreme network latency (timeout > 5s).
   - Numeric parsing on uncleaned currency strings ("$ 1,500.20", "NaN").
4. Evaluate documentation sufficiency and friction points.
5. Generate the environment report at `environments/site-c-admin/result.md` in English.
6. Commit all changes locally: `git add environments/site-c-admin/ && git commit -m "qa(site-c-admin): complete evaluation and generate result.md"`.
