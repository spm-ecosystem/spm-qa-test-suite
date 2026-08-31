# Issue #28: Preserve Search Query State via `defaultValue` Binding on `UiSearchBar`

- **Repository**: `spm-websites` (`spm-theme-hackernews/vnr_project/layout.vnr`, `news.ycombinator.com`)
- **Defect Mapping**: `DEFECT-SJS-06`
- **Severity**: Minor
- **Status**: Open

## 1. Problem Description

In `spm-theme-hackernews` and similar theme specs, `UiSearchBar` reconstruct blocks omit the `defaultValue` binding. When a user submits a search query and lands on the search results page, the search input field is cleared upon component mounting instead of retaining the user's active query string.

## 2. Technical Requirements

- Update `vnr_project/layout.vnr` in `spm-theme-hackernews` (and general theme templates):
  - Bind `defaultValue` on `UiSearchBar`:
    ```vnr
    reconstruct "form[action*='search']" -> UiSearchBar {
        bind defaultValue: "input[name='q'] | attr:value";
        bind searchParamName: "q";
    }
    ```
- Verify `UiSearchBar.tsx` in `spm-components` correctly populates `input.value` from `defaultValue` prop on initial mount.

## 3. Dependencies & Sub-issues

- **Prerequisites**: `defaultValue` prop on `UiSearchBar` component in `spm-components`.
- **Related Issues**:
  - `ISSUE-28.1`: Update `spm-websites` theme manifests.

## 4. Acceptance Criteria & Test Plan

- [ ] Navigating to a search results URL preserves the user's search query in the `UiSearchBar` input field.
- [ ] `spm compile` compiles the updated `layout.vnr` cleanly.
