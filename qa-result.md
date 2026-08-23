# Centralized Master QA Audit Report (`qa-result.md`)

> **Master Plan:** `docs/qa-test-plan.md`  
> **Status:** Active Sequential Testing Stream  
> **Completed Environments:** 8 / 9 (`site-l-extreme-legacy`, `site-m-extreme-events`, `site-n-extreme-layout`, `site-f-wiki`, `site-k-safebooru`, `site-i-github`, `site-j-stackoverflow`, `site-g-gallery`)

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
- **Scenario:** Multi-column media gallery (`.post-preview`), tag sidebar listing (`#tag-sidebar`), and modal image detail view (`.post-detail-view`).
- **Compilation Status:** PASS (`spm compile gallery.vnr -o manifest.json` exit code 0)

### Subagent Execution Audit (`spm-veneer-coder`):
- **Model:** `veneer-coder` (Ollama local runner)
- **Status:** FAILED (Reached max self-correction retries = 3)
- **Empirical Diagnostics:**
  - *Retry 1:* `[Resolver Error] Unknown base class for child: PostCard` — subagent wrote `extends PostCard` without declaring `class PostCard`.
  - *Retries 2 & 3:* `[Resolver Error] Unknown base class for child: TagLink` — subagent wrote `extends TagLink` without declaring `class TagLink`.

### Technical Friction & Edge Case Audit:
1. **Class Inheritance via `extends` Syntax:**
   - *DSL Verification:* Veneer Spec class inheritance (`class DetailedGalleryItem extends GalleryItem`) compiles seamlessly into flattened manifest prop maps.
