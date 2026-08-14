# QA Environment Task Brief: Site B - Safebooru Image Catalog & Gallery (`site-b-catalog`)

## 🌐 Target Site & Page Details
- **Target URL Pattern:** `https://safebooru.org/index.php?page=post&s=list*`
- **Site Type:** Retro Anime & Image Catalog (Safebooru)
- **Target Components:** `UiSplitLayout`, `UiImageViewer`, `UiScrollPanel`, `UiTagBadge`

---

## 🎯 Modernization & QA Objectives

1. **Scraping Pipeline Validation (`catalog.vnr`):**
   - Validate thumbnail extractions (`span.thumb img | attr:src`), image links (`a | attr:href`), and tag sidebar lists (`#tag-sidebar li`).
   - Reconstruct main gallery wrapper `#content` into `UiSplitLayout` and `UiScrollPanel`.

2. **Destructive Boundary & Robustness Testing:**
   - **Ultra-Wide Aspect Ratios:** Test `UiImageViewer` rendering behavior when loading ultra-panoramic images (32:9 ratio).
   - **Empty Filter Handling:** Test `UiScrollPanel` rendering when tag query arrays return empty (`tags: []`).
   - **Sidebar Search:** Test `UiSearchBar` query forwarding in the sidebar slot.

3. **Documentation Coverage Audit:**
   - Evaluate whether `docs/component-specs.md` accurately documents `UiSplitLayout` and `UiScrollPanel` props contracts and child bindings.

4. **Report & Git Commit Protocol:**
   - Write complete findings to `environments/site-b-catalog/result.md` in English.
   - Run `git add environments/site-b-catalog/ && git commit -m "qa(site-b-catalog): complete evaluation and generate result.md"`.
