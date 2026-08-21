# Documentation Audit Report: site-i-github / GitHub Repository Issues

## 1. Executive Summary
- **Overall Documentation Experience:** Moderate Friction
- **Documentation Sufficiency Score:** 6 / 10
- **Compilation Status:** Pass
- **Confidence Level:** High — compilation verified and component code audited directly.

---

## 2. Compilation Results
- **Command:** `/home/watashi/Projects/spm-cli/spm compile . -o manifest.json`
- **Exit code:** 0
- **manifest.json valid JSON:** Yes
- **Expected fields present:** theme, reconstructs, components (note: `targetUrl` is missing, see findings)
- **Errors/Warnings:** None
- **Cross-check:** Compiled selectors perfectly match `.vnr` source directives:
  - Reconstruct selector `#issues-container` matches `"containerSelector": "#issues-container"`
  - Reconstruct selector `#searchform` matches `"containerSelector": "#searchform"`
  - Selector `.repo-header, footer` matches `"selector": ".repo-header, footer"` with `"action": "hide"`
  - Child class `GithubIssueItem` correctly resolved to class properties and bound under `tableRows` with `selector` and `scope` set to `".js-issue-row"`.

---

## 3. What Worked Well (Positive Highlights)
- **Delimiter splitting pipe (`| split:,`)**: Correctly compiles and generates expected manifest mapping. The pipe split delimiter is parsed and formatted appropriately.
- **Numeric parser pipes (`| number` and `| cleanNumber`)**: Compiles correctly. In the underlying Javascript engine implementation, `cleanNumber` successfully cleans surrounding non-numeric noise (like the `#` in `#101`) to parse correct numeric values, and `number` successfully converts clean numbers (like `4`).
- **Class scope and inheritance**: The `class GithubIssueItem` block resolves fine, propagating the `scope` and `bind` definitions to child `tableRows extends GithubIssueItem` inside the reconstruct block.
- **Compilation Tooling Commands**: Both `spm validate` and `spm apply` executed successfully, showing correct match statistics and generating the expected HTML structure in `result.html` where components are injected into Shadow DOM hosts.

---

## 4. Friction Points & Difficulties Encountered
- **Array Value Rendering (Concat / Join Issues in `UiTableListPage`)**: `UiTableListPage` lacks support for array/list values. When a column is mapped to an array (e.g. `labels` extracted via `split:,`), the table cell renders the array as a single joined label string without spacing (e.g. `bugdocumentation`) instead of iterating and displaying separate badge pills.
- **Unused `badgeStyleKey` Prop**: Declared in the React component's typescript interface `TableColumnConfig` and documented in `component-specs.md`, but completely omitted from the actual implementation of `UiTableListPage.tsx` (it is never passed or referenced).
- **Search Parameter Prop Naming Inconsistency**: `UiSearchBar` uses `queryParamName` while `UiHeroLanding` uses `searchParamName` for the exact same conceptual query string parameter key.
- **Missing `name` Field Schema Mismatch for hide Actions**: `manifest-schema.md` states that `name` is required for all components configuration elements. However, the compiler omits `name` for `"action": "hide"` selectors, causing strict validation warnings/failures.

---

## 5. Defect & Gap Findings

| Defect ID | Location | Classification | Finding | Proposed Remediation |
| :--- | :--- | :--- | :--- | :--- |
| `DEFECT-SIG-01` | `src/components/dedicated/UiTableListPage.tsx` | Component Implementation / Defect | `badgeStyleKey` is declared and documented but completely unused in implementation. | Update `UiTableListPage.tsx` to pass `badgeStyleKey` (or a derived style class) to `UiTagBadge`. |
| `DEFECT-SIG-02` | `src/components/dedicated/UiTableListPage.tsx` | Component Design / Defect | Rendering array/list values (like tags split by comma) in `UiTableListPage` columns results in joined string text without individual badges. | Add support in `UiTableListPage.tsx` to check if column value is an array, and render a collection of separate `<UiTagBadge>` elements in a flex container. |
| `DEFECT-SIG-03` | `docs/manifest-schema.md:L84-88` | Documentation / Schema Inconsistency | `manifest-schema.md` lists `name` as a required field for components configuration, but the compiler omits it for `"action": "hide"`. | Update `manifest-schema.md` to specify that `name` is optional or only required when `"action": "replace"`. |
| `DEFECT-SIG-04` | `/home/watashi/Projects/spm-cli/spm` | Tooling / Validation Gap | Compiler compiles Veneer specs lacking `targetUrl` without warning, despite the schema marking `targetUrl` as a required root field. | Add a compiler warning or validation error if a compiled manifest lacks `targetUrl`. |

---

## 6. Recommended Actions for Ecosystem Improvement
1. **Support Array-based Columns in `UiTableListPage`**: Enable column cells to render arrays of values (such as tag lists) as independent `<UiTagBadge>` components rather than forcing them to render as single joined text nodes.
2. **Wire Up `badgeStyleKey`**: Ensure the unused `badgeStyleKey` property is referenced and integrated with styling classes in the component renderer.
3. **Consolidate Search Query Prop Names**: Standardize on a single property name (either `searchParamName` or `queryParamName`) across all search-based component interfaces.
4. **Align Schema Docs with Compiler Behavior**: Correct `manifest-schema.md` regarding required fields for `hide` actions and enforce `targetUrl` verification in the C++ compiler (`spm-cli`).
