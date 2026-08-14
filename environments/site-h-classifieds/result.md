# Environment QA Evaluation Report: site-h-classifieds (Craigslist-style Classifieds Board)

## 1. Executive Summary
- **Overall Modernization Experience:** Moderate Friction
- **Documentation Sufficiency Score:** 5/10

---

## 2. What Worked Well (Positive Highlights)
- `class ClassifiedAdItem` with `scope: ".result-row"` correctly scopes all `bind` selectors to the row container — the syntax is clean and intuitive.
- `child tableRows extends ClassifiedAdItem` inherits all parent binds without repetition — class reuse works as expected for tabular data scraping.
- `selector` `hide` action with multi-selector comma lists is concise and follows CSS convention. Five distinct `selector { action: hide; }` blocks cleanly target independent legacy elements.
- `UiTableListPage` with `columns` R-string array and `child tableRows` binding provides a complete data table pipeline from DOM scraping to structured table rendering.
- `preserve { }` dictionary block with 4 named slots is syntactically clear and the slot naming convention (`breadcrumb`, `legalDisclaimer`, `csrfToken`, `sessionId`) is self-documenting.
- Light theme with `--spm-accent: "#6d28d9"` (violet) on white background works well for a classifieds reading experience — good contrast ratios.

---

## 3. Friction Points & Difficulties Encountered

### Documentation Gaps
- **`selector` action `wrap` undocumented**: `veneer-reference.md` Section E shows `hide` and mentions `replace` and `wrap` in the heading but only provides a `hide` example. No example or schema definition exists for `wrap` — it's unclear whether it's implemented at all or if it's a placeholder for a future feature.
- **`selector` action `replace` lacks example**: The heading says `hide, replace, wrap` but only `hide` has a code example. `replace` semantics (what replaces the element? a component? raw HTML?) are unexplained.
- **`scope` directive not in component-specs.md**: The `scope` directive appears in `veneer-reference.md` (lines 67-76) but `component-specs.md` makes no mention of it. A developer reading only component specs would never learn about scoped selectors.
- **`preserve` multi-slot validation behavior undocumented**: The `preserve { csrfToken: "form input[name='csrfmiddlewaretoken']"; }` syntax is valid, but what happens when the targeted element doesn't exist in the DOM? Does the slot silently resolve to `null`? Does it throw a runtime error? No documentation addresses missing preserve targets.
- **`manifest-schema.md` `components[].action` enum incomplete**: Section 2 shows `action: "replace"` and `action: "hide"` in JSON examples but doesn't formally enumerate all valid action values. The relationship between `.vnr` `selector { action: X; }` and manifest `components[].action` is not explicitly documented.

### Syntax / Type Friction
- **`price` extractor returns raw string**: `bind price: "span.result-price | text"` extracts `"$1,200"` as a raw string. Sorting by price in `UiTableListPage` will be lexicographic, not numeric. The missing `| number` / `| cleanNumber` pipes (already cataloged as `DEFECT-SEC-03`) affect this environment too.
- **`bind datePosted: "time.result-date | attr:datetime"` returns ISO string**: The `UiTableListPage` column type system has no `"type": "date"` — only `"link"`, `"badge"`, and default text. Date columns render as raw ISO strings (`"2026-08-14T10:30:00Z"`) with no formatting.
- **Multiple `selector` blocks targeting potentially overlapping elements**: If `.legacyFooter` and `#old-footer` refer to the same DOM node, two `hide` actions fire on it. Behavior is undefined — does the second silently no-op? Does it throw?

### Component Limitations
- **`UiTableListPage` column `type` enum is too limited**: Current supported types appear to be `"link"`, `"badge"`, and default text. Missing: `"date"`, `"currency"`, `"image"`, `"boolean"`. A classifieds table needs at minimum `"currency"` for price columns and `"date"` for posted dates.
- **`preserve` slots have no layout position control**: The 4 named preserve slots (`breadcrumb`, `legalDisclaimer`, `csrfToken`, `sessionId`) are extracted, but there's no documented way to specify WHERE they render in the reconstructed component — top, bottom, inline, hidden? The component must have hardcoded slot positions or ignore unknown slot names.

---

## 4. Defect & Boundary Test Findings

| Defect ID | Location | Classification | Failure Mechanism | Proposed Remediation |
| :--- | :--- | :--- | :--- | :--- |
| `DEFECT-SHC-01` | `docs/veneer-reference.md:L143-151` | Documentation / Critical Gap | `selector` action `wrap` is mentioned in the section heading but has zero documentation, zero examples, and potentially zero implementation. Developers cannot use it and cannot determine if it exists. | Either document `wrap` with a full example and manifest schema mapping, or remove it from the heading if unimplemented. |
| `DEFECT-SHC-02` | `docs/veneer-reference.md:L143-151` | Documentation / Missing Example | `selector` action `replace` is mentioned but only `hide` has a code example. Replace semantics (replacement target, component mounting, prop binding) are completely undocumented. | Add a `replace` example showing how a `selector` block replaces a legacy element with a React component, including prop binding syntax. |
| `DEFECT-SHC-03` | `docs/manifest-schema.md` Section 2 | Schema / Incomplete Enum | `components[].action` valid values are not formally enumerated. The JSON examples show `"replace"` and `"hide"` but no schema constraint or enum definition exists. | Add a formal `action` enum: `"hide" | "replace" | "wrap"` (or whatever is actually supported) with behavioral descriptions for each. |
| `DEFECT-SHC-04` | `UiTableListPage` | Feature / Missing Column Types | Column `type` enum lacks `"date"` and `"currency"` types. Date columns render as raw ISO strings; price columns sort lexicographically. | Add `"date"` type (with configurable format) and `"currency"` type (with locale-aware formatting and numeric sorting) to `UiTableListPage` column config. |
| `DEFECT-SHC-05` | `preserve` runtime | Robustness / Missing Fallback | `preserve` slot targeting a non-existent DOM element has undefined behavior. No documentation specifies whether it resolves to `null`, renders an empty slot, or throws a runtime error. | Document and implement graceful fallback: when a preserve target is not found, the slot should resolve to `null` and not render. Add a console warning in dev mode. |
| `DEFECT-SHC-06` | `selector` runtime | Robustness / Edge Case | Multiple `selector` directives potentially targeting the same DOM element (e.g. `.legacyFooter` and `#old-footer` on the same node) have undefined conflict resolution. | Document idempotent behavior: if two `hide` actions target the same element, the second should no-op silently. If `hide` and `replace` conflict, `replace` should take precedence. |

---

## 5. Recommended Actions for Ecosystem Improvement
1. **Document or remove `selector` action `wrap`** — the most critical documentation gap for structural DOM transformations.
2. **Add `replace` action example** — developers need to see the full syntax for replacing a legacy element with a mounted component.
3. **Add `"date"` and `"currency"` column types** — essential for any data-heavy site (classifieds, e-commerce, admin panels).
4. **Define `preserve` slot fallback behavior** — formally specify what happens when targeted elements don't exist.
5. **Document `scope` in component-specs.md** — currently only in veneer-reference.md; cross-reference needed.
6. **Formalize `components[].action` enum in manifest-schema.md** — add schema-level validation for action values.
7. **Add conflict resolution rules for overlapping selectors** — specify precedence when multiple directives target the same DOM node.
