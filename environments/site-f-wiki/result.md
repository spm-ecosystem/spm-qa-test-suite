# Documentation Audit Report: site-f-wiki / MediaWiki Documentation Portal

## 1. Executive Summary
- **Overall Documentation Experience:** Moderate Friction
- **Documentation Sufficiency Score:** 5/10
- **Compilation Status:** Pass
- **Confidence Level:** High — doc gaps verified

---

## 2. Compilation Results
- **Command:** `/home/watashi/Projects/spm-cli/spm compile . -o manifest.json`
- **Exit code:** 0
- **manifest.json valid JSON:** Yes
- **Expected fields present:** `theme`, `components`, `reconstructs` (Missing: `targetUrl` at root level, though compiled successfully)
- **Errors/Warnings:** None
- **Cross-check:**
  - Compiled container selectors (`#mw-navigation`, `#mw-mf-navigation`, `#searchform`) exactly match the `.vnr` source directives.
  - Component selector (`#mw-panel, #footer, .mw-indicators`) with multiple comma-separated rules matches the `.vnr` selector block.

---

## 3. What Worked Well (Positive Highlights)
- **Unicode & Special Characters:** Unicode labels (`"日本語ページ"`) and HTML character references (`"Café & Résumé"`) inside JSON array values parse and compile correctly into standard JSON string values in the manifest output.
- **Viewport-Specific Mounting:** The `media` parameter in `reconstruct` compiles cleanly to `mediaQuery` in the manifest block, allowing viewport-gated rendering.
- **Multiple Selectors in hide Action:** The C++ compiler correctly parses and handles grouped CSS selectors (e.g. `#mw-panel, #footer, .mw-indicators`) under a single `selector` block.

---

## 4. Friction Points & Difficulties Encountered
- **Documentation Gaps:**
  - **Undocumented `sticky` Prop:** [component-specs.md](file:///home/watashi/Projects/spm-qa-test-suite/docs/component-specs.md#L409) does not document the `sticky` prop in `UiNavHeader`'s API table. However, it is widely used in theme specs and relies on shadow-scoped styles to function.
  - **Undocumented `preserve` Syntax & Parser Failure:** The task brief implies that the scalar syntax `preserve: "form | hiddenInputs"` is valid. However, trying to compile this yields a syntax error (`Expected '{' after preserve`). Only the dictionary block syntax (`preserve { hiddenInputs: "..." }`) is supported by the parser, but this distinction is not explained in [veneer-reference.md](file:///home/watashi/Projects/spm-qa-test-suite/docs/veneer-reference.md#L241).
  - **No `logoUrl` / `logoHref` Security or Fallback Docs:** The fallback behavior when `logoUrl` fails (e.g. 404) or details on external domain security policies for `logoHref` are not documented.
- **Cross-Reference Gaps:**
  - **Required `targetUrl` Omission:** [manifest-schema.md](file:///home/watashi/Projects/spm-qa-test-suite/docs/manifest-schema.md#L11) states that `targetUrl` is a required root field. The C++ compiler does not auto-generate this when compiling `.vnr` files alone unless it is merged from an existing manifest, resulting in a schema-invalid JSON output by default.

---

## 5. Defect & Gap Findings
| Defect ID | Location | Classification | Finding | Proposed Remediation |
| :--- | :--- | :--- | :--- | :--- |
| `DEFECT-SFW-01` | [component-specs.md](file:///home/watashi/Projects/spm-qa-test-suite/docs/component-specs.md#L409) | Documentation / Gap | **Resolved**: Overlap between `items` and `primaryLinks` has been resolved by removing `items` and standardizing on `primaryLinks`. | None (Confirmed resolved). |
| `DEFECT-SFW-02` | [component-specs.md](file:///home/watashi/Projects/spm-qa-test-suite/docs/component-specs.md#L409) | Documentation / Gap | **Open**: `UiNavHeader` `sticky` prop is completely missing from the properties reference table. | Add `sticky` (`boolean`) to the `UiNavHeader` props list, detailing its CSS expectations. |
| `DEFECT-SFW-03` | [veneer-reference.md](file:///home/watashi/Projects/spm-qa-test-suite/docs/veneer-reference.md#L241) | Documentation / Inconsistency | **Open**: Task briefs refer to `preserve: "form \| hiddenInputs"` scalar syntax, but compilation fails. The docs only define block syntax. | Explicitly document the deprecation/lack of support for scalar `preserve` syntax, and clarify that the block form (`preserve { }`) is required. |
| `DEFECT-SFW-04` | `UiNavHeader` | UI / Overflow | **Resolved**: Large lists of `primaryLinks` (12+ items) wrap/truncate awkwardly without overflow handling. | Resolved/mitigated by declaring horizontal scroll styling in local `content.css` via `.nav-links-container { overflow-x: auto; }`. |
| `DEFECT-SFW-05` | [wiki.vnr](file:///home/watashi/Projects/spm-qa-test-suite/environments/site-f-wiki/wiki.vnr) | Syntax / Type Safety | **Resolved**: Discrepancies in sub-item key contracts (some expecting `url` and others `href`) resolved by standardizing on `{ label, url }`. | None (Confirmed resolved). |

---

## 6. Recommended Actions for Ecosystem Improvement
1. **Standardize the `preserve` Directive Syntax:** Either officially add parser support for the scalar string syntax `preserve: "..."` in the C++ compiler or scrub all references to it from task specifications and document that the block syntax is mandatory.
2. **Add `targetUrl` Config to Veneer Spec:** Allow defining target URL globs in `.vnr` headers or theme configuration blocks (e.g. `theme "Wiki Dark" { targetUrl: "*://wiki.archlinux.org/*" }`) to produce a schema-valid manifest out-of-the-box.
3. **Document Component Fallback Contracts:** Explicitly document the expected behavior of components when non-required properties are omitted (e.g., confirming `secondaryLinks: []` does not render an empty container).
