# Issue #26: Complete Prop & Behavioral Specification for `UiNavHeader` `sticky` Property

- **Repository**: `spm-components` (`docs/component-specs.md`)
- **Defect Mapping**: `DEFECT-SFW-02`
- **Severity**: Minor (Documentation Gap)
- **Status**: Open

## 1. Problem Description

In `docs/component-specs.md`, `UiNavHeader` lists a `sticky?: boolean` prop in its TypeScript interface definition, but provides zero behavioral documentation explaining its CSS implementation details, default `z-index`, scroll interaction behavior, or viewport behavior.

## 2. Technical Requirements

- Update `docs/component-specs.md` under the `UiNavHeader` section:
  - Add a dedicated subsection: **"Sticky Navigation Behavior"**.
  - Document CSS rules applied when `sticky={true}`: `position: sticky; top: 0; z-index: 1000; backdrop-filter: blur(12px)`.
  - Provide a `.vnr` code example demonstrating `sticky: true` configuration.

## 3. Dependencies & Sub-issues

- **Parent Issue**: None
- **Related Issues**:
  - `ISSUE-2` (Resolved `UiNavHeader` `items` vs `primaryLinks` prop overlap).

## 4. Acceptance Criteria & Test Plan

- [ ] `docs/component-specs.md` contains clear behavioral guidelines for `sticky` prop on `UiNavHeader`.
- [ ] `.vnr` example compiles cleanly in `spm-cli`.
