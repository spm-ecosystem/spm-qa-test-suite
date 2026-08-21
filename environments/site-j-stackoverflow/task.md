# Task Brief: site-j-stackoverflow

## Target Site
**StackOverflow Questions Feed** (e.g. `stackoverflow.com/questions`)

## Target Page Scenario
A question listing feed displaying votes, answers, views, tags, and search query bar.

## Primary Components Under Test
- **`UiTableListPage`** — Replacement for the question container feed.
- **`UiSearchBar`** — Standalone search query bar.

## Testing Requirements

### 1. Space-Delimited Split Tags
- Verify space-delimited split tags using `| split:' '` on `data-tags="javascript react"`.

### 2. Numeric Parsing for Large Views Metrics
- Verify numeric parsing for large views metrics (like `"2.4k"` or `"12,500"` using `| cleanNumber`).

### 3. Layout Transformations
- Replace the legacy question container with `UiTableListPage`.
- Hide community bulletins and sidebars.

## Files Provided
- `stackoverflow.vnr` — Veneer source for StackOverflow questions list.
- `content.css` — Shadow DOM scoped styles.
- `fixtures/page-snapshot.html` — Page snapshot HTML.
