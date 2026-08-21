# Documentation Audit Report: site-g-gallery - Retro Anime Image Board Gallery

## 1. Executive Summary
- **Overall Documentation Experience:** High Friction
- **Documentation Sufficiency Score:** 3/10
- **Compilation Status:** Pass
- **Confidence Level:** High — doc gaps verified

---

## 2. Compilation Results
- **Command:** `spm compile gallery.vnr -o manifest.json`
- **Exit code:** 0
- **manifest.json valid JSON:** Yes
- **Expected fields present:** theme, reconstructs, components
- **Errors/Warnings:** None
- **Cross-check:**
  - Compiled component selector `#ad-container, .legacy-sidebar, .news-ticker` matches `.vnr` source directive.
  - Compiled reconstruct selector `#posts-container` matches `.vnr` source directive.
  - Compiled reconstruct selector `.post-detail-view` matches `.vnr` source directive.
  - All targets were validated successfully against `fixtures/page-snapshot.html`.

---

## 3. What Worked Well (Positive Highlights)
- `class ... extends ...` inheritance syntax is intuitive — `DetailedGalleryItem extends GalleryItem` reads naturally and the bind inheritance concept is clear from `veneer-reference.md`.
- `scope` directive on the base class (`scope: ".post-preview"`) cleanly isolates all child `bind` selectors to the scoped container without needing to repeat the parent selector.
- `UiSplitLayout` prop contract for `imageSlot`, `tags`, and `showSearch` maps well to an image board gallery layout with a tag sidebar.
- The `selector` hide directive for ads, legacy sidebar, and news ticker uses clean comma-separated multi-targeting.

---

## 4. Friction Points & Difficulties Encountered
- **Documentation Gaps:**
  - **`UiImageCard` is underdocumented**: `docs/component-specs.md` lists 5 props but provides no details on how a single-item/standalone reconstruct binds dynamic data without `child` elements (e.g. `reconstruct ".post-detail-view" -> UiImageCard`).
  - **`child extends` resolution order undocumented**: `veneer-reference.md` shows the syntax but doesn't explain: does the child class override parent binds of the same name? Or merge them? What happens with `scope` inheritance?
  - **No documentation on `child ... extends ClassName` syntax**: The `child imageSlot extends DetailedGalleryItem` syntax is used in `gallery.vnr` but never formally defined in the veneer reference guide.
- **Syntax / Type Friction:**
  - **`aspectRatio` Type/Value Mismatch**: The compiler allows arbitrary string values like `"4:3"` or `"16:9"` (as specified in `task.md` and used in `gallery.vnr`), but the React component implementation of `UiImageCard` only accepts `'square' | 'video' | 'portrait' | 'auto'` and silently falls back to `'1 / 1'` (square ratio) for numerical ratios like `"4:3"`.
  - **`bind tags: "self | attr:data-tags"` returns space-separated string**: Tags extracted via `attr:data-tags` from booru-style sites return strings like `"1girl blue_hair school_uniform"`. Extractor pipes like `| split` are needed to format these into arrays.
- **Cross-Reference Gaps:**
  - Features like `media` are documented in `veneer-reference.md` but missing from related documentation.

---

## 5. Defect & Gap Findings
| Defect ID | Location | Classification | Finding | Proposed Remediation |
| :--- | :--- | :--- | :--- | :--- |
| `DEFECT-SGG-01` | `docs/component-specs.md` Section 11 | Documentation / Resolved | `LayoutPrimitives` (`UiBox`, `UiFlexRow`, etc.) previously had zero prop tables. **(RESOLVED)** Complete prop tables are now available in the documentation. | None required (issue resolved). |
| `DEFECT-SGG-02` | `docs/component-specs.md` Section 10 & Component Runtime | Component & Doc Bug / Open | Type/value mismatch: component only supports `square`/`video`/`portrait`/`auto` and falls back to `1:1` for `"4:3"` or `"16:9"`. Standalone reconstruct lacks way to bind dynamic required props (`imageUrl`, `linkUrl`). | Update `UiImageCard` to support arbitrary ratio strings (like `"4:3"`, `"16:9"`) at runtime and document standalone dynamic binds. |
| `DEFECT-SGG-03` | `docs/veneer-reference.md` | Documentation / Open | `child ... extends ClassName` syntax is used but not formally defined. Scope inheritance rules are undocumented. | Add a dedicated "Child Block with Class Inheritance" subsection explaining scope inheritance and override precedence. |
| `DEFECT-SGG-04` | Veneer Spec Compiler | Feature / Resolved | Previously missing `\| split` pipe to convert space-separated strings to JSON arrays. **(RESOLVED)** The pipe is now implemented in `spm-cli`. | None required (issue resolved). |
| `DEFECT-SGG-05` | `UiImageCard` (runtime) | UI / Resolved | Previously lacked a `loading` prop for native lazy loading. **(RESOLVED)** `loading?: "lazy" \| "eager"` prop is now supported and defaults to `"lazy"`. | None required (issue resolved). |
| `DEFECT-SGG-06` | `UiImageCard` (runtime) | UI / Resolved | Previously rendered a broken browser image icon on 404 image URLs. **(RESOLVED)** `onError` fallback SVG is now implemented. | None required (issue resolved). |

---

## 6. Recommended Actions for Ecosystem Improvement
1. **Support numerical ratios in `UiImageCard`:** Update the component to dynamically apply arbitrary aspect ratio values (e.g. `'4/3'`, `'16/9'`) passed to the CSS `aspect-ratio` property, instead of defaulting everything unrecognized to `'1 / 1'`.
2. **Clarify standalone component dynamic binding:** Add examples in `docs/component-specs.md` demonstrating how single-item reconstruct blocks bind dynamic data without `child` properties (e.g. binding target elements inside the reconstructed container to required component props).
3. **Formalize class scope and `child extends` inheritance:** Document the compile-time scope merging and binding override resolution rules in `docs/veneer-reference.md`.
