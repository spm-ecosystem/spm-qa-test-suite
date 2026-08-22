# Centralized Master QA Audit Report (`qa-result.md`)

> **Master Plan:** `docs/qa-test-plan.md`  
> **Status:** Active Sequential Testing Stream  
> **Completed Environments:** 2 / 9 (`site-l-extreme-legacy`, `site-m-extreme-events`)

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

### Cataloged Defect Summary (`site-m-extreme-events`):
- `DEFECT-EV-01` [Engine/Proxy]: Inline `onclick` script calls (`customFetch()`) destroyed during component replacement.
- `DEFECT-EV-02` [Compiler/Schema]: `spm compile` accepts non-matching child prop names (`child eventFeed` instead of `child cards`).
- `DEFECT-EV-03` [Component Library]: Missing `UiTerminalConsole` component for live interactive log streams.
