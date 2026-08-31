# Issue #23: Responsive Scaling & Pan-Zoom in `UiImageViewer` for Ultra-Wide Images

- **Repository**: `spm-components` (`src/components/dedicated/UiImageViewer.tsx`)
- **Defect Mapping**: `DEFECT-SBC-01`
- **Severity**: Important
- **Status**: Open

## 1. Problem Description

In `UiImageViewer.tsx`, rendering ultra-wide aspect ratio images (e.g., 32:9 panorama or panoramic banner artwork) with `imageFit="cover"` results in severe vertical cropping and total loss of visual context.

## 2. Technical Requirements

- Add auto-detection for extreme aspect ratios (aspect ratio > 2.2:1 or < 0.5:1).
- When an extreme aspect ratio image is loaded:
  - Automatically fallback from `imageFit="cover"` to `imageFit="contain"`.
  - Add interactive click-to-zoom / modal view functionality (`enableZoom?: boolean`, default: `true`).
  - Provide a toggle control button to switch between `Fit` and `Fill` modes.

## 3. Dependencies & Sub-issues

- **Prerequisites**: None
- **Related Issues**:
  - `ISSUE-5` (`UiImageCard` aspect ratios and fallbacks).

## 4. Acceptance Criteria & Test Plan

- [ ] Ultra-wide images (32:9) render completely in `UiImageViewer` without cropping key subject details.
- [ ] Users can toggle zoom or fit modes interactively.
- [ ] Unit tests added in `src/components/tests/UiImageViewer.test.tsx`.
