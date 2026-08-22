# Documentation & Runtime Audit Report: site-n-extreme-layout

## 1. Executive Summary
- **Target Environment:** `site-n-extreme-layout` (Heavy Inline CSS with !important, Asynchronous DOM Mutations, Shadow DOM Subtrees & Responsive Media Galleries)
- **Overall Experience:** High Friction during initial host placement and Shadow DOM tree querying.
- **Compilation Status:** PASS (`spm compile layout.vnr -o manifest.json` exit code 0)
- **Component Match & Rendering:** Excellent (after host placement fix) — `UiModernGridPage` renders responsive media cards and pagination controls cleanly.
- **Confidence Level:** High (Verified via empirical HTML analysis, Playwright E2E execution, and `spm-veneer-coder` evaluation).

---

## 2. Compilation & Transformation Results
- **Command:** `spm compile layout.vnr -o manifest.json`
- **Exit code:** 0
- **manifest.json valid JSON:** Yes
- **Applied Output:** `fixtures/result.html` generated with `<spm-modern-component>` and `<spm-reconstruct-host>` hosts.

---

## 3. Deep Audit: Where the Subagent & Veneer Spec Struggle

Through systematic analysis of `layout.vnr`, `spm-veneer-coder` execution logs, and rendered DOM output, we identified four major friction areas in layout modernization:

### 3.1 Host Element Hiding Collision (`container.appendChild(host)` vs `display: none`)
- **The Issue:** In static CLI transformations (`spm apply`), `spm-reconstruct-host` was originally appended *inside* the target container element (`container.appendChild(host)`).
- **Where Subagent & Engine Failed:** When `modernizer.tsx` executed in the browser, it set `(container as HTMLElement).style.display = 'none'` to hide the legacy HTML layout. Because the React host was inside the container, hiding the container **hid the entire modern React component along with it**, causing the entire reconstructed section to disappear from the page.
- **Root Cause:** Host placement mismatch between static CLI preprocessor (`apply.js`) and runtime extension injector (`modernizer.tsx`).
- **Resolution:** Fixed `apply.js` to insert `<spm-reconstruct-host>` *before* the container element (`container.parentNode.insertBefore(host, container)`), ensuring the host remains visible when the legacy container is hidden.

### 3.2 Inaccessible Shadow DOM Subtrees (`#shadow-host`)
- **The Issue:** Section 3 contains an open Shadow DOM root attached to `#shadow-host`.
- **Where Subagent Struggles:** Standard CSS selectors (e.g. `#shadow-host p` or `#shadow-host button`) in JSDOM and Veneer Spec **cannot pierce Shadow DOM boundaries**.
- **Data Loss:** Queries for elements inside `#shadow-host` return 0 elements. The subagent cannot extract props or text from components encapsulated inside Shadow DOM roots.
- **Root Cause:** Lack of a Shadow DOM piercing pipe or selector syntax in Veneer DSL.
- **Proposed Solution:** Introduce a `shadow:` selector modifier or pipe (e.g. `#shadow-host | shadow | button`) in Veneer Spec DSL to query inside `element.shadowRoot`.

### 3.3 Dynamic DOM Mutations & Re-render Cascades (Section 2)
- **The Issue:** Section 2 simulates async AJAX DOM updates using `setTimeout(500ms)` and `requestAnimationFrame`.
- **Where Subagent Struggles:** When async scripts insert new nodes into the DOM after page load, `modernizer.tsx`'s `MutationObserver` triggers. If not properly debounced, rapid mutations (e.g. `requestAnimationFrame`) cause layout recalculation churn and micro-flickers.
- **Proposed Solution:** Implement mutation observer debouncing (100ms window) in `modernizer.tsx` for dynamic container updates.

### 3.4 Responsive Media Gallery Extraction (`srcset` & Base64 Data URIs)
- **The Issue:** Section 4 contains images using `srcset="data:image/svg+xml;base64,... 300w, ... 800w"` and fallback `onerror` handlers.
- **Subagent Match Success:** `UiModernGridPage` handled Base64 image URIs cleanly when `bind imageUrl: "img | attr:src"` was targeted at `.media-card`.
- **Observation:** `attr:src` extracts the primary Base64 Data URI seamlessly without requiring external image network requests.

---

## 4. Defect & Gap Catalog

| Defect ID | Location | Classification | Finding | Proposed Remediation |
| :--- | :--- | :--- | :--- | :--- |
| `DEFECT-LAY-01` | `spm-cli/apply.js` | Preprocessor Bug (FIXED) | `apply.js` inserted `<spm-reconstruct-host>` inside container, causing `display: none` to hide host. | Insert `<spm-reconstruct-host>` before container (`insertBefore`). |
| `DEFECT-LAY-02` | `engine.ts` / Veneer DSL | Language / Extraction Gap | JSDOM selectors cannot query elements inside `#shadow-host` Shadow DOM roots. | Add `| shadow |` selector modifier in Veneer DSL to pierce Shadow DOM trees. |
| `DEFECT-LAY-03` | `modernizer.tsx` | Performance / Churn | Rapid DOM mutations (`requestAnimationFrame`) trigger un-debounced MutationObserver callbacks. | Add 100ms debounce timer to `MutationObserver` in `modernizer.tsx`. |
| `DEFECT-LAY-04` | `spm-components` | CSS Isolation | Host element inherits `z-index: -9999` and extreme inline styles from legacy container wrapper. | Strip high-risk inline styles (`z-index`, `margin`) from host containers. |

---

## 5. Recommended Actions for Ecosystem Improvement

1. **Add Shadow DOM Piercing to Veneer DSL:** Support `| shadow |` syntax for querying subtrees inside `shadowRoot`.
2. **Debounce MutationObserver in Engine:** Prevent layout churn on rapid client-side DOM mutations.
3. **Reset Host Container Inline Styles:** Ensure host containers ignore negative `z-index` and overflow overrides from legacy parent wrappers.
