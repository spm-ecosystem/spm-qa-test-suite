# Documentation Audit Report: site-j-stackoverflow / StackOverflow Questions

## 1. Executive Summary
- **Overall Documentation Experience:** Moderate Friction
- **Documentation Sufficiency Score:** 5 / 10
- **Compilation Status:** Pass
- **Confidence Level:** High — doc gaps verified via compiler and validation test runs.

---

## 2. Compilation Results
- **Command:** `spm compile . -o manifest.json`
- **Exit code:** 0
- **manifest.json valid JSON:** Yes
- **Expected fields present:** theme, reconstructs, components
- **Errors/Warnings:** None
- **Cross-check:**
  - Reconstruct `#questions-container` matches container selector in `.vnr` source.
  - Reconstruct `#searchform` matches container selector in `.vnr` source.
  - Component selector `#sidebar, #community-bulletins` matches `.vnr` selector.

---

## 3. What Worked Well (Positive Highlights)
- **Fluid Project Compilation:** The compilation via `/home/watashi/Projects/spm-cli/spm compile .` was extremely fast and yielded a valid JSON layout manifest without any formatting issues.
- **Robust Selector Validation Command:** The command `spm validate` makes testing selectors against offline page snapshots incredibly easy.
- **Support for Multi-Selector Elements:** Combining selectors like `#sidebar, #community-bulletins` into a single block worked seamlessly and generated a clean hide action.

---

## 4. Friction Points & Difficulties Encountered
- **Pipe Sequence Ambiguity:** Syntactically, it is not obvious that pipes like `cleanNumber` or `split` must be prefixed by a base extractor (like `text` or `attr:x`). Writing `div.views | cleanNumber` compiles without warning, but fails silently at runtime/validation because `cleanNumber` is evaluated as a base extractor rather than a pipe.
- **Silent Validation Results in Human Mode:** The `spm validate` command completely ignores data-binding failures on nested `child` items in its human-readable output (always reporting 0 failures if selectors matched), making debugging extremely difficult without checking the `--json` payload.
- **Loss of Data in Number Normalization:** The `cleanNumber` pipe strips trailing text letters indiscriminately, converting metric designations like `"2.4k"` views to a literal `"2.4"`.
- **String ID Hyphen Parsing:** Alphanumeric IDs like `"q-12345"` are parsed as negative numbers (`-12345`) due to the hyphen character being treated as a negative sign.

---

## 5. Defect & Gap Findings

| Defect ID | Location | Classification | Finding | Proposed Remediation |
| :--- | :--- | :--- | :--- | :--- |
| `DEFECT-SJS-01` | `stackoverflow.vnr:L24,26` | Spec / Binding Bug | `votes` and `views` binds lack base extractors (`text` or `attr:`). They map `cleanNumber` directly as a base extractor, resulting in silent extraction failure (`null`). | Correct binds to `span.vote-count-post \| text \| cleanNumber` and `div.views \| text \| cleanNumber`. |
| `DEFECT-SJS-02` | `spm-cli/src/scripts/validate.js` | Tooling / Validator Bug | `spm validate` does not check child-level item bindings (`child.itemsBinds`) for failure in its human-readable output and overall exit status, masking bugs. | Update `validate.js` to iterate over nested child bind statuses and trigger validation failure if any bind status is `"FAIL"`. |
| `DEFECT-SJS-03` | `spm-cli/src/scripts/validate.js` | Tooling / Parser Bug | `cleanNumber` strips alphabetical suffix multipliers like `"k"` (thousands) and `"m"` (millions), returning incorrect values (e.g. `"2.4k"` becomes `"2.4"` instead of `2400`). | Add suffix multipliers support to the `cleanNumber` parser logic. |
| `DEFECT-SJS-04` | `spm-cli/src/scripts/validate.js` | Tooling / Parser Bug | `cleanNumber` treats the hyphen character in ID strings like `"q-12345"` as a minus sign, parsing it as a negative number (`-12345`). | Prevent `cleanNumber` from interpreting non-leading hyphens or hyphens inside alphanumeric text prefixes as negative signs. |
| `DEFECT-SJS-05` | `stackoverflow.vnr:L25` | Spec / Syntax Bug | Using backticks inside double quotes for split delimiters (`split:\` \``) compiles to a literal `\` \`` delimiter, failing to split `"javascript react"` properly. | Use the parameterless `split` pipe, which natively splits on spaces. |
| `DEFECT-SJS-06` | `stackoverflow.vnr:L40` | Spec / Usability Gap | `UiSearchBar` reconstruct block lacks `defaultValue` binding. The user's query will be cleared upon loading a search results page. | Bind `defaultValue` via `bind defaultValue: "input[name='q'] \| attr:value";`. |
| `DEFECT-SJS-07` | `docs/component-specs.md` (UiTableListPage) | Docs / Component API Gap | `UiTableListPage` column config lacks an array/list type (e.g. `array` or `badge-list`) to nicely style tag lists in table cells. | Introduce an `array` or `badge-list` cell type formatting option. |
| `DEFECT-SJS-08` | `docs/manifest-schema.md` (Section 2) | Docs / Schema Inconsistency | The schema states `name` is a required field on components, but it is omitted when compiling `selector` actions of type `"hide"`. | Clarify that `name` is optional/not applicable when action is `"hide"`. |
| `DEFECT-SJS-09` | `docs/veneer-reference.md:L271-294` | Docs / Gap | Custom CSS selectors used in the `scope` directive (e.g. `scope: ".question-summary";`) are undocumented. | Formally document custom selector scopes in the reference manual. |

---

## 6. Recommended Actions for Ecosystem Improvement
1. **Require Base Extractor Validation:** Add compile-time check in `spm compile` to warn or fail if a selector binding doesn't have a valid base extractor (such as `text`, `html`, `attr:`, etc.) as its first operation.
2. **Correct validator child item bindings:** Fix `spm validate` to include and check child items' bindings in human-readable and status check outputs.
3. **Upgrade parser's number processing:** Implement metric multiplier support (`k`/`m`) in `cleanNumber` to prevent data loss.
4. **Standardize tag list rendering:** Implement native support for rendering array properties in `UiTableListPage` as a list of `UiTagBadge` elements.
5. **Improve delimiter splitting guidelines:** Clarify delimiter arguments in documentation, emphasizing that space-delimited lists should use `split` without arguments.
