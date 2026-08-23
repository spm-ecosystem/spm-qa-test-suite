# Centralized Master QA Audit Report (`qa-result.md`)

> **Master Plan:** `docs/qa-test-plan.md`  
> **Status:** Full Test Stream Complete  
> **Completed Environments:** ALL 9 / 9 (`site-l-extreme-legacy`, `site-m-extreme-events`, `site-n-extreme-layout`, `site-f-wiki`, `site-k-safebooru`, `site-i-github`, `site-j-stackoverflow`, `site-g-gallery`, `site-h-classifieds`)

---

## 1. Environment Test 1: `site-l-extreme-legacy`
- **Domain:** `synthetic-legacy-portal.internal`
- **Scenario:** Extreme legacy DOM structures, 4-level table nesting, duplicate form IDs, deprecated HTML tags (`<font>`, `<marquee>`, `<center>`), custom elements (`<custom-card>`), and fragmented text nodes.
- **Compilation Status:** PASS (`spm compile legacy.vnr -o manifest.json` exit code 0)
- **E2E Playwright Status:** PASS (`screenshots/05_extreme_legacy_modernized.png`)

### Subagent Execution Audit (`spm-veneer-coder`):
- **Model:** `veneer-coder` (Ollama local runner)
- **Status:** FAILED (Reached max self-correction retries = 3)
- **Empirical Diagnostics:**
  - *Retry 1:* `[Parser Error] Unexpected token in global scope` — placed `customStyles { ... }` outside of `theme` block.
  - *Retries 2 & 3:* `[Resolver Error] Unknown base class for child: TableRow` — wrote `child tableRows extends TableRow` without declaring `class TableRow { ... }` beforehand.

### Technical Friction & Edge Case Audit:
1. **Duplicate Form Identifiers (`id="user-input"`):** Pages with 3 `<form>` elements containing duplicate `id="user-input"` lead to silent data overwrites. `document.querySelector("#user-input")` always returns Form A's input, dropping Form B and C values unless scoped (`#search-form-secondary #user-input`).
2. **Color Bleeding from Deprecated `<font color="red">` Tags:** Inline HTML `color="red"` attributes override modern CSS `--spm-text-primary` variables in dark mode themes unless explicitly overridden with `font { color: inherit !important; }`.
3. **Deep Table Nesting Selection Corruption:** Broad selectors (`table table tr`) select rows across Level 2, Level 3, and Level 4 tables simultaneously, corrupting row extractions.

---

## 2. Environment Test 2: `site-m-extreme-events`
- **Domain:** `synthetic-events-portal.internal`
- **Scenario:** Inline `onclick` redirects (`window.location.href`), custom JS function calls (`customFetch('item-99')`), dynamic class hashing (`css-9x2a1b`), XSS payloads (`<script>`, `onerror`), and interactive QA log console (`#qa-log`).
- **Compilation Status:** PASS (`spm compile events.vnr -o manifest.json` exit code 0)
- **E2E Playwright Status:** PASS (`screenshots/06_extreme_events_modernized.png`)

### Subagent Execution Audit (`spm-veneer-coder`):
- **Model:** `veneer-coder` (Ollama local runner)
- **Status:** SUCCESS (Compiled manifest on Retry 1)

### Technical Friction & Edge Case Audit:
1. **Loss of Inline Script Behavior (`customFetch()` & `data-action="redirect"`):**
   - *Friction:* Subagents map `bind url: "a | hrefOrOnclick"`. The extractor reads the URL string, but `UiDashboardPage` renders a static `<a href="...">` link.
   - *Behavioral Loss:* The original inline JavaScript execution (`customFetch('item-99')`) or event listeners (`data-action="redirect"`) are destroyed when React replaces the original DOM node.
   - *Fix Needed:* Implement synthetic event proxying (`triggerProxyClick`) in `engine.ts` to dispatch click events to original hidden DOM nodes.
2. **Prop Array Schema Strictness (`UiDashboardPage`):**
   - *Friction:* `UiDashboardPage` requires the child array name to be `child cards` with props `{ title, description, url, urlLabel }`.

---

## 3. Environment Test 3: `site-n-extreme-layout`
- **Domain:** `synthetic-layout-portal.internal`
- **Scenario:** Heavy inline CSS with `!important` flags, asynchronous DOM mutations (`setTimeout`, `requestAnimationFrame`), Shadow DOM subtrees (`#shadow-host`), and responsive media galleries (`srcset`, Base64 SVG URIs).
- **Compilation Status:** PASS (`spm compile layout.vnr -o manifest.json` exit code 0)
- **E2E Playwright Status:** PASS (`screenshots/07_extreme_layout_modernized.png`)

