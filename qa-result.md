# Centralized Master QA Audit Report (`qa-result.md`)

> **Master Plan:** `docs/qa-test-plan.md`  
> **Status:** Active Sequential Testing Stream  
> **Completed Environments:** 4 / 9 (`site-l-extreme-legacy`, `site-m-extreme-events`, `site-n-extreme-layout`, `site-f-wiki`)

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

### Cataloged Defect Summary (`site-l-extreme-legacy`):
- `DEFECT-LEG-01` [Compiler/Resolver]: Subagent fails compilation when extending undeclared base classes (`extends TableRow`).
- `DEFECT-LEG-02` [Compiler/Validation]: `spm validate` missing diagnostic warnings for duplicate `#id` references.
- `DEFECT-LEG-03` [Theme Engine]: HTML `<font color="...">` overrides theme `--spm-text-primary` in dark mode.

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

### Technical Friction & Edge Case Audit:
1. **Loss of Inline Script Behavior (`customFetch()` & `data-action="redirect"`):**
   - *Friction:* Subagents map `bind url: "a | hrefOrOnclick"`. The extractor reads the URL string, but `UiDashboardPage` renders a static `<a href="...">` link.
   - *Behavioral Loss:* The original inline JavaScript execution (`customFetch('item-99')`) or event listeners (`data-action="redirect"`) are destroyed when React replaces the original DOM node.
   - *Fix Needed:* Implement synthetic event proxying (`triggerProxyClick`) in `engine.ts` to dispatch click events to original hidden DOM nodes.
2. **Prop Array Schema Strictness (`UiDashboardPage`):**
   - *Friction:* `UiDashboardPage` requires the child array name to be `child cards` with props `{ title, description, url, urlLabel }`.
   - *Failure Mode:* Inventing natural names like `child eventFeed` causes `UiDashboardPage` to receive `cards = []` and render **"No options available."**.
3. **Shadow DOM Style Loss on Preserved Slots (`preserve`):**
   - *Friction:* Moving `#qa-log` into a Shadow DOM slot via `preserve { interactiveConsole: "#qa-log" }` strips external document CSS (background, fonts).
   - *Fix Needed:* Introduce a dedicated `UiTerminalConsole` component in `spm-components`.

---

## 3. Environment Test 3: `site-n-extreme-layout`
- **Domain:** `synthetic-layout-portal.internal`
- **Scenario:** Heavy inline CSS with `!important` flags, asynchronous DOM mutations (`setTimeout`, `requestAnimationFrame`), Shadow DOM subtrees (`#shadow-host`), and responsive media galleries (`srcset`, Base64 SVG URIs).
- **Compilation Status:** PASS (`spm compile layout.vnr -o manifest.json` exit code 0)
- **E2E Playwright Status:** PASS (`screenshots/07_extreme_layout_modernized.png`)

### Subagent Execution Audit (`spm-veneer-coder`):
- **Model:** `veneer-coder` (Ollama local runner)
- **Status:** FAILED (Reached max self-correction retries = 3)
- **Empirical Diagnostics:**
  - *Retries 1, 2, 3:* `[Parser Error] Unexpected token in global scope` — subagent repeatedly placed `customStyles` and un-nested class rules outside of `theme` blocks.

### Technical Friction & Edge Case Audit:
1. **Host Element Placement Collision (`container.appendChild` vs `insertBefore`):**
   - *Friction:* `apply.js` originally inserted `<spm-reconstruct-host>` inside `container` (`container.appendChild(host)`).
   - *Failure Mode:* When `modernizer.tsx` set `container.style.display = 'none'`, it hid the container AND the host inside it, causing the entire reconstructed section to disappear.
   - *Fix Implemented:* Updated `apply.js` to insert `<spm-reconstruct-host>` BEFORE `container` (`insertBefore`), ensuring host stays visible when container is hidden.
2. **Inaccessible Shadow DOM Subtrees (`#shadow-host`):**
   - *Friction:* Standard CSS selectors cannot query inside `element.shadowRoot`. Data inside `#shadow-host` returns 0 elements.
   - *Fix Needed:* Add a `shadow:` selector modifier in Veneer DSL (e.g. `#shadow-host | shadow | button`).
3. **Rapid DOM Mutation Churn (`requestAnimationFrame`):**
   - *Friction:* Rapid client-side DOM updates trigger un-debounced `MutationObserver` callbacks in `modernizer.tsx`.
   - *Fix Needed:* Add 100ms debounce timer to `MutationObserver` in `modernizer.tsx`.

---

## 4. Environment Test 4: `site-f-wiki` (ArchWiki Documentation)
- **Domain:** `wiki.archlinux.org` (Mocked Snapshot)
- **Scenario:** MediaWiki navigation header, sidebar navigation panel (`#mw-panel`), top search form (`#searchform`), and dark wiki documentation theme.
- **Compilation Status:** PASS (`spm compile preset` exit code 0)
- **E2E Playwright Status:** PASS (`screenshots/01_wiki_modernized.png`)

### Subagent Execution Audit (`spm-veneer-coder`):
- **Model:** `veneer-coder` (Ollama local runner)
- **Status:** SUCCESS (Compiled manifest on Retry 2)
- **Log:** Required 2 retries to fix `UiNavHeader` props mapping syntax for `#mw-navigation`.

### Technical Friction & Edge Case Audit:
1. **MediaWiki Form Action Target (`#searchform`):**
   - MediaWiki search forms use `action="/index.php"`. The subagent must extract `form | attr:action` into `searchSubmitUrl` to prevent broken relative search redirects.
2. **Sidebar Hiding Cleanliness (`#mw-panel`):**
   - Setting `selector "#mw-panel, #footer, .mw-indicators" { action: hide; }` collapses legacy left margins in MediaWiki layout cleanly.
