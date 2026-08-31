# Issue #25: Client-Side Hydrated `javascript:void(0)` Support for `infiniteScroll`

- **Repository**: `extension` (`src/content/modernizer.tsx`), `spm-cli`
- **Defect Mapping**: `DEFECT-SEC-02`
- **Severity**: Important
- **Status**: Open

## 1. Problem Description

When an `infiniteScroll` configuration is declared on a container (e.g. `UiTableListPage` or `UiPostDetails`), the extension engine attempts to fetch subsequent pages by extracting the `href` attribute of the next page anchor element (`a.next-page`). On modern single-page applications or hydrated admin boards, pagination controls use `href="javascript:void(0)"` or `href="#"` with inline `onclick` handlers, causing `infiniteScroll` auto-fetching to fail.

## 2. Technical Requirements

- Update `modernizer.tsx` infinite scroll resolution logic:
  1. Inspect `anchor.getAttribute('href')`. If `href` is valid URL or path (not `javascript:*` or `#`), perform standard `fetch()` parsing.
  2. If `href` is `javascript:void(0)` or `#`, fall back to triggering a simulated click (`triggerProxyClick(anchor)`) when the user reaches the scroll threshold.
  3. Attach a `MutationObserver` on the target list container to detect dynamically appended items following the simulated click.

## 3. Dependencies & Sub-issues

- **Prerequisites**: `triggerProxyClick` engine helper in `src/content/modernizer.tsx`.
- **Related Issues**:
  - `ISSUE-10` (Preserve slot fallback and selector conflict resolution).

## 4. Acceptance Criteria & Test Plan

- [ ] `infiniteScroll` successfully loads next page content when pagination anchors use `javascript:void(0)` with click event listeners.
- [ ] Unit tests added in `tests/engine.test.ts`.
