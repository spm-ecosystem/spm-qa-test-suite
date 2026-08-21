# Documentation Audit Report: site-h-classifieds (Craigslist Classifieds Board)

## 1. Executive Summary
- **Overall Documentation Experience:** Moderate Friction
- **Documentation Sufficiency Score:** 6/10
- **Compilation Status:** Pass
- **Confidence Level:** High — doc gaps verified

---
## 2. Compilation Results
- **Command:** `/home/watashi/Projects/spm-cli/spm compile . -o manifest.json`
- **Exit code:** 0
- **manifest.json valid JSON:** Yes
- **Expected fields present:** `theme`, `reconstructs`, `components`
- **Errors/Warnings:** None
- **Cross-check:**
  - The compiled reconstructs and component selectors match the source directives in [classifieds.vnr](file:///home/watashi/Projects/spm-qa-test-suite/environments/site-h-classifieds/classifieds.vnr) exactly.
  - Validation against [page-snapshot.html](file:///home/watashi/Projects/spm-qa-test-suite/environments/site-h-classifieds/fixtures/page-snapshot.html) passed with 8 passes and 0 failures.
  - The application command successfully modernized the HTML markup, producing [result.html](file:///home/watashi/Projects/spm-qa-test-suite/environments/site-h-classifieds/fixtures/result.html).

---

## 3. What Worked Well (Positive Highlights)
- `class ClassifiedAdItem` with `scope: ".result-row"` compiles cleanly, mapping extraction selectors properly to the sub-containers.
- Class extension works as intended; `child tableRows extends ClassifiedAdItem` successfully inherits all base fields.
- Multiple `selector` declarations targeting distinct components (ads, footers, deprecations) map to clean visual-hiding behaviors.
- The `preserve` dictionary block extracts named slots (`breadcrumb`, `legalDisclaimer`, `csrfToken`, `sessionId`) and propagates them.
- Consolidated `UiTableListPage` column config supporting `"date"` and `"currency"` types (addressing `DEFECT-SHC-04`) renders formatting successfully.

---

## 4. Friction Points & Difficulties Encountered
- **Documentation Gaps:**
  - `selector` action `wrap` is undocumented. The central reference guides do not explain how to wrap elements or provide any examples.
  - The `scope` directive behavior when using custom selector values (e.g. `scope: ".result-row";`) is not documented. [veneer-reference.md](file:///home/watashi/Projects/spm-qa-test-suite/docs/veneer-reference.md) only documents literal values `"container"` and `"document"`.
  - Undocumented `preserve` target fallback behavior: does missing target selectors default to `null` silently, or does it throw errors?
- **Syntax / Type Friction:**
  - Currency extractor `bind price: "span.result-price | text"` parses currency formatting (e.g., `"$150"`) as a raw string. If sorting is performed, it sorts alphabetically rather than numerically since a numeric converter pipe is missing.
  - Dates extracted as `attr:datetime` return raw ISO strings with no formatting options for column rendering.
- **Cross-Reference Gaps:**
  - The `scope` directive is completely missing from [component-specs.md](file:///home/watashi/Projects/spm-qa-test-suite/docs/component-specs.md) despite being heavily used in component definitions.
  - The `components[].action` enum lacks a formal constraints schema description in [manifest-schema.md](file:///home/watashi/Projects/spm-qa-test-suite/docs/manifest-schema.md).
  - The extension content script runtime (`modernizer.tsx`) only checks for `scope === 'document'` and otherwise defaults scoping to the parent container element (`originalEl`), meaning custom scope selector values (like `".result-row"`) are ignored at runtime.

---

## 5. Defect & Gap Findings
| Defect ID | Location | Classification | Finding | Proposed Remediation |
| :--- | :--- | :--- | :--- | :--- |
| `DEFECT-SHC-01` | [veneer-reference.md](file:///home/watashi/Projects/spm-qa-test-suite/docs/veneer-reference.md#L105-L144) | Documentation / Critical Gap | `selector` action `wrap` is expected but completely undocumented in the reference files. | Document the `wrap` action with usage examples or explicitly mark it as unsupported. |
| `DEFECT-SHC-02` | [veneer-reference.md](file:///home/watashi/Projects/spm-qa-test-suite/docs/veneer-reference.md#L105-L144) | Documentation / Missing Example | The `replace` action has a basic syntax snippet but lacks a detailed walkthrough showing how props are mapped and component mounting behavior is resolved. | Add a detailed component replacement walkthrough demonstrating data propagation. |
| `DEFECT-SHC-03` | [manifest-schema.md](file:///home/watashi/Projects/spm-qa-test-suite/docs/manifest-schema.md#L83-L91) | Schema / Incomplete Enum | `components[].action` valid values are not formally constrained or validated in the manifest schema instructions. | Add a formal schema definition and description for valid `action` enum options. |
| `DEFECT-SHC-04` | [component-specs.md](file:///home/watashi/Projects/spm-qa-test-suite/docs/component-specs.md#L830-L832) | Feature / Missing Column Types | Column `type` enum previously lacked `"date"` and `"currency"` formats in `UiTableListPage`. | **Resolved** (formatting types added and documented). |
| `DEFECT-SHC-05` | `preserve` runtime | Robustness / Missing Fallback | Undocumented behavior when a `preserve` slot matches no legacy elements (potential runtime crash vs silent null fallback). | Update runtime and documentation to guarantee a graceful fallback to `null` for missing targets. |
| `DEFECT-SHC-06` | `selector` runtime | Robustness / Edge Case | Overlapping `selector` blocks targeting the same element have undefined conflict resolution precedence. | Define and document resolution precedence rules (e.g., `replace` overrides `hide`). |
| `DEFECT-SHC-07` | [veneer-reference.md](file:///home/watashi/Projects/spm-qa-test-suite/docs/veneer-reference.md#L271-L294) | Documentation / Gap | Scoped binding syntax using custom selector values (e.g. `scope: ".result-row";`) is not documented, and is ignored by the runtime which only checks for `"document"`. | Document custom scope selectors and update extension runtime (`modernizer.tsx`) to resolve queries within custom boundary elements if `scope` is a selector. |

---

## 6. Recommended Actions for Ecosystem Improvement
1. **Document `wrap` Action** or remove it from task requirements if currently unsupported by the compiler/runtime.
2. **Align custom `scope` selectors**: Update the runtime engine (`modernizer.tsx`) to query descendants relative to the specified custom selector (rather than checking strictly for `"document"` and defaulting everything else to the reconstruct root).
3. **Add Custom Selector Scoping Example** to the `scope` directive documentation.
4. **Cross-reference `scope` in component-specs.md** to make sure component developers find it.
5. **Enforce `components[].action` enum** in `manifest-schema.md`.
