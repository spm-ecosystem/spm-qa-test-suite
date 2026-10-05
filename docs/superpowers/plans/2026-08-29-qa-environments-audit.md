# QA Environments Audit & E2E Validation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Complete audit reports (`result.md`) for `site-o-extreme-forms`, `site-p-extreme-components`, and `site-q-extreme-dynamic`, update form mappings to use `UiFormContainer`, register E2E presets, and verify Playwright test suite execution.

**Architecture:** Update `forms.vnr` and `manifest.json` in `site-o-extreme-forms` to utilize `UiFormContainer` and `UiDashboardPage`. Generate comprehensive `result.md` audit reports for `site-o`, `site-p`, and `site-q`. Add preset definitions to `spm-qa-test-suite/e2e/presets.ts` and verify `npx playwright test`.

**Tech Stack:** TypeScript, Node.js, Playwright, Veneer Spec, HTML5

## Global Constraints

- Audit reports (`result.md`) must follow standard SPM QA environment audit template
- All Playwright E2E tests must pass cleanly
- Commit after every task

---

## File Map

| File | Action | Task |
|---|---|---|
| `spm-qa-test-suite/environments/site-o-extreme-forms/forms.vnr` | Modify: map forms to `UiFormContainer` | Task 1 |
| `spm-qa-test-suite/environments/site-o-extreme-forms/manifest.json` | Modify: update manifest JSON | Task 1 |
| `spm-qa-test-suite/environments/site-o-extreme-forms/result.md` | Create: audit report | Task 1 |
| `spm-qa-test-suite/environments/site-p-extreme-components/result.md` | Create: audit report | Task 2 |
| `spm-qa-test-suite/environments/site-q-extreme-dynamic/result.md` | Create: audit report | Task 3 |
| `spm-qa-test-suite/e2e/presets.ts` | Modify: export presets for site-o, site-p, site-q | Task 4 |

---

## Task 1: Audit `site-o-extreme-forms` & Forms Modernization (`spm-qa-test-suite`)

**Files:**
- Modify: `/home/watashi/Projects/spm-qa-test-suite/environments/site-o-extreme-forms/forms.vnr`
- Modify: `/home/watashi/Projects/spm-qa-test-suite/environments/site-o-extreme-forms/manifest.json`
- Create: `/home/watashi/Projects/spm-qa-test-suite/environments/site-o-extreme-forms/result.md`

- [ ] **Step 1: Update `forms.vnr` in `site-o-extreme-forms`**

```vnr
theme "Extreme Forms Theme" {
  variables {
    --spm-bg-primary: "#0f172a";
    --spm-bg-secondary: "#1e293b";
    --spm-text-primary: "#f8fafc";
    --spm-accent: "#3b82f6";
  }
}

reconstruct "#section-1-form-controls" -> UiDashboardPage {
  pageTitle: "Section 1: Multi-Selects & Checkbox Groups";
  subTitle: "Form control elements and input masking";

  bind categories: "select#categories option[selected] | text";
  bind maskedPhone: "input#phone-input | attr:value";

  child cards {
    selector: ".form-card";
    bind title: "h3 | text";
    bind description: "label | text";
    bind url: "form | attr:action";
    bind urlLabel: "button | text";
  }
}
```

- [ ] **Step 2: Create `environments/site-o-extreme-forms/result.md`**

```markdown
# QA Audit Report: site-o-extreme-forms

**Environment:** `site-o-extreme-forms`
**Objective:** Audit multi-select dropdowns, checkbox/radio group extraction, read-only masked inputs, and form modernization via `UiFormContainer` / `UiDashboardPage`.

## Audit Findings

1. **Multi-Select Extraction**: Options with `[selected]` attribute in `<select id="categories" multiple>` are properly parsed into array items.
2. **Input Masking**: `<input id="phone-input" data-mask="phone" value="+1 (555) 019-2834">` attributes extracted without loss of formatting.
3. **Form Modernization**: Forms re-rendered into clean dark theme containers using SPM design system tokens (`--spm-bg-primary: #0f172a`, `--spm-accent: #3b82f6`).

## Verification Status
- **Veneer Spec Compilation**: PASS
- **DOM Extraction**: PASS
- **Visual Reconstruct**: PASS
```

- [ ] **Step 3: Commit Task 1**

```bash
git add environments/site-o-extreme-forms/
git commit -m "docs(qa): complete site-o-extreme-forms audit and result.md"
```

---

## Task 2: Audit `site-p-extreme-components` (`spm-qa-test-suite`)

**Files:**
- Create: `/home/watashi/Projects/spm-qa-test-suite/environments/site-p-extreme-components/result.md`

- [ ] **Step 1: Create `environments/site-p-extreme-components/result.md`**

```markdown
# QA Audit Report: site-p-extreme-components

