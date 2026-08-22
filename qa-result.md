# Centralized Master QA Audit Report (`qa-result.md`)

> **Master Plan:** `docs/qa-test-plan.md`  
> **Status:** Active Sequential Testing Stream  
> **Completed Environments:** 6 / 9 (`site-l-extreme-legacy`, `site-m-extreme-events`, `site-n-extreme-layout`, `site-f-wiki`, `site-k-safebooru`, `site-i-github`)

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
- **Log:** Generated `.vnr` spec and `content.css` correctly specifying `child cards` schema.

---

## 3. Environment Test 3: `site-n-extreme-layout`
- **Domain:** `synthetic-layout-portal.internal`
- **Scenario:** Heavy inline CSS with `!important` flags, asynchronous DOM mutations (`setTimeout`, `requestAnimationFrame`), Shadow DOM subtrees (`#shadow-host`), and responsive media galleries (`srcset`, Base64 SVG URIs).
- **Compilation Status:** PASS (`spm compile layout.vnr -o manifest.json` exit code 0)
- **E2E Playwright Status:** PASS (`screenshots/07_extreme_layout_modernized.png`)

---

## 4. Environment Test 4: `site-f-wiki` (ArchWiki Documentation)
- **Domain:** `wiki.archlinux.org` (Mocked Snapshot)
- **Scenario:** MediaWiki navigation header, sidebar navigation panel (`#mw-panel`), top search form (`#searchform`), and dark wiki documentation theme.
- **Compilation Status:** PASS (`spm compile preset` exit code 0)
- **E2E Playwright Status:** PASS (`screenshots/01_wiki_modernized.png`)

---

## 5. Environment Test 5: `site-k-safebooru` (Safebooru Gallery & Navigation)
- **Domain:** `safebooru.org` (Mocked Snapshot)
- **Scenario:** Anime art gallery grid (`span.thumb`), tag metadata sidebar (`#tag-sidebar`), search bar (`#searchform`), and header navigation (`#header`).
- **Compilation Status:** PASS (`spm compile safebooru.vnr -o manifest.json` exit code 0)
- **E2E Playwright Status:** PASS (`screenshots/04_safebooru_modernized.png`)

---

## 6. Environment Test 6: `site-i-github` (GitHub Issues & Code Search)
- **Domain:** `github.com` (Mocked Snapshot)
- **Scenario:** GitHub repository issue list (`.js-issue-row`), repository search form (`#searchform`), and dark GitHub issue tracker theme.
- **Compilation Status:** PASS (`spm compile github.vnr -o manifest.json` exit code 0)

### Subagent Execution Audit (`spm-veneer-coder`):
- **Model:** `veneer-coder` (Ollama local runner)
- **Status:** FAILED (Reached max self-correction retries = 3)
- **Empirical Diagnostics:**
  - *Retries 1 & 2:* `[Resolver Error] Unknown base class for child: BaseLabelItem` — subagent wrote `extends BaseLabelItem` without declaring `class BaseLabelItem`.
  - *Retry 3:* `[Parser Error] Line 13: Expected ':' after property key` — syntax error in raw array literal for `columns`.

### Technical Friction & Edge Case Audit:
1. **Raw String Literal Syntax for `columns`:**
   - *Friction:* Veneer DSL requires `columns` JSON definitions to use C++ raw string literal syntax `columns: R"([ ... ])";`.
   - *Failure Mode:* Writing standard JSON arrays `columns: [ ... ]` fails in compiler parser (`Expected ':' after property key`).
2. **Issue Label Splitting Pipe (`split:,`):**
   - *Pipe Verification:* `bind labels: "self | attr:data-labels | split:,"` correctly parses comma-separated data attributes into array props.
