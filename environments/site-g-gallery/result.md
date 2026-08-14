# Environment QA Evaluation Report: site-g-gallery (Retro Anime Image Board Gallery)

## 1. Executive Summary
- **Overall Modernization Experience:** High Friction
- **Documentation Sufficiency Score:** 3/10

---

## 2. What Worked Well (Positive Highlights)
- `class ... extends ...` inheritance syntax is intuitive — `DetailedGalleryItem extends GalleryItem` reads naturally and the bind inheritance concept is clear from `veneer-reference.md`.
- `scope` directive on the base class (`scope: ".post-preview"`) cleanly isolates all child `bind` selectors to the scoped container without needing to repeat the parent selector.
- `UiSplitLayout` prop contract for `imageSlot`, `tags`, and `showSearch` maps well to an image board gallery layout with a tag sidebar.
- The `selector` hide directive for ads, legacy sidebar, and news ticker uses clean comma-separated multi-targeting.

---

## 3. Friction Points & Difficulties Encountered

### Documentation Gaps
- **`UiImageCard` is critically underdocumented**: `docs/component-specs.md` lists 5 props (`imageUrl`, `linkUrl`, `title`, `aspectRatio`, `showTitle`) but provides zero Veneer Spec examples. No `.vnr` code snippet shows how to reconstruct a gallery detail view using `UiImageCard`. A developer must guess the reconstruct binding pattern.
- **`UiImageCard` valid `aspectRatio` values not enumerated**: The prop table says `string` with default `"1:1"` but doesn't list valid values. Is `"16:9"` valid? `"3:2"`? `"banana"`? No validation or fallback behavior is documented.
- **`UiImageCard` broken image fallback undocumented**: No mention of what happens when `imageUrl` is 404. Does it show a broken image icon, a placeholder, or nothing?
- **`LayoutPrimitives` have zero prop documentation**: Section 11 of `component-specs.md` lists 7 primitives (`UiBox`, `UiFlexRow`, `UiFlexColumn`, `UiGrid`, `UiText`, `UiImage`, `UiLink`) but provides NO prop tables whatsoever. A developer cannot use these without reading TypeScript source code.
- **`class extends` resolution order undocumented**: `veneer-reference.md` shows the syntax but doesn't explain: does the child class override parent binds of the same name? Or merge them? What happens with `scope` inheritance — does the child inherit the parent's scope?
- **No documentation on `child ... extends ClassName` syntax**: The `child imageSlot extends DetailedGalleryItem` syntax used in `gallery.vnr` is not shown anywhere in `veneer-reference.md`. The docs show `child results extends DetailedSearchResultItem` once (line 111) but never explain the semantics — does the child block inherit the class scope? Can it add extra binds?

### Syntax / Type Friction
- **`bind tags: "self | attr:data-tags"` returns a raw space-separated string**: Tags extracted via `attr:data-tags` from booru-style sites return strings like `"1girl blue_hair school_uniform"`. There's no documented extractor pipe to split strings into arrays. A developer would need a `| split:" "` pipe that doesn't exist.
- **`bind rating: "self | attr:data-rating"` returns raw string**: No `| enum` or `| map` pipe exists to transform raw rating strings (`"s"`, `"q"`, `"e"`) into human-readable labels.
- **`UiImageCard` standalone reconstruct lacks `child` binding**: Using `reconstruct ".post-detail-view" -> UiImageCard` with no explicit prop binds means all props (`imageUrl`, `title`, `linkUrl`) must be statically defined or pre-extracted. The documentation doesn't show how a single-item reconstruct binds dynamic data without `child`.

### Component Limitations
- **`UiImageCard` has no lazy loading prop**: Modern gallery grids with 50+ items need `loading="lazy"` on images. `UiImageCard` exposes no prop for this, and `UiImage` primitive similarly lacks documentation.
- **`UiGrid` responsive columns not configurable via props**: `component-specs.md` lists `UiGrid` as a "grid layout container" but provides no props for `gridTemplateColumns`, `gap`, or responsive breakpoints. All responsive behavior must be manually handled in `content.css`.
- **No `UiImageCard` hover zoom built-in**: The `content.css` manually implements `transform: scale(1.03)` hover effects, but this should be a component-level prop (e.g. `hoverEffect: "zoom" | "shadow" | "none"`).