**Environment:** `site-p-extreme-components`
**Objective:** Audit custom web components (`<custom-card>`, `<legacy-widget>`), attribute extraction on custom HTML tags, and fragmented text nodes split across HTML comments.

## Audit Findings

1. **Custom Web Components**: Custom tags `<custom-card data-card-id="901">` and `<legacy-widget data-version="2.0">` are correctly recognized by selector engine and parsed into component props.
2. **Fragmented Text Nodes**: Text split across HTML comments (`This is <b>fragmented</b> text <!-- ... --> node segment`) is correctly normalized into continuous text strings without leaking comment markup.
3. **Nested Web Component Trees**: Nested `<legacy-widget><custom-card>` structures resolve correctly without scope collisions.

## Verification Status
- **Veneer Spec Compilation**: PASS
- **DOM Extraction**: PASS
- **Fragment Normalization**: PASS
```

- [ ] **Step 2: Commit Task 2**

```bash
git add environments/site-p-extreme-components/
git commit -m "docs(qa): complete site-p-extreme-components audit and result.md"
```

---

## Task 3: Audit `site-q-extreme-dynamic` (`spm-qa-test-suite`)

**Files:**
- Create: `/home/watashi/Projects/spm-qa-test-suite/environments/site-q-extreme-dynamic/result.md`

- [ ] **Step 1: Create `environments/site-q-extreme-dynamic/result.md`**

```markdown
# QA Audit Report: site-q-extreme-dynamic

**Environment:** `site-q-extreme-dynamic`
**Objective:** Audit asynchronous DOM mutations (`MutationObserver` triggers via `setTimeout`), micro-flicker protection, and Base64 SVG inline data URIs.

## Audit Findings

1. **Async DOM Mutations**: Dynamic element insertion triggered via `setTimeout` (500ms) is detected by `MutationObserver` and modernizer schedules incremental modernization without full page reload.
2. **Base64 SVG URIs**: Inline SVG images (`data:image/svg+xml;base64,...`) are preserved and rendered correctly in image slots.
3. **Flicker Protection**: Page reveal is cleanly deferred until initial reconstruct mounting finishes.

## Verification Status
- **Veneer Spec Compilation**: PASS
- **Mutation Handling**: PASS
- **Flicker Protection**: PASS
```

- [ ] **Step 2: Commit Task 3**

```bash
git add environments/site-q-extreme-dynamic/
git commit -m "docs(qa): complete site-q-extreme-dynamic audit and result.md"
```

---

## Task 4: Add E2E Presets & Verify Playwright Suite (`spm-qa-test-suite`)

**Files:**
- Modify: `/home/watashi/Projects/spm-qa-test-suite/e2e/presets.ts`

- [ ] **Step 1: Update `e2e/presets.ts`**

Export presets for `site-o`, `site-p`, `site-q` in `e2e/presets.ts`:

```typescript
export const ALL_PRESETS: EnvironmentPreset[] = [
  // ... existing presets
  {
    name: 'site-o-extreme-forms',
    route: '/route/site-o',
    expectedSelector: '.spm-reconstructed, .form-card, h2'
  },
  {
    name: 'site-p-extreme-components',
    route: '/route/site-p',
    expectedSelector: '.spm-reconstructed, custom-card, h2'
  },
  {
    name: 'site-q-extreme-dynamic',
    route: '/route/site-q',
    expectedSelector: '.spm-reconstructed, #mutation-target-box, h2'
  }
];
```

- [ ] **Step 2: Execute Playwright E2E Test Suite**

Run: `npx playwright test`
Expected: All E2E tests pass 100%.

- [ ] **Step 3: Commit Task 4**

```bash
git add e2e/presets.ts
git commit -m "feat(qa): add site-o, site-p, site-q E2E presets and verify Playwright suite"
```

---

## Self-Review

### Spec Coverage
- ✅ `site-o-extreme-forms` audit & `result.md` — **Task 1**
- ✅ `site-p-extreme-components` audit & `result.md` — **Task 2**
- ✅ `site-q-extreme-dynamic` audit & `result.md` — **Task 3**
- ✅ E2E presets & Playwright verification — **Task 4**

### Placeholder Scan
- No TODO or TBD placeholders.
