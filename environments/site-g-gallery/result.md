# Documentation Audit Report: site-g-gallery - Retro Anime Image Board Gallery

## 1. Executive Summary
- **Overall Documentation Experience:** High Friction
- **Documentation Sufficiency Score:** 3/10
- **Compilation Status:** Pass
- **Confidence Level:** High — doc gaps verified

---

## 2. Compilation Results
- **Command:** `spm compile . -o manifest.json`
- **Exit code:** 0
- **manifest.json valid JSON:** Yes
- **Expected fields present:** theme, reconstructs, components
- **Errors/Warnings:** None
- **Cross-check:**
  - Compiled component selector `#ad-container, .legacy-sidebar, .news-ticker` matches `.vnr` source directive selector.
  - Compiled reconstruct selector `#posts-container` matches `.vnr` source directive.
  - Compiled reconstruct selector `.post-detail-view` matches `.vnr` source directive.
  - All compiled selectors were validated successfully against `fixtures/page-snapshot.html`.

---

## 3. What Worked Well (Positive Highlights)
- **Class Inheritance Syntax:** `class ... extends ...` syntax is highly intuitive. `DetailedGalleryItem extends GalleryItem` reads naturally, and the bind inheritance concept is clear from `docs/veneer-reference.md`.
- **Scope Isolation:** The `scope` directive on the base class (`scope: ".post-preview"`) cleanly isolates all child `bind` selectors to the scoped container without needing to repeat the parent selector in sub-bindings.
- **Multi-Targeting Selection:** The `selector` hide directive for ads, legacy sidebar, and news ticker uses clean comma-separated multi-targeting.
- **Theme Variables Mapping:** The compiled theme CSS variables output (`cssVariables` inside `theme`) maps correctly and matches the Veneer declaration.

---

## 4. Friction Points & Difficulties Encountered
- **Documentation Gaps:**
  - **`UiImageCard` Standalone Bindings:** `docs/component-specs.md` lists `aspectRatio`, `imageFit`, `showTitle`, and standard required properties like `imageUrl` and `linkUrl` for `UiImageCard`. However, it provides no details on how a single-item/standalone reconstruct binds dynamic data without `child` elements (e.g., `reconstruct ".post-detail-view" -> UiImageCard`).
  - **`child extends` & Scope Inheritance Resolution:** `docs/veneer-reference.md` shows the syntax but doesn't explain: does the child class override parent bindings of the same name? Or merge them? What happens with `scope` inheritance when a child class inherits from a parent?
  - **Unformalized `child ... extends ClassName`:** The `child imageSlot extends DetailedGalleryItem` syntax is used in `gallery.vnr` but is not formally defined in the veneer reference guide.
- **Syntax / Type Friction:**
  - **`aspectRatio` Predefined vs Arbitrary Value Conflict:** The compiler allows arbitrary string values like `"4:3"` or `"16:9"` (as specified in `task.md` and used in `gallery.vnr`), but the React component implementation of `UiImageCard` only accepts `'square' | 'video' | 'portrait' | 'auto'` and silently falls back to `'1 / 1'` (square ratio) for numerical ratios like `"4:3"`.
  - **`UiSplitLayout` imageSlot Property Mismatch:** `UiSplitLayout` expects `imageSlot` child element properties to be `{ src, alt }` (since it forwards them to `UiImageViewer` which expects `src` and `alt`). However, `gallery.vnr` defines `child imageSlot extends DetailedGalleryItem`, which maps properties like `imageUrl` and `title` (inherited from `GalleryItem`). This key mismatch results in blank/broken images at runtime.
- **Cross-Reference Gaps:**
  - Features like `media` directive are documented in `docs/veneer-reference.md` but missing from related documentation.

---

## 5. Defect & Gap Findings
| Defect ID | Location | Classification | Finding | Proposed Remediation |
| :--- | :--- | :--- | :--- | :--- |
| `DEFECT-SGG-01` | `docs/component-specs.md` Section 11 | Documentation / Resolved | `LayoutPrimitives` (`UiBox`, `UiFlexRow`, etc.) previously had zero prop tables. **(RESOLVED)** Complete prop tables are now available in the documentation. | None required (issue resolved). |
| `DEFECT-SGG-02` | `docs/component-specs.md` Section 10 & Component Runtime | Component & Doc Bug / Open | Type/value mismatch: component only supports `square`/`video`/`portrait`/`auto` and falls back to `1:1` for `"4:3"` or `"16:9"`. Standalone reconstruct lacks way to bind dynamic required props (`imageUrl`, `linkUrl`). | Update `UiImageCard` to support arbitrary ratio strings (like `"4:3"`, `"16:9"`) at runtime and document standalone dynamic bindings. |
| `DEFECT-SGG-03` | `docs/veneer-reference.md` | Documentation / Open | `child ... extends ClassName` syntax is used but not formally defined. Scope inheritance rules are undocumented. | Add a dedicated "Child Block with Class Inheritance" subsection explaining scope inheritance and override precedence. |
| `DEFECT-SGG-04` | Veneer Spec Compiler | Feature / Resolved | Previously missing `\| split` pipe to convert space-separated strings to JSON arrays. **(RESOLVED)** The pipe is now implemented in `spm-cli`. | None required (issue resolved). |
| `DEFECT-SGG-05` | `UiImageCard` (runtime) | UI / Resolved | Previously lacked a `loading` prop for native lazy loading. **(RESOLVED)** `loading?: "lazy" \| "eager"` prop is now supported and defaults to `"lazy"`. | None required (issue resolved). |
| `DEFECT-SGG-06` | `UiImageCard` (runtime) | UI / Resolved | Previously rendered a broken browser image icon on 404 image URLs. **(RESOLVED)** `onError` fallback SVG is now implemented. | None required (issue resolved). |
| `DEFECT-SGG-07` | `gallery.vnr:L43` / `docs/component-specs.md` | API Contract / Key Mismatch | `UiSplitLayout` expects `imageSlot` child elements to contain `{ src, alt }`, but `gallery.vnr` binds them to `DetailedGalleryItem` which exposes `imageUrl` and `linkUrl` (inherited from `GalleryItem`) plus `title`. This causes the image viewer to receive no `src` or `alt` props, breaking media rendering at runtime. | Standardize property names or add fallback key matching (`imageUrl` -> `src`, `title` -> `alt`) in the `UiSplitLayout`/`UiImageViewer` component. |

---

## 6. Recommended Actions for Ecosystem Improvement
1. **Support arbitrary ratios in `UiImageCard`:** Update the component to dynamically apply arbitrary aspect ratio values (e.g. `'4/3'`, `'16/9'`) passed to the CSS `aspect-ratio` property, instead of defaulting everything unrecognized to `'1 / 1'`.
2. **Standardize or Fallback keys for image viewers:** Update the `UiSplitLayout`/`UiImageViewer` components to accept both `{ src, alt }` and `{ imageUrl, title }` dynamically to prevent silent rendering failures when bindings use common naming conventions.
3. **Clarify standalone component dynamic binding:** Add examples in `docs/component-specs.md` demonstrating how single-item reconstruct blocks bind dynamic data without `child` properties (e.g. binding target elements inside the reconstructed container to required component props).
4. **Formalize class scope and `child extends` inheritance:** Document compile-time scope merging and binding override resolution rules in `docs/veneer-reference.md`.
