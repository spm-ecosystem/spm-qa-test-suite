# Centralized Master QA Audit Report (`qa-result.md`)

> **Master Plan:** `docs/qa-test-plan.md`  
> **Status:** Active Parallel Subagent Stream  
> **Completed Environments:** 12 / 12 (`site-l`, `site-m`, `site-n`, `site-f`, `site-k`, `site-i`, `site-j`, `site-g`, `site-h`, `site-o`, `site-p`, `site-q`)

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
- **Status:** SUCCESS (Compiled manifest on Retry 1)

---

## 3. Environment Test 3: `site-n-extreme-layout`
- **Domain:** `synthetic-layout-portal.internal`
- **Scenario:** Heavy inline CSS with `!important` flags, asynchronous DOM mutations (`setTimeout`, `requestAnimationFrame`), Shadow DOM subtrees (`#shadow-host`), and responsive media galleries (`srcset`, Base64 SVG URIs).
- **Compilation Status:** PASS (`spm compile layout.vnr -o manifest.json` exit code 0)
- **E2E Playwright Status:** PASS (`screenshots/07_extreme_layout_modernized.png`)

---

## 4. Environment Test 4: `site-f-wiki` (ArchWiki Documentation)
- **Domain:** `wiki.archlinux.org` (Mocked Snapshot)
- **Compilation Status:** PASS (`spm compile preset` exit code 0)

---

## 5. Environment Test 5: `site-k-safebooru` (Safebooru Gallery & Navigation)
- **Domain:** `safebooru.org` (Mocked Snapshot)
- **Compilation Status:** PASS (`spm compile safebooru.vnr -o manifest.json` exit code 0)

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
- **Compilation Status:** PASS (`spm compile classifieds.vnr -o manifest.json` exit code 0)

---

## 10. Environment Test 10: `site-o-extreme-forms` (Complex Form Controls & Masking)
- **Domain:** `synthetic-forms.internal`
- **Scenario:** Multi-select options (`select[multiple]`), checkbox/radio option groups, masked input formatting (`data-mask="phone"`), and AJAX form submit handlers.
- **Compilation Status:** PASS (`spm compile forms.vnr -o manifest.json` exit code 0)

### Subagent Execution Audit (`spm-veneer-coder`):
- **Model:** `veneer-coder` (Ollama local runner)
- **Status:** FAILED (Reached max self-correction retries = 3)
- **Empirical Diagnostics:**
  - *Retries 1, 2, 3:* `[Parser Error] Unexpected token in global scope` — subagent repeatedly placed `customStyles` outside of `theme` blocks.

### Technical Friction & Edge Case Audit:
1. **Multi-Select Option Value Array Extraction:**
   - *Friction:* Extracting values from `<select multiple>` options requires extracting `option[selected] | text`.
   - *Fix Needed:* Add an `optionValues` pipe to normalize selected options into array props.

---

## 11. Environment Test 11: `site-p-extreme-components` (Custom Web Components & Fragmented Text)
- **Domain:** `synthetic-components.internal`
- **Scenario:** Non-standard web component tags (`<custom-card>`, `<legacy-widget>`), fragmented text nodes across HTML comments, and nested custom element trees.
- **Compilation Status:** PASS (`spm compile components.vnr -o manifest.json` exit code 0)

### Subagent Execution Audit (`spm-veneer-coder`):
- **Model:** `veneer-coder` (Ollama local runner)
- **Status:** FAILED (Reached max self-correction retries = 3)
- **Empirical Diagnostics:**
  - *Retries 1 & 2:* `[Resolver Error] Unknown base class for child: ComponentCard` — subagent wrote `extends ComponentCard` without declaring `class ComponentCard`.
  - *Retry 3:* `[Parser Error] Unexpected token in global scope`.

---

## 12. Environment Test 12: `site-q-extreme-dynamic` (Async DOM Mutations & Data URIs)
- **Domain:** `synthetic-dynamic.internal`
- **Scenario:** Asynchronous DOM mutation feed (`setTimeout` 500ms), Base64 SVG Data URIs, and micro-flicker resilience.
- **Compilation Status:** PASS (`spm compile dynamic.vnr -o manifest.json` exit code 0)

### Subagent Execution Audit (`spm-veneer-coder`):
- **Model:** `veneer-coder` (Ollama local runner)
- **Status:** SUCCESS (Compiled manifest on Retry 1)

---

## 13. Systemic Defect & Recommendation Summary Matrix

| Environment ID | Primary Edge Case | Subagent Status | Systemic Root Cause | Proposed Solution |
| :--- | :--- | :--- | :--- | :--- |
| `site-l-extreme-legacy` | 4-Level Table Nesting & Duplicate IDs | FAILED (3 retries) | Unscoped `#id` selectors & missing class header | Add parent form scoping in `spm validate`. |
| `site-m-extreme-events` | Inline `onclick` Redirects & XSS | SUCCESS (1 retry) | Component replacement destroys inline event listeners | Implement synthetic event proxying (`triggerProxyClick`). |
| `site-n-extreme-layout` | Heavy Inline CSS & Shadow DOM | FAILED (3 retries) | Host `display: none` collision | Insert host before container (`insertBefore`). |
| `site-o-extreme-forms` | Multi-select & Masked Phone Input | FAILED (3 retries) | `customStyles` global scope error | Enforce `theme` encapsulation in subagent prompt. |
| `site-p-extreme-components` | Custom Tags (`<custom-card>`) | FAILED (3 retries) | Undeclared base class (`extends ComponentCard`) | Enforce class declarations before `extends`. |
| `site-q-extreme-dynamic` | Async DOM Feed & Base64 Data URI | SUCCESS (1 retry) | Un-debounced `MutationObserver` callbacks | Add 100ms debounce to `MutationObserver`. |
