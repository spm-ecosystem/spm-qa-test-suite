# Issue #24: Tag Container Overflow & Empty State Isolation in `UiScrollPanel`

- **Repository**: `spm-components` (`src/components/dedicated/UiScrollPanel.tsx`)
- **Defect Mapping**: `DEFECT-SBC-02`, `DEFECT-SBC-04`
- **Severity**: Minor
- **Status**: Open

## 1. Problem Description

`UiScrollPanel` exhibits two visual layout glitches:
1. When `tags` is empty (`tags: []`) and `statisticsHtml` is undefined, `UiScrollPanel` renders an empty `<aside>` sidebar containing an orphaned `<hr>` line (`DEFECT-SBC-02`).
2. Long tag names without spaces cause horizontal scrollbar overflow in the sidebar despite `overflowX: 'hidden'` (`DEFECT-SBC-04`).

## 2. Technical Requirements

### Feature 1: Empty Sidebar & Divider Isolation (`DEFECT-SBC-02`)
- Wrap sidebar metadata blocks and `<hr>` dividers in conditional checks: `if (tags && tags.length > 0)`.
- Omit the entire `<aside>` element if all sidebar props (`tags`, `statisticsHtml`, `metadata`) are absent.

### Feature 2: Tag Text Wrapping & Break-Word (`DEFECT-SBC-04`)
- Apply `word-break: break-word`, `overflow-wrap: anywhere`, and `flex-wrap: wrap` to tag badge containers inside `UiScrollPanel`.

## 3. Dependencies & Sub-issues

- **Parent Issue**: None
- **Child Sub-issues**:
  - `ISSUE-24.1`: Empty state container rendering.
  - `ISSUE-24.2`: CSS flex-wrap and word-break styling.

## 4. Acceptance Criteria & Test Plan

- [ ] Empty `tags: []` renders no orphaned `<hr>` lines.
- [ ] Unbroken tag strings (e.g., `very_long_tag_name_without_spaces_12345`) wrap cleanly inside sidebar bounds without triggering horizontal scrollbars.
- [ ] Unit tests added in `src/components/tests/UiScrollPanel.test.tsx`.