---

## 4. Defect & Boundary Test Findings

| Defect ID | Location | Classification | Failure Mechanism | Proposed Remediation |
| :--- | :--- | :--- | :--- | :--- |
| `DEFECT-SGG-01` | `docs/component-specs.md` Section 11 | Documentation / Critical Gap | `LayoutPrimitives` (`UiBox`, `UiFlexRow`, `UiFlexColumn`, `UiGrid`, `UiText`, `UiImage`, `UiLink`) have zero prop tables. Developers cannot use them without reading TypeScript source. | Add complete prop tables for all 7 primitives with at least `className`, `style`, `children`, and type-specific props (`columns` for `UiGrid`, `src`/`alt`/`loading` for `UiImage`, `href`/`target` for `UiLink`). |
| `DEFECT-SGG-02` | `docs/component-specs.md` Section 10 | Documentation / Missing | `UiImageCard` `aspectRatio` valid values are not enumerated. Invalid values produce undefined behavior. No Veneer Spec `.vnr` usage example is provided. | Document valid `aspectRatio` values (`"1:1"`, `"4:3"`, `"3:4"`, `"16:9"`, `"9:16"`, `"3:2"`, `"2:3"`), add fallback behavior for invalid values, and provide a `.vnr` example. |
| `DEFECT-SGG-03` | `docs/veneer-reference.md:L111` | Documentation / Ambiguity | `child ... extends ClassName` syntax is used once in an example but never formally defined. Scope inheritance, bind override, and extra bind merging semantics are undocumented. | Add a dedicated "Child Block with Class Inheritance" subsection explaining: scope inheritance rules, bind override precedence, and extra bind declarations in child blocks. |
| `DEFECT-SGG-04` | Veneer Spec Compiler | Feature / Missing Pipe | No `| split` extractor pipe exists to convert space-separated attribute strings (e.g. `data-tags="1girl blue_hair"`) into JSON arrays usable by components expecting `Array<string>`. | Implement `| split:"<delimiter>"` extractor pipe in `spm-cli` parser to enable `bind tags: "self | attr:data-tags | split:' '"`. |
| `DEFECT-SGG-05` | `UiImageCard` (runtime) | UI / Performance | `UiImageCard` has no `loading` prop for native lazy loading. Rendering 50+ gallery cards loads all images eagerly, causing significant LCP degradation and bandwidth waste. | Add `loading?: "lazy" | "eager"` prop to `UiImageCard` defaulting to `"lazy"`, passing through to the inner `<img>` element. |
| `DEFECT-SGG-06` | `UiImageCard` (runtime) | UI / Fallback | `UiImageCard` with 404 `imageUrl` renders a browser-native broken image icon. No fallback placeholder or error state is implemented. | Add `onError` handler to inner `<img>` that switches to a neutral placeholder SVG or hides the image container entirely. |

---

## 5. Recommended Actions for Ecosystem Improvement
1. **Document all LayoutPrimitives props** — this is the most critical documentation gap in the entire ecosystem; 7 components with zero documentation.
2. **Add `| split` extractor pipe** — essential for booru/tag-based sites where attributes contain space-delimited lists.
3. **Document `child extends` semantics** — formal specification of scope inheritance and bind override rules.
4. **Add `UiImageCard` lazy loading** — `loading="lazy"` prop with default for gallery performance.
5. **Add `UiImageCard` broken image fallback** — graceful degradation when images 404.
6. **Enumerate `aspectRatio` valid values** — with fallback behavior for invalid strings.
7. **Provide Veneer Spec examples for UiImageCard** — currently the only component in `component-specs.md` without a `.vnr` example.
