# Task Brief: site-i-github

## Target Site
**GitHub Repository Issue Tracker** (e.g. `github.com/spm-ecosystem/spm-qa-test-suite/issues`)

## Target Page Scenario
A repository issues list page with search filter input, issue items with author metadata, comments counts, and labels.

## Primary Components Under Test
- **`UiTableListPage`** — Table of issues displaying items.
- **`UiSearchBar`** — Standalone form with search/filter input.
- **`UiTagBadge`** — Tag components for issues labels.

## Testing Requirements

### 1. `| split` Pipe
- Verify the compiler `| split` pipe on comma-separated tags (`data-labels="bug,documentation"`).

### 2. Numeric Parser Pipes
- Verify numeric parser pipes (`| number` / `| cleanNumber`) on comments count and issue number.

### 3. Layout Transformations
- Scoped classes targeting `.js-issue-row` and hiding legacy repository header tabs/footer.

## Files Provided
- `github.vnr` — Veneer source for GitHub issues list.
- `content.css` — Shadow DOM scoped styles.
- `fixtures/page-snapshot.html` — Page snapshot HTML.
