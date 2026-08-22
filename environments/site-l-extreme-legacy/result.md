# Documentation & Runtime Audit Report: site-l-extreme-legacy

## 1. Executive Summary
- **Target Environment:** `site-l-extreme-legacy` (Deep Table Nesting, Duplicate Identifiers, Obsolete HTML Tags, Custom Elements & Fragmented Nodes)
- **Overall Experience:** High Friction during Veneer Spec authoring due to DOM selector collisions and table nesting complexity.
- **Compilation Status:** PASS (`spm compile legacy.vnr -o manifest.json` exit code 0)
- **Component Match & Rendering:** Moderate — `UiTableListPage` rendered successfully, but nested table levels caused cell text fragmentation and HTML font color bleeding.
- **Confidence Level:** High (Verified via empirical HTML analysis, Playwright E2E execution, and `spm-veneer-coder` evaluation).

---

## 2. Compilation & Transformation Results
- **Command:** `spm compile legacy.vnr -o manifest.json`
- **Exit code:** 0
- **manifest.json valid JSON:** Yes
- **Applied Output:** `fixtures/result.html` generated with `<spm-modern-component>` and `<spm-reconstruct-host>` hosts.

---

## 3. Deep Audit: Where the Subagent & Veneer Spec Struggle

Through systematic analysis of `legacy.vnr`, `spm-veneer-coder` execution logs, and rendered DOM output, we identified four major friction areas in legacy HTML modernization:

### 3.1 Deep Table Nesting & Corrupted Cell Extraction (Section 1)
- **The Issue:** Section 1 contains 4 levels of nested `<table>` elements with legacy attributes (`border="2"`, `bgcolor="#ffdddd"`), `colspan`/`rowspan`, and malformed/missing `</td>` closing tags.
- **Where Subagent Struggles:** The subagent writes broad selectors like `selector: "table table tr"`. This selector matches rows across Level 2, Level 3, AND Level 4 tables simultaneously!
- **Data Corruption:** `UiTableListPage` receives rows from all table levels mixed together. Outer cell extractions contain raw HTML strings of nested tables rather than clean text values.
- **Root Cause:** Lack of strict direct-descendant child combinators (`>`) in LLM-generated selectors, and lack of a `UiNestedTreeTable` component for hierarchical data.
- **Proposed Solution:** Require explicit direct child selectors (e.g. `table#outer-table > tbody > tr`) in Veneer guidelines, and introduce a `cleanText` pipe that strips nested table tags during extraction.

### 3.2 Duplicate Identifier Collisions across Forms (Section 2)
- **The Issue:** Section 2 contains 3 distinct `<form>` elements (`#search-form-primary`, `#search-form-secondary`, `#search-form-footer`), all containing inputs with duplicate `id="user-input"` and `name="query"`.
- **Where Subagent Struggles:** Subagents naturally assume `id` attributes are unique per document. When authoring `.vnr`, subagents use `#user-input | attr:value` without form-scoped prefixes.
- **Silent Data Overwrite:** `document.querySelector("#user-input")` ALWAYS returns the first input in Form A. Form B ("secondary search term") and Form C inputs are silently ignored and overwritten by Form A's value.
- **Root Cause:** Insufficient scoping in LLM prompt context and lack of compiler warnings for duplicate ID references.
- **Proposed Solution:** Update `spm compile` / `spm validate` to detect duplicate `id` attributes in snapshots and issue a diagnostic warning requiring parent container scoping (e.g. `#search-form-secondary #user-input`).

### 3.3 Color Bleeding from Deprecated `<font color="...">` Tags (Section 3)
- **The Issue:** Section 3 wraps text inside obsolete `<font color="red" size="4">` and `<marquee>` tags.
- **Where Subagent Struggles:** Subagents define modern CSS variables (`--spm-text-primary: "#c9d1d9"`), but standard CSS variables **do not override HTML inline `color="red"` attributes** on `<font>` tags.
- **Visual Defect:** Red legacy font colors bleed through into modern dark mode themes, creating unreadable contrast against dark surfaces.
- **Root Cause:** Legacy HTML attributes override CSS custom properties unless explicitly reset with `!important`.
- **Proposed Solution:** Automatically inject legacy tag resets (`font { color: inherit !important; font-family: inherit !important; } marquee { display: inline-block !important; }`) into all generated theme `customStyles`.

### 3.4 Text Node Fragmentation across Comment Blocks (Section 4)
- **The Issue:** Section 4 contains text nodes fragmented across HTML comments `<!-- text fragment -->` and formatting tags (`<b>`, `<i>`, `<span>`).
- **Where Subagent Struggles:** Choosing between `text` and `html` pipes. Using `html` extracts comment blocks, while `text` can collapse whitespace.
- **Proposed Solution:** Use `cleanText` pipe to automatically strip HTML comments and normalize multiple spaces into clean strings.

---

## 4. Defect & Gap Catalog

| Defect ID | Location | Classification | Finding | Proposed Remediation |
| :--- | :--- | :--- | :--- | :--- |
| `DEFECT-LEG-01` | `spm validate` CLI | Compiler / Selector Validation | `spm validate` does not warn when selectors reference duplicate `id` attributes without parent container scoping. | Emit diagnostic warning when duplicate IDs exist in HTML snapshot. |
| `DEFECT-LEG-02` | `engine.ts` | Extractor Pipe Gap | `text` pipe extracts text mixed with child table markup when nested tables are un-scoped. | Add `cleanText` pipe to strip nested table tags and normalize whitespace. |
| `DEFECT-LEG-03` | `spm-components` | Component Gap | No `UiNestedTreeTable` or `UiHierarchicalList` component exists for multi-level table data. | Add `UiNestedTreeTable` component to `spm-components`. |
| `DEFECT-LEG-04` | `spm compile` | CSS Theme Generation | HTML `<font color="...">` attributes override theme `--spm-text-primary` colors in dark mode. | Automatically append `<font>` reset rules to compiled `customStyles`. |

---

## 5. Recommended Actions for Ecosystem Improvement

1. **Add Duplicate ID Diagnostics in `spm validate`:** Flag unscoped `#id` selectors when duplicate IDs exist across forms.
2. **Inject Legacy Tag Resets in Theme Compiler:** Include `<font>` and `<center>` reset rules in `spm compile` CSS generator.
3. **Introduce `cleanText` Pipe:** Ensure text extractions strip comments and nested child tables cleanly.
