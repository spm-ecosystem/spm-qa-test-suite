# Issue #21: HTML Sanitization & Rich Text Rendering in `UiCommentReply`

- **Repository**: `spm-components` (`src/components/dedicated/UiCommentListPage.tsx`)
- **Defect Mapping**: `DEFECT-SAF-02`
- **Severity**: Important (Security & Formatting)
- **Status**: Open

## 1. Problem Description

In `UiCommentListPage.tsx`, nested reply comments (`UiCommentReply`) render `comment.body` directly as a plain string text node inside a `<span>`. When extracted markup containing HTML tags (e.g. `<p>`, `<code>`, `<a>`) is passed via the `| html` extractor pipe, the markup prints as raw unrendered string tags (e.g., `"<p>Hello <b>world</b></p>"`).

## 2. Technical Requirements

- Import `DOMPurify` (or use engine-provided HTML sanitizer interface) in `UiCommentListPage.tsx`.
- Add a prop `isHtmlContent?: boolean` to comment reply components.
- When `comment.body` contains HTML or `isHtmlContent` is set to `true`, sanitize `comment.body` using `DOMPurify.sanitize()` and render via `dangerouslySetInnerHTML={{ __html: sanitizedHtml }}`.
- Style formatted elements inside comment replies (`<p>`, `<code>`, `<a>`, `<blockquote>`) using SPM dark mode CSS classes.

## 3. Dependencies & Sub-issues

- **Prerequisites**: `DOMPurify` library dependency in `spm-components`.
- **Related Issues**:
  - `ISSUE-20` (`UiCommentListPage` layout refactoring).

## 4. Acceptance Criteria & Test Plan

- [ ] HTML tags inside comment replies render as formatted DOM nodes instead of raw text strings.
- [ ] Harmful script tags (`<script>`, `onload=`) are stripped safely without XSS vulnerabilities.
- [ ] Unit tests added in `src/components/tests/UiCommentListPage.test.tsx` verifying sanitized HTML output.
