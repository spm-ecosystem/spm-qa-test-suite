# QA Environments Audit & E2E Validation Design

**Date:** 2026-08-29
**Author:** Antigravity AI Assistant & Engineering Team
**Target Repository:** `spm-qa-test-suite`

---

## 1. Executive Summary

This design document specifies the architecture and audit procedure for completing **Bloco C** QA investigation items in `spm-qa-test-suite`:
1. **`site-o-extreme-forms`**: Audit multi-selects, checkbox groups, masked inputs, and map using `UiFormContainer` & `UiDashboardPage`. Generate `result.md`.
2. **`site-p-extreme-components`**: Audit custom web components (`<custom-card>`, `<legacy-widget>`) and text nodes fragmented across HTML comments. Generate `result.md`.
3. **`site-q-extreme-dynamic`**: Audit asynchronous DOM mutations (`MutationObserver` trigger via `setTimeout`) and Base64 SVG data URIs. Generate `result.md`.
4. **E2E Presets & Playwright Verification**: Register `site-o`, `site-p`, and `site-q` in `e2e/presets.ts` and verify 100% E2E test execution.

---

## 2. Environment Specifications & Audit Mappings

### 2.1 `site-o-extreme-forms`
- **Path**: `environments/site-o-extreme-forms/`
- **Key Elements**: Multi-select options (`select#categories`), checkbox groups (`#checkbox-group`), masked inputs (`input[data-mask="phone"]`), submit button (`button.btn-submit`).
- **Mapping**: Update `forms.vnr` to utilize `UiFormContainer` for form control cards and `UiDashboardPage` for section layout.
- **Audit File**: `environments/site-o-extreme-forms/result.md`

### 2.2 `site-p-extreme-components`
- **Path**: `environments/site-p-extreme-components/`
- **Key Elements**: Custom tags (`<custom-card data-card-id="901">`), fragmented text nodes with inline comments (`This is <b>fragmented</b> text <!-- ... -->`), nested custom tags (`<legacy-widget><custom-card>`).
- **Audit File**: `environments/site-p-extreme-components/result.md`

### 2.3 `site-q-extreme-dynamic`
- **Path**: `environments/site-q-extreme-dynamic/`
- **Key Elements**: Dynamic element insertion via `setTimeout` (500ms), Base64 SVG inline data URI (`data:image/svg+xml;base64,...`).
- **Audit File**: `environments/site-q-extreme-dynamic/result.md`

---

## 3. E2E Test Suite Integration

1. Add presets for `site-o`, `site-p`, and `site-q` to `e2e/presets.ts`.
2. Ensure Playwright test server serves `/route/site-o`, `/route/site-p`, and `/route/site-q`.
3. Execute `npx playwright test` to verify clean E2E assertion pass for all environments.
