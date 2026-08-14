# Task Brief: site-h-classifieds

## Target Site
**Craigslist-style Classifieds Board** (e.g. `craigslist.org` listing page)

## Target Page Scenario
Classified ad listing page with category navigation, search form with multiple hidden fields, and a results feed requiring `selector` actions (`hide`, `replace`, `wrap`).

## Primary Components Under Test
- **`selector` Actions** — `hide`, `replace`, `wrap` directives applied directly to host DOM elements.
- **`preserve` Dictionary Block** — Multi-slot preservation of legacy DOM nodes (breadcrumbs, legal disclaimers, form tokens).
- **`class` with `scope` Directive** — Scoped bind selectors restricted to specific sub-containers.

## Testing Requirements

### 1. `selector` Action Comprehensive Tests
- **`hide`**: Target 5+ different selectors (ads, banners, deprecated nav, legacy footer, cookie notice) and verify each is `display: none` with no layout reflow artifacts.
- **`replace`**: Replace a legacy `<select>` dropdown with a `UiSearchBar` component — verify the original element is fully replaced in the DOM.
- **`wrap`**: If supported, wrap an existing table in a scrollable `UiBox` container — verify the original content is preserved inside the new wrapper.
- Test `selector` with complex CSS selectors including `[class*=""]`, `:has()`, `:nth-child()`, attribute selectors.

### 2. `preserve` Multi-Slot Dictionary Tests
- Define `preserve { }` block with 4+ named slots:
  - `breadcrumb: ".breadcrumbs"` — verify breadcrumb trail is lifted into the new component.
  - `legalDisclaimer: "#legal-footer"` — verify disclaimer text is preserved verbatim.
  - `csrfToken: "form input[name='csrfmiddlewaretoken']"` — verify hidden input is preserved.
  - `sessionId: "form input[name='session_id']"` — verify session hidden input is preserved.
- Verify all 4 slots are correctly injected into their designated positions in the reconstructed component.

### 3. `class` with `scope` Directive Tests
- Define `class ClassifiedAdItem` with `scope: ".result-row"`.
- Inside, use `bind title`, `bind price`, `bind location`, `bind datePosted`, `bind thumbnailUrl`.
- Verify all `bind` selectors are resolved relative to `.result-row` (not document root).
- Test with a listing that has missing fields (no price, no thumbnail) — verify no crash and empty props are handled.

### 4. Documentation Coverage Audit
- Evaluate whether `docs/veneer-reference.md` documents `selector` action `wrap` (or confirms its absence).
- Evaluate whether `docs/veneer-reference.md` explains `scope` directive clearly.
- Evaluate whether `docs/manifest-schema.md` documents the `components[].action` enum values (`hide`, `replace`, `wrap`).

### 5. Edge Cases
- `selector` targeting an element that does not exist in the DOM — verify no error thrown.
- `preserve` slot targeting an element that does not exist — verify graceful handling.
- `scope` pointing to a non-existent container — verify parser error or runtime fallback.
- Multiple `selector` directives targeting the same element — verify no conflict.

## Files Provided
- `classifieds.vnr` — Veneer source for classifieds page reconstruction.
- `content.css` — Shadow DOM scoped styles.
