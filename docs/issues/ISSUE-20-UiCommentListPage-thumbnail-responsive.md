# Issue #20: Conditional Thumbnail & Responsive Layout in `UiCommentListPage`

- **Repository**: `spm-components` (`src/components/dedicated/UiCommentListPage.tsx`)
- **Defect Mapping**: `DEFECT-SAF-01`, `DEFECT-SAF-03`
- **Severity**: Important
- **Status**: Open

## 1. Problem Description

When rendering thread listings on platforms like Hacker News or generic forums where posts lack avatar/thumbnail images (`thumbnailUrl` is `undefined`), `UiCommentListPage` currently renders an orphan `130px` placeholder container with a broken image icon (`DEFECT-SAF-01`).

Additionally, on mobile viewports (< 375px), the fixed `130px` width thumbnail column forces the main post content column into a severely compressed flex width (< 85px), causing illegible text wrapping (`DEFECT-SAF-03`).

## 2. Technical Requirements

### Feature 1: Conditional Thumbnail Rendering (`DEFECT-SAF-01`)
- Update `UiCommentListPage.tsx` to conditionally render the thumbnail image container only when `thread.thumbnailUrl` is defined and non-empty.
- Expose a `showThumbnails?: boolean` prop on `UiCommentListPageProps` (default: `true`) to allow explicit theme-level toggling.

### Feature 2: Responsive Flex Stacking (`DEFECT-SAF-03`)
- Apply responsive media queries or CSS flex-wrap rules:
  - On viewports `>= 576px`: Keep side-by-side flex layout with thumbnail column.
  - On viewports `< 576px`: Stack thumbnail above thread details (`flex-direction: column`) with full-width scaling (`width: 100%`, `max-height: 200px`, `object-fit: cover`).

## 3. Dependencies & Sub-issues

- **Parent Issue**: None
- **Child Sub-issues**:
  - `ISSUE-22` (Metadata formatting for author/timestamp fallbacks in `UiCommentCard`).

## 4. Acceptance Criteria & Test Plan

- [ ] `UiCommentListPage` renders without orphan `130px` image boxes when `thumbnailUrl` is missing.
- [ ] Viewports < 375px cleanly display post text with minimum `240px` readable width.
- [ ] Unit tests added in `src/components/tests/UiCommentListPage.test.tsx`.
