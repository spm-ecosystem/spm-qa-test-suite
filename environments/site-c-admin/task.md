# QA Environment Task Brief: Site C - Algolia Hacker News Search Admin (`site-c-admin`)

## 🌐 Target Site & Page Details
- **Target URL Pattern:** `https://hn.algolia.com/?q=*`
- **Site Type:** Algolia Search Engine & Data Analytics Dashboard
- **Target Components:** `UiStatsDashboard`, `UiTableListPage`

---

## 🎯 Modernization & QA Objectives

1. **Scraping Pipeline Validation (`admin.vnr`):**
   - Validate story item extractions (`.Story_container`), title links (`.Story_title a | attr:href`), points (`.Story_meta span | text`), and author (`a.hnuser | text`).
   - Reconstruct `.SearchResults_container` into `UiTableListPage` with preserved card nodes (`preserve`).

2. **Destructive Boundary & Robustness Testing:**
   - **Wide Data Table Overflow:** Test `UiTableListPage` horizontal scrolling when tables exceed 15 columns.
   - **Infinite Scroll Link Scraping:** Test `infiniteScroll` configuration targeting `.ais-Pagination-item--next a`.
   - **Numeric / Currency Parsing:** Test handling of uncleaned currency or NaN strings in metrics tables.

3. **Documentation Coverage Audit:**
   - Evaluate whether `docs/veneer-reference.md` and `docs/manifest-schema.md` correctly explain `infiniteScroll` JSON object definitions and `preserve` slot dictionary rules.

4. **Report & Git Commit Protocol:**
   - Write complete findings to `environments/site-c-admin/result.md` in English.
   - Run `git add environments/site-c-admin/ && git commit -m "qa(site-c-admin): complete evaluation and generate result.md"`.
