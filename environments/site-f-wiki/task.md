# Task Brief: site-f-wiki

## Target Site
**MediaWiki-based Documentation Wiki** (e.g. `wiki.archlinux.org`)

## Target Page Scenario
Category listing page with sidebar navigation, article table of contents, and breadcrumb trail.

## Primary Components Under Test
- **`UiNavHeader`** — Sticky top navigation with `primaryLinks`, `secondaryLinks`, logo, and search integration.
- **`UiSearchBar`** — Standalone form with `hiddenInputs` preservation for CSRF tokens and session parameters.

## Testing Requirements

### 1. `UiNavHeader` Stress Tests
- Test `sticky: true` behavior — verify z-index elevation and scroll detachment.
- Populate `primaryLinks` with 12+ items and verify horizontal overflow handling (wrap vs scroll vs truncate).
- Populate `secondaryLinks` with 5+ utility links (login, preferences, contributions) and verify right-aligned layout.
- Test `logoUrl` with a broken/404 URL and verify graceful `siteName` text fallback.
- Test `media: "(max-width: 768px)"` reconstruct conditional — verify the component does NOT mount on desktop viewports.

### 2. `UiSearchBar` + `hiddenInputs` Preservation
- Create a `reconstruct` targeting a wiki search form that contains hidden CSRF tokens (`<input type="hidden" name="csrftoken" value="abc123">`).
- Verify `preserve: "form | hiddenInputs"` correctly extracts and forwards hidden inputs to the reconstructed `UiSearchBar`.
- Test form submission with `submitUrl` specified and verify query params include both `queryParamName` and preserved hidden fields.
- Test submission WITHOUT `submitUrl` and verify fallback to current page form action.

### 3. Documentation Coverage Audit
- Evaluate whether `docs/component-specs.md` adequately documents `UiNavHeader` props `sticky`, `items` vs `primaryLinks` overlap.
- Evaluate whether `docs/veneer-reference.md` explains `preserve: "form | hiddenInputs"` scalar syntax vs dictionary `preserve { }` block syntax.

### 4. Edge Cases
- `primaryLinks` with special characters in labels (e.g. `"Café & Résumé"`, `"日本語ページ"`).
- `logoHref` pointing to an external domain — verify no security policy violations.
- Empty `secondaryLinks: []` — verify no orphan empty container.

## Files Provided
- `wiki.vnr` — Veneer source for the wiki navigation and search reconstruction.
- `content.css` — Shadow DOM scoped styles.