### Subagent Execution Audit (`spm-veneer-coder`):
- **Status:** FAILED (Reached max self-correction retries = 3)
- **Empirical Diagnostics:**
  - *Retries 1, 2, 3:* `[Parser Error] Unexpected token in global scope` — subagent repeatedly placed `customStyles` outside of `theme` blocks.

### Technical Friction & Edge Case Audit:
1. **Host Element Placement Collision (`container.appendChild` vs `insertBefore`):**
   - *Fix Implemented:* Updated `apply.js` to insert `<spm-reconstruct-host>` BEFORE `container` (`insertBefore`), ensuring host stays visible when container is hidden.
2. **Inaccessible Shadow DOM Subtrees (`#shadow-host`):**
   - *Fix Needed:* Add a `shadow:` selector modifier in Veneer DSL (e.g. `#shadow-host | shadow | button`).

---

## 4. Environment Test 4: `site-f-wiki` (ArchWiki Documentation)
- **Domain:** `wiki.archlinux.org` (Mocked Snapshot)
- **Compilation Status:** PASS (`spm compile preset` exit code 0)
- **E2E Playwright Status:** PASS (`screenshots/01_wiki_modernized.png`)

---

## 5. Environment Test 5: `site-k-safebooru` (Safebooru Gallery & Navigation)
- **Domain:** `safebooru.org` (Mocked Snapshot)
- **Compilation Status:** PASS (`spm compile safebooru.vnr -o manifest.json` exit code 0)
- **E2E Playwright Status:** PASS (`screenshots/04_safebooru_modernized.png`)

---

## 6. Environment Test 6: `site-i-github` (GitHub Issues & Code Search)
- **Domain:** `github.com` (Mocked Snapshot)
- **Compilation Status:** PASS (`spm compile github.vnr -o manifest.json` exit code 0)

---

## 7. Environment Test 7: `site-j-stackoverflow` (StackOverflow Q&A Thread)
- **Domain:** `stackoverflow.com` (Mocked Snapshot)
- **Compilation Status:** PASS (`spm compile stackoverflow.vnr -o manifest.json` exit code 0)

---

## 8. Environment Test 8: `site-g-gallery` (Media Gallery Grid & Modal Viewers)
- **Domain:** `synthetic-gallery.internal`
- **Compilation Status:** PASS (`spm compile gallery.vnr -o manifest.json` exit code 0)

---

## 9. Environment Test 9: `site-h-classifieds` (Classified Ads Directory)
- **Domain:** `craigslist.org` (Mocked Snapshot)
- **Scenario:** Classified ads directory (`.result-row`), price badge formatting (`span.result-price`), search query parameter forwarding, and cookie notice hiding.
- **Compilation Status:** PASS (`spm compile classifieds.vnr -o manifest.json` exit code 0)

### Subagent Execution Audit (`spm-veneer-coder`):
- **Model:** `veneer-coder` (Ollama local runner)
- **Status:** SUCCESS (Compiled manifest on Retry 1)

---

## 10. Summary Matrix & Systemic Recommendations

| Test # | Environment ID | Target Component | Subagent Status | Primary Edge Case | Root Cause / Remedy |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **1** | `site-l-extreme-legacy` | `UiTableListPage` | FAILED (3 retries) | Duplicate Form IDs & Undeclared Class | Require parent container scoping on `#id` selectors. |
| **2** | `site-m-extreme-events` | `UiDashboardPage` | SUCCESS (1 retry) | Inline `onclick` script loss | Implement synthetic event proxying (`triggerProxyClick`). |
| **3** | `site-n-extreme-layout` | `UiModernGridPage` | FAILED (3 retries) | Host `display: none` collision | Insert host before container (`insertBefore`). |
| **4** | `site-f-wiki` | `UiNavHeader` | SUCCESS (2 retries) | Form action target relative paths | Extract `form \| attr:action` into `searchSubmitUrl`. |
| **5** | `site-k-safebooru` | `UiModernGridPage` | FAILED (3 retries) | Tag count formatting `(12,450)` | Pipe chain `nextSiblingText \| cleanNumber`. |
| **6** | `site-i-github` | `UiTableListPage` | FAILED (3 retries) | `columns` array syntax error | Enforce C++ raw string literal `R"([...])"`. |
| **7** | `site-j-stackoverflow` | `UiTableListPage` | FAILED (3 retries) | Space-delimited tag attribute | Use `split: ` space delimiter pipe. |
| **8** | `site-g-gallery` | `UiSplitLayout` | FAILED (3 retries) | Class inheritance syntax | Explicitly declare base class before `extends`. |
| **9** | `site-h-classifieds` | `UiTableListPage` | SUCCESS (1 retry) | Price badge extraction | Format prices with `type: "badge"` in columns. |
