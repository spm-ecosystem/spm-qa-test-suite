# Archived Resolved Issues & Defects Baseline

**Repository:** `spm-qa-test-suite`  
**Last Updated:** 2026-08-23  

This document stores all resolved software defects, completed GitHub issues, and verified fixes across the SPM ecosystem.

---

## 1. Resolved Defect Catalog

| Defect ID | Component / File | Classification | Failure Mechanism & Remediation | Resolution Commit |
| :--- | :--- | :--- | :--- | :--- |
| `DEFECT-SEC-01` | `UiTableListPage.tsx` | Responsive Layout | Wide data tables exceeding 15 columns lacked horizontal scrolling. Added `overflow-x: auto` container. | `spm-components: b09cecf` |
| `DEFECT-SEC-03` | `engine.ts` & `validate.js` | Data Transformation | Currency & metric strings (`2.4k`, `1.5M`, `R$ 2.500,75`) broke `parseFloat`. Upgraded `parseCleanNumber` with multiplier suffixes and separator detection. | `extension: 60d8268` / `spm-cli: 7ba0381` |
| `DEFECT-SBC-03` | `UiSearchBar.tsx` | Functionality / Form | `UiSearchBar` without `submitUrl` swallowed form submissions. Added `try/catch` on `hiddenFields` JSON parse and explicit console warning fallback. | `spm-components: 8716521` |
| `DEFECT-SIG-01` | `UiTableListPage.tsx` & `UiTagBadge.tsx` | Component Feature | `badgeStyleKey` was declared in types but ignored in rendering. Implemented `variant` prop (`success`, `danger`, `warning`, `info`) in `UiTagBadge` and `UiTableListPage`. | `spm-components: 9c1629d` |
| `DEFECT-SAF-02` | `engine.ts` | Security / Sanitization | Extracted HTML could contain raw script or event handlers. Integrated `DOMPurify.sanitize()` into `html` extractor pipe in `engine.ts`. | `extension: d6ca8e1` |
| `DEFECT-CLI-01` | `spm-cli/src/commands/execute.hpp` | Cross-Platform / Windows | POSIX direct headers `<unistd.h>` and `<sys/wait.h>` broke Windows builds. Wrapped POSIX calls in `#ifndef _WIN32` and added Windows `_spawnvp` process execution. | `spm-cli: 76ce914` |
| `DEFECT-CLI-02` | `spm-cli/src/commands/publish.hpp` | Security / Command Injection | `publish.hpp` used `std::system()` with string concatenation for git commands. Replaced `std::system()` with `safeExecute()` argument vectors. | `spm-cli: fe6c5cb` |
| `DEFECT-PORTAL-01` | `spm-portal` | Build / Documentation | Runtime `fetch()` of `.md` files failed offline. Built `sync-docs.js` and eager Vite `import.meta.glob` for 0ms latency build-time bundling. | `spm-portal: 3fba99f` |
| `DEFECT-EXT-01` | `site-package-manager` | Build / Registry | `npm run build` failed when sibling repo `vscode-theme-manifest-intellisense` was absent. Built `build-registry-safe.js` to allow standalone builds. | `extension: eb9dc4d` |
| `DEFECT-EXT-02` | `interceptor.iife.ts` & `modernizer.tsx` | Cross-Origin Messaging | `postMessage` with `window.location.origin` inside iframe caused messages to be dropped by top window across origins. Restored `'*'` targetOrigin for iframe toasts. | `extension: eb9dc4d` |
| `DEFECT-SGG-07` | `UiSplitLayout.tsx` | Component Alias | `UiSplitLayout` expected `src`/`alt` in `imageSlot`, but `DetailedGalleryItem` sent `imageUrl`/`title`. Added fallback aliases `src: imageUrl || src` and `alt: title || alt`. | `spm-components: 506a4a8` |
| `DEFECT-SIG-02` | `UiTableListPage.tsx` | Component Feature | Array column values (e.g. `["bug", "p0"]`) rendered as unstyled text or `[object Object]`. Supported array values in `UiTableListPage` by rendering `<UiTagBadge>` elements. | `spm-components: 506a4a8` |
| `DEFECT-SJS-02` | `validate.js` | Validation CLI | `spm validate` checked container selectors but ignored child-level item binding failures. Added item-level binding check to report `FAIL` if child items return `null`. | `spm-cli: 2da1599` |

---

## 2. Completed GitHub Ecosystem Issues

- **Issue #1 (`spm-qa-test-suite`):** Document LayoutPrimitives prop tables — **Completed**
- **Issue #2 (`spm-qa-test-suite`):** Resolve items vs primaryLinks prop overlap in `UiNavHeader` — **Completed**
- **Issue #7 (`spm-qa-test-suite`):** Add date and currency column types to `UiTableListPage` — **Completed**
- **Issue #8 (`spm-qa-test-suite`):** `UiNavHeader` built-in overflow handling — **Completed**
- **Issue #9 (`spm-qa-test-suite`):** Add lazy loading prop to `UiImageCard` — **Completed**
- **Issue #11 (`spm-qa-test-suite`):** Rename `qa-orchestration` skill to `qa-doc-audit` — **Completed**
- **Issue #12 (`spm-qa-test-suite`):** Update Veneer reference documentation for native JSON arrays and objects — **Completed**
- **Issue #14 (`spm-qa-test-suite`):** `UiSplitLayout` imageSlot key mismatch with DetailedGalleryItem (`DEFECT-SGG-07`) — **Completed**
- **Issue #16 (`spm-qa-test-suite`):** Add support for array-based columns rendering in `UiTableListPage` (`DEFECT-SIG-02, SJS-07`) — **Completed**
- **Issue #17 (`spm-qa-test-suite`):** `spm validate` should check child-level item bindings for failure (`DEFECT-SJS-02`) — **Completed**
- **Issue #18 (`spm-qa-test-suite`):** Fix `cleanNumber` pipe metric abbreviation strip and hyphen parsing bugs — **Completed**
- **Issue #2 (`spm-cli`):** Add `spm validate` command for manifest-against-HTML validation — **Completed**
- **Issue #3 (`spm-cli`):** Add `spm apply` command to apply manifest transformations to HTML snapshots — **Completed**
