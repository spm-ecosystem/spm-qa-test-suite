# Environment QA Evaluation Report: site-f-wiki (ArchWiki-style Documentation Portal)

## 1. Executive Summary
- **Overall Modernization Experience:** Moderate Friction
- **Documentation Sufficiency Score:** 5/10

---

## 2. What Worked Well (Positive Highlights)
- `UiNavHeader` prop contract is well-structured — `primaryLinks`, `secondaryLinks`, `logoUrl`, `siteName` all map cleanly to common wiki navigation patterns.
- The `UiSearchBar` standalone reconstruct with `submitUrl` and `queryParamName` provides a clear, minimal API for replacing legacy search forms.
- `theme` block with CSS variable tokens compiled without issues — `variables {}` and `customStyles {}` blocks are well-documented.
- The `selector` hide directive with comma-separated multi-selector targeting (`#mw-panel, #footer, .mw-indicators`) is concise and follows CSS convention naturally.
- `R"([...])"` raw string literal syntax for JSON arrays worked cleanly for `primaryLinks` with 13 items including unicode characters (`Café & Résumé`, `日本語ページ`).

---

## 3. Friction Points & Difficulties Encountered

### Documentation Gaps
- **`sticky` prop behavior undocumented**: `docs/component-specs.md` lists `sticky: boolean` with default `false` but provides zero guidance on what it does — no mention of `position: sticky`, z-index elevation value, scroll behavior, or whether it uses `IntersectionObserver` for detachment. A developer has no idea what CSS is applied.
- **`items` vs `primaryLinks` overlap**: `UiNavHeader` exposes both `items: Array<{label, href}>` and `primaryLinks: Array<{label, url}>`. The documentation does not explain when to use which, whether they conflict, or if they render in different positions. The prop key difference (`href` vs `url`) adds to the confusion.
- **`preserve: "form | hiddenInputs"` scalar syntax undocumented as valid**: `docs/veneer-reference.md` Section D shows scalar `preserve: "selector"` in the `UiSearchBar` example (line 137-138), but the main `preserve` documentation (lines 116-119) only explains the dictionary block syntax `preserve { slot: "selector"; }`. It's unclear whether both forms are valid, whether they compile to different manifest schemas, or if one is deprecated.
- **`media` query directive undocumented in component-specs.md**: The `media` conditional reconstruct directive is shown only in `veneer-reference.md` (lines 126-129) but `component-specs.md` makes no mention that a reconstruct can be viewport-conditional. A developer reading only component specs would never discover this feature.
- **`secondaryLinks` rendering position unclear**: Documentation says "Secondary right-aligned utility links" but doesn't specify whether these render in the same navigation bar, a dropdown, or a separate row.

### Syntax / Type Friction
- **Key naming inconsistency**: `items` uses `{ label, href }` while `primaryLinks` and `secondaryLinks` use `{ label, url }`. This is a type contract inconsistency that would cause silent prop drops if a developer mixes them up.
- **`logoUrl` 404 fallback behavior unknown**: The prop table says `siteName` is "Fallback site text when no logo image is available" but doesn't specify the rendering mechanism — does `UiNavHeader` use an `onError` handler on `<img>` to switch to text? Or does it always render both? No conditional rendering documentation exists.

### Component Limitations
- **No horizontal overflow strategy for `primaryLinks`**: With 13 navigation items, the component must handle overflow. The documentation specifies no overflow behavior (wrap, scroll, truncate, hamburger menu). The `content.css` in this environment adds `overflow-x: auto` manually, but this should be a built-in component responsibility.
- **`media` directive only gates mount/unmount**: The `media: "(max-width: 768px)"` reconstruct appears to be all-or-nothing — the component either mounts or doesn't. There's no documented way to change props responsively (e.g., collapse links into a hamburger on mobile).

---

## 4. Defect & Boundary Test Findings

| Defect ID | Location | Classification | Failure Mechanism | Proposed Remediation |
| :--- | :--- | :--- | :--- | :--- |
| `DEFECT-SFW-01` | `docs/component-specs.md` (UiNavHeader) | Documentation / Ambiguity | `items` and `primaryLinks` props serve overlapping purposes with incompatible key schemas (`href` vs `url`). Developer cannot determine which to use or if both render simultaneously. | Remove `items` prop or merge it with `primaryLinks` under a unified `{ label, url }` contract. Document explicitly which takes precedence. |
| `DEFECT-SFW-02` | `docs/component-specs.md` (UiNavHeader) | Documentation / Missing | `sticky` prop has no behavioral documentation. Developer cannot predict CSS positioning, z-index value, or scroll interaction without reading source code. | Add behavioral description: "When `true`, renders with `position: sticky; top: 0; z-index: 1000` and adds an elevation shadow on scroll." |
| `DEFECT-SFW-03` | `docs/veneer-reference.md:L132-138` | Documentation / Inconsistency | `preserve` directive has two syntactic forms (scalar string and dictionary block) shown in different examples with no explanation of when each applies or whether both compile to the same manifest output. | Add a dedicated "preserve Syntax Variants" subsection clarifying: scalar form is for single-slot shorthand (`hiddenInputs` extractor), dictionary form is for multi-slot named preservation. |
| `DEFECT-SFW-04` | `UiNavHeader` (runtime) | UI / Overflow | `primaryLinks` with 13+ items has no built-in horizontal overflow handling. On viewports < 1024px, links overflow the container with no scroll, wrap, or truncation strategy. | Implement `overflow-x: auto` with `flex-wrap: nowrap` and `scrollbar-width: thin` as default nav link container behavior, or add a `maxVisibleLinks` prop with "More..." dropdown. |
| `DEFECT-SFW-05` | `wiki.vnr:L36-47` | Syntax / Type Safety | `primaryLinks` and `secondaryLinks` use `{ "label": ..., "url": ... }` but `items` prop in component-specs.md expects `{ "label": ..., "href": ... }`. If a developer passes `items` with `url` keys, props silently drop and render empty links. | Standardize all navigation link arrays to `{ label: string; url: string }` across all UiNavHeader props. |

---

## 5. Recommended Actions for Ecosystem Improvement
1. **Resolve `items` vs `primaryLinks` ambiguity** — deprecate `items` and standardize on `primaryLinks`/`secondaryLinks` with `{ label, url }` contract.
2. **Document `sticky` behavior** — add CSS implementation details and scroll interaction notes to component-specs.md.
3. **Clarify `preserve` syntax variants** — add a dedicated section in veneer-reference.md explaining scalar vs dictionary forms.
4. **Add built-in nav overflow** — implement responsive horizontal scroll or collapsible hamburger menu for `primaryLinks` overflow.
5. **Document `media` directive in component-specs.md** — currently only in veneer-reference.md, developers reading component specs miss this feature entirely.
6. **Test unicode nav labels** — verify `primaryLinks` items with non-ASCII characters (CJK, accented Latin) render correctly in all browsers.
