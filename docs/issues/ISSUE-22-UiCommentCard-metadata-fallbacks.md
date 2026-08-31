# Issue #22: Fallback Metadata Formatting for Deleted Authors and Timestamps

- **Repository**: `spm-components` (`src/components/dedicated/UiCommentListPage.tsx`)
- **Defect Mapping**: `DEFECT-SAF-04`
- **Severity**: Minor
- **Status**: Open

## 1. Problem Description

When post author metadata is missing or marked as deleted (`[deleted]`) or when post creation timestamps are omitted, `UiCommentCard` currently renders empty strings alongside fixed label strings. This leaves dangling, incomplete label prefixes like `"Posted by: "` or `" • "` without content.

## 2. Technical Requirements

- In `UiCommentListPage.tsx`, provide intelligent fallbacks:
  - If `post.author` is empty or undefined, default to `"Anonymous"` or omit the `"Posted by: "` prefix entirely.
  - If `post.timestamp` or `post.date` is empty, omit the preceding bullet separator (`" • "`).
- Ensure metadata line renders cleanly as `Posted by Author • 2 hours ago` when all fields are present, or `2 hours ago` / `Posted by Author` when partial metadata is supplied.

## 3. Dependencies & Sub-issues

- **Parent Issue**: `ISSUE-20` (`UiCommentListPage` layout & card formatting).

## 4. Acceptance Criteria & Test Plan

- [ ] Posts with missing authors render cleanly without trailing `"Posted by: "` artifacts.
- [ ] Posts with missing timestamps omit orphaned bullet separators.
- [ ] Unit tests added in `src/components/tests/UiCommentListPage.test.tsx`.
