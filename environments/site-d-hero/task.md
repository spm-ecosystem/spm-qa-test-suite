# QA Environment Task Brief: Site D - Landing Portal (`site-d-hero`)

## 🌐 Target Site & Page Details
- **Target URL Pattern:** `https://legacy-portal-landing.org/*`
- **Site Type:** Legacy Enterprise Developer Portal Homepage
- **Target Components:** `UiHeroLanding`, `UiSearchBar`, `UiTagBadge`

---

## 🎯 Modernization & QA Objectives

1. **Review Master Synthesis Report:**
   - Inspect `/home/watashi/Projects/spm-qa-test-suite/reports/master-qa-synthesis-report.md` prior to testing to check previously cataloged defects (`DEFECT-SAF-01` through `DEFECT-SEC-04`) and avoid duplicating entries.

2. **Scraping Pipeline Validation (`hero.vnr`):**
   - Validate `UiHeroLanding` prop configurations (`siteName`, `logoUrl`, `tagline`, `subtext`, `ctaLabel`, `ctaUrl`, `searchSubmitUrl`, `searchParamName`, `primaryLinks`).
   - Compile `hero.vnr` using `/home/watashi/Projects/spm-cli/spm compile` and verify output `manifest.json`.

3. **Destructive Boundary & Robustness Testing:**
   - **Broken Image Fallback:** Test `UiHeroLanding` fallback behavior when `logoUrl` returns a 404 image or is empty.
   - **Search Form Submission:** Test search form submission when `searchSubmitUrl` is set vs omitted.
   - **Pill Nav Overflow:** Test `primaryLinks` behavior when array contains more than 8 links or long label strings on mobile viewports (< 480px).

4. **Report & Git Commit Protocol:**
   - Write complete findings to `environments/site-d-hero/result.md` in English.
   - Ensure any Mermaid diagrams quote node labels (e.g. `D1["Label"]`).
   - Run `git add environments/site-d-hero/ && git commit -m "qa(site-d-hero): complete evaluation and generate result.md"`.
