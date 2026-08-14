# Task Brief: site-g-gallery

## Target Site
**Retro Anime Gallery** (e.g. `danbooru.donmai.us` or similar image board gallery view)

## Target Page Scenario
Grid gallery page displaying thumbnail image cards with pagination, tag filtering sidebar, and detail view modal.

## Primary Components Under Test
- **`UiImageCard`** — Gallery thumbnail cards with hover effects, aspect ratio control, and caption rendering.
- **`LayoutPrimitives`** — `UiGrid`, `UiFlexRow`, `UiBox`, `UiText`, `UiImage`, `UiLink` for custom composite layouts.

## Testing Requirements

### 1. `UiImageCard` Comprehensive Tests
- Test all `aspectRatio` values: `"1:1"`, `"4:3"`, `"16:9"`, `"3:4"`, `"9:16"`.
- Test `showTitle: false` — verify caption bar is hidden and no orphan empty container remains.
- Test `showTitle: true` with a very long title string (200+ characters) — verify text truncation with ellipsis.
- Test `imageUrl` with a broken/404 URL — verify graceful fallback (no broken image icon, ideally a placeholder).
- Test `linkUrl` with `javascript:void(0)` — verify no navigation error or security warning.
- Test rendering 50+ `UiImageCard` items in a grid to assess rendering performance.

### 2. `LayoutPrimitives` Composition Tests
- Build a custom gallery header using only `UiFlexRow`, `UiText`, and `UiLink` primitives — verify they compose correctly inside a `reconstruct` block.
- Test `UiGrid` with responsive `gridTemplateColumns` spanning 2, 3, 4, and 6 columns at different viewport widths.
- Test `UiBox` with nested `UiFlexColumn` — verify padding, border, and margin token inheritance.
- Test `UiImage` with `loading="lazy"` attribute simulation and verify no layout shift (CLS).

### 3. `child` Scraping with Class Inheritance (`extends`)
- Define a `class GalleryItem` base class with `bind imageUrl`, `bind linkUrl`.
- Define `class DetailedGalleryItem extends GalleryItem` adding `bind title`, `bind tags`, `bind rating`.
- Use `child items extends DetailedGalleryItem` in the reconstruct block.
- Verify inheritance chain resolves correctly — all parent bindings are inherited.

### 4. Documentation Coverage Audit
- Evaluate whether `docs/component-specs.md` documents `UiImageCard` `aspectRatio` valid values.
- Evaluate whether `docs/component-specs.md` documents `LayoutPrimitives` prop interfaces.
- Evaluate whether `docs/veneer-reference.md` explains `class ... extends ...` inheritance resolution order.

### 5. Edge Cases
- Image URLs with query strings and fragment identifiers (e.g. `image.jpg?width=400#section`).
- Gallery items with no `title` and no `imageUrl` — both missing simultaneously.
- `aspectRatio` with invalid value (e.g. `"banana"`) — verify no crash, graceful fallback.
- Viewport at exactly 320px (smallest common mobile) with 4-column grid.

## Files Provided
- `gallery.vnr` — Veneer source for gallery grid reconstruction.
- `content.css` — Shadow DOM scoped styles.
