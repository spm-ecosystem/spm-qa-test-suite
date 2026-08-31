# Issue 29: UiTableListPage Mandatory Sidebar & Empty State Isolation

## Summary
`UiTableListPage` currently renders an unconditional `<aside id="sidebarSlot-container">` container element with hardcoded `width: 240px`, `padding: 16px`, and `border-right: 1px solid var(--spm-border)`. When no sidebar slot content or preserved nodes are assigned to `sidebarSlot`, the component relies on CSS `:empty` pseudo-class hiding (`#sidebarSlot-container:empty { display: none !important; }`), which fails under Shadow DOM host reparenting and flex layout environments. This leaves an empty 240px dark column on the left side of pages using `UiTableListPage`.

## Target Component / Module
- `spm-components` / `UiTableListPage.tsx` ([`src/components/dedicated/UiTableListPage.tsx`](file:///home/watashi/Projects/extension/src/components/dedicated/UiTableListPage.tsx#L299-L310))

## Problem Description
1. `<aside id="sidebarSlot-container">` is unconditionally rendered in the main flex container layout.
2. In Flexbox, an `<aside>` element with explicit `width: 240px` reserves layout width even when empty.
3. CSS `:empty` selector fails to match when whitespace, comments, or dynamic Shadow DOM reparenting nodes exist.

## Proposed Remediation Specifications
1. **Conditional Render / Ref Guard**:
   - Wrap the `<aside id="sidebarSlot-container">` rendering logic in conditional state checks or ref-based node observation so that when no sidebar content/slot nodes exist, `<aside>` is omitted entirely from the DOM (`null` render).
2. **Prop Control**:
   - Introduce an optional `hasSidebar?: boolean` or `sidebar?: React.ReactNode` prop to allow explicit opt-in/opt-out control.
3. **Regression Tests**:
   - Add unit tests in `UiTableListPage.test.tsx` asserting that rendering `UiTableListPage` without sidebar content produces no `<aside>` element in the DOM tree.

## Priority & Impact
- **Severity**: Medium (Visual Layout Artifact)
- **Component**: `UiTableListPage`
