# Documentation & Runtime Audit Report: site-m-extreme-events

## 1. Executive Summary
- **Target Environment:** `site-m-extreme-events` (Event Handlers, Dynamic Selectors, XSS Sanitization & Interactive Log Console)
- **Overall Experience:** High Friction during Veneer Spec authoring due to component gaps and event proxying limitations.
- **Compilation Status:** PASS (`spm compile events.vnr -o manifest.json` exit code 0)
- **Component Match & Rendering:** Moderate — `UiDashboardPage` and `UiSearchBar` rendered, but interactive DOM scripts (`customFetch()`) and event logs required manual slot reparenting and style overrides.
- **Confidence Level:** High (Verified via empirical HTML analysis, Playwright E2E execution, and `spm-veneer-coder` subagent retries).

---

## 2. Compilation & Transformation Results
- **Command:** `spm compile events.vnr -o manifest.json`
- **Exit code:** 0
- **manifest.json valid JSON:** Yes
- **Applied Output:** `fixtures/result.html` generated with `<spm-modern-component>` and `<spm-reconstruct-host>` hosts.

---

## 3. Deep Audit: Where the Subagent & Veneer Spec Struggle

Through systematic analysis of `events.vnr`, `spm-veneer-coder` execution logs, and rendered DOM output, we identified four major friction areas where subagents fail or produce degraded UIs:

### 3.1 Loss of Interactive Script Behavior (`hrefOrOnclick` vs Event Execution)
- **The Issue:** Legacy buttons in Section 1 use complex inline scripts: `onclick="void(0); customFetch('item-99')"`.
- **Where Subagent Struggles:** The subagent maps `bind url: "a | hrefOrOnclick"`, which extracts the URL string (or function string). When `UiDashboardPage` renders a `DashboardCard`, it places the extracted string inside a standard `<a href="...">` anchor link.
- **Data/Behavior Loss:** Clicking the new React card navigates or triggers an anchor click, **but the original `customFetch('item-99')` JavaScript function in the page context is never executed**.
- **Root Cause:** React Shadow DOM components replace the original DOM node, destroying inline `onclick` function bindings and event listeners.
- **Proposed Solution:** Introduce an **Event Proxying Protocol** in the SPM engine (e.g. `triggerProxyClick`) that dispatches synthetic click events to the underlying hidden DOM node instead of replacing it with a static hyperlink.

### 3.2 Component Contract Mismatch (`UiDashboardPage` Schema Strictness)
- **The Issue:** `UiDashboardPage` requires an exact child array named `child cards` with keys `{ title, description, url, urlLabel }`.
- **Where Subagent Struggles:** LLM subagents frequently invent natural child array names like `child eventFeed` or `child actionItems`. When compiled, the manifest outputs `"eventFeed": [...]`. However, React's `UiDashboardPage` ignores `eventFeed` and looks only for `props.cards`, causing the component to render **"No options available."** and lose all card data visually.
- **Root Cause:** Documentation gaps and lack of strict JSON Schema enforcement in `spm compile` when validating component prop array names against `spm-components` contracts.
- **Proposed Solution:** Update `spm compile` to warn or fail if a `child` array name does not match the target component's documented prop interface.

### 3.3 Loss of Shadow DOM Encapsulated Styles on Preserved Slots (`#qa-log`)
- **The Issue:** Section 4 contains an interactive QA log console (`#qa-log`) reparented into a Shadow DOM slot via `preserve { interactiveConsole: "#qa-log" }`.
- **Where Subagent Struggles:** Reparenting the element into Shadow DOM strips the document's external CSS styles (`#qa-log` font-family, background colors, scrollbar styling).
- **Data/Visual Defect:** The reparented log box renders unstyled text without borders or dark background.
- **Root Cause:** Preserved DOM nodes moved into a Shadow Root inherit only styles defined inside the host Shadow Root or global `:host` custom properties.
- **Proposed Solution:** Create a dedicated, native `UiTerminalConsole` component in `spm-components` for log output, OR automatically copy external element stylesheets into the Shadow Root when reparenting `preserve` slots.

### 3.4 Unstable Hashed Selectors (`.css-9x2a1b`)
- **The Issue:** Section 2 tests CSS-in-JS obfuscated classes (`class="css-9x2a1b item-wrapper"`).
- **Where Subagent Struggles:** Subagents write exact string selectors like `.css-9x2a1b`, which break as soon as the target website rebuilds and changes class hashes.
- **Proposed Solution:** Provide guidelines and compiler diagnostics encouraging attribute substring selectors (e.g. `[class*='item-wrapper']` or `[data-target^='item']`).

---

## 4. Defect & Gap Catalog

| Defect ID | Location | Classification | Finding | Proposed Remediation |
| :--- | :--- | :--- | :--- | :--- |
| `DEFECT-EV-01` | `engine.ts` / `modernizer.tsx` | Engine / Event Proxy | Inline `onclick` script calls (`customFetch()`) are destroyed when reconstructed into React cards. | Implement synthetic event proxying (`triggerProxyClick`) for reconstructed click targets. |
| `DEFECT-EV-02` | `spm compile` CLI | Compiler / Schema Validation | `spm compile` accepts invalid child prop names (e.g. `child eventFeed` instead of `child cards`), resulting in empty component renders. | Add component prop contract validation into `spm compile`. |
| `DEFECT-EV-03` | `spm-components` | Component Gap / Missing Component | No dedicated `UiTerminalConsole` or `UiEventLog` component exists for live interactive log streams. | Create `UiTerminalConsole` component in `spm-components`. |
| `DEFECT-EV-04` | `modernizer.tsx:L406` | Shadow DOM / Styling Loss | Preserved nodes (`#qa-log`) lose external CSS styles when reparented into Shadow DOM slots. | Inject host CSS rules or preserve element inline styles during reparenting. |

---

## 5. Recommended Actions for Ecosystem Improvement

1. **Implement `spm compile` Prop Schema Validation:** Reject or warn when `child <name>` does not match documented component prop keys.
2. **Add `UiTerminalConsole` Component to `spm-components`:** Provide a native React component for log streams and interactive output.
3. **Enhance Event Proxying in Engine:** Ensure `hrefOrOnclick` extraction can dispatch click events to original elements when links use custom JavaScript functions.
