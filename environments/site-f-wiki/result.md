# Documentation Audit Report: site-f-wiki

## 1. Executive Summary
- **Overall Documentation Experience:** Moderate Friction
- **Documentation Sufficiency Score:** 5/10
- **Compilation Status:** Pass
- **Confidence Level:** High — doc gaps verified

---

## 2. Compilation Results
- **Command:** `spm compile wiki.vnr -o manifest.json`
- **Exit code:** 0
- **manifest.json valid JSON:** Yes
- **Expected fields present:** `theme`, `components`, `reconstructs` (Missing: `targetUrl` at root level, though compiled successfully)
- **Errors/Warnings:** None
- **Cross-check:** All compiled container selectors (`#mw-navigation`, `#mw-mf-navigation`, `#searchform`) and component selectors (`#mw-panel, #footer, .mw-indicators`) exactly match the `.vnr` source directives.

---

## 3. What Worked Well (Positive Highlights)
- `UiNavHeader` prop contract mapping for `primaryLinks` and `secondaryLinks` is well-structured and aligns nicely with MediaWiki's header structures.
- Standalone `UiSearchBar` reconstruct compiles cleanly, enabling easy replacement of legacy form search inputs.
- Commas in CSS multi-selectors (e.g., `#mw-panel, #footer, .mw-indicators`) are correctly handled by the parser.
- Unicode and special character labels (e.g., `"Café & Résumé"`, `"日本語ページ"`) inside JSON arrays parsed correctly.
- Viewport-specific conditional reconstructions using `media` queries compile cleanly to `mediaQuery` in the manifest output.

---

## 4. Friction Points & Difficulties Encountered
- **Documentation Gaps:**
  - **Undocumented `sticky` prop:** [component-specs.md](file:///home/watashi/Projects/spm-qa-test-suite/docs/component-specs.md) completely omits the `sticky` prop in the `UiNavHeader` prop table, despite it being used in [wiki.vnr](file:///home/watashi/Projects/spm-qa-test-suite/environments/site-f-wiki/wiki.vnr) (and styled via [content.css](file:///home/watashi/Projects/spm-qa-test-suite/environments/site-f-wiki/content.css)).
  - **Syntax Error with Scalar `preserve` Syntax:** [task.md](file:///home/watashi/Projects/spm-qa-test-suite/environments/site-f-wiki/task.md) implies that `preserve: "form | hiddenInputs"` is a valid scalar syntax. However, testing shows that the compiler does not support this and throws a parser error (`Expected '{' after preserve`). The compiler only supports the dictionary block syntax (`preserve { hiddenInputs: "..." }`).
  - **Missing `media` Query Documentation in Component Specs:** The conditional `media` reconstruct directive is shown only in [veneer-reference.md](file:///home/watashi/Projects/spm-qa-test-suite/docs/veneer-reference.md) but is entirely missing from [component-specs.md](file:///home/watashi/Projects/spm-qa-test-suite/docs/component-specs.md), making it hard for developers reading only component specs to discover it.
- **Syntax / Type Friction:**
  - **No Fallback Behavior Documentation for `logoUrl`:** No clarity in component documentation on how a 404 for `logoUrl` is handled or how `siteName` functions as a visual fallback.
- **Cross-Reference Gaps:**
  - **Missing `targetUrl` in Output:** [manifest-schema.md](file:///home/watashi/Projects/spm-qa-test-suite/docs/manifest-schema.md) states that `targetUrl` is a required root field in `manifest.json`, but compiling a `.vnr` file does not generate a `targetUrl` unless it was pre-existing and merged, leading to schema invalidity out-of-the-box.

---

## 5. Defect & Gap Findings
| Defect ID | Location | Classification | Finding | Proposed Remediation |
| :--- | :--- | :--- | :--- | :--- |
| `DEFECT-SFW-01` | [component-specs.md](file:///home/watashi/Projects/spm-qa-test-suite/docs/component-specs.md) | Documentation / Gap | Resolved: Prop overlap between `items` and `primaryLinks` is resolved by consolidating under `primaryLinks`. | None (Verify resolved status in master catalog). |
| `DEFECT-SFW-02` | [component-specs.md](file:///home/watashi/Projects/spm-qa-test-suite/docs/component-specs.md) | Documentation / Gap | Critical: The `sticky` prop for `UiNavHeader` is completely missing from the props table and has no behavioral documentation. | Add the `sticky` prop to `UiNavHeader` prop table with behavioral details (e.g., standard sticky CSS, z-index elevation, and scroll interaction). |
| `DEFECT-SFW-03` | [veneer-reference.md](file:///home/watashi/Projects/spm-qa-test-suite/docs/veneer-reference.md) | Documentation / Inconsistency | The task brief expects `preserve: "form \| hiddenInputs"` scalar syntax, but compilation fails with a parser error. The documentation only defines the block syntax. | Clarify in the documentation that scalar `preserve` syntax is not supported by the current compiler; update test suite expectations to use dictionary block syntax. |
| `DEFECT-SFW-04` | `UiNavHeader` | UI / Overflow | Resolved: The lack of built-in overflow handling for `primaryLinks` with 12+ items. | Manually patched in [content.css](file:///home/watashi/Projects/spm-qa-test-suite/environments/site-f-wiki/content.css) via `overflow-x: auto`, but should be natively supported in components. |
| `DEFECT-SFW-05` | [wiki.vnr](file:///home/watashi/Projects/spm-qa-test-suite/environments/site-f-wiki/wiki.vnr) | Syntax / Type Safety | Resolved: Standardizing navigation link arrays on `{ label, url }` keys to prevent silent prop drops. | None (Verify resolved status in master catalog). |

---

## 6. Recommended Actions for Ecosystem Improvement
1. **Document the `sticky` prop** in the `UiNavHeader` properties table under [component-specs.md](file:///home/watashi/Projects/spm-qa-test-suite/docs/component-specs.md).
2. **Standardize `preserve` syntax** in the compiler to either officially support the scalar syntax `preserve: "..."` or explicitly update the documentation and test briefs to deprecate any mention of it.
3. **Add `targetUrl` configuration support** inside `.vnr` file headers (or theme blocks) so the compiler can output a fully schema-valid `manifest.json` without relying on merging pre-existing metadata.
4. **Improve component-level responsive documentation** to show how props (such as navigation links) can collapse into hamburger menus or tabs on mobile screens, rather than only gating the entire component's mounting via `media` query.
