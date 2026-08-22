# Runtime QA Evaluation Report: site-l-extreme-legacy

## 1. Executive Summary
- **Compilation Status:** PASS (`spm compile legacy.vnr -o manifest.json` exit code 0)
- **Manifest Validity:** PASS (Valid JSON generated with `theme`, `reconstructs`, and `components`)
- **Extreme Target Vectors:** 4-level nested tables, duplicate IDs across form elements, deprecated markup tags (`<font>`, `<marquee>`, `<center>`), custom tags (`<custom-card>`), and fragmented text nodes.
- **Overall Runtime Score:** 9/10

---

## 2. Compilation Results
- **Command:** `spm compile legacy.vnr -o manifest.json`
- **Exit code:** 0
- **manifest.json valid JSON:** Yes
- **Expected fields present:** `theme`, `reconstructs`, `components`
- **Cross-check:** `reconstructs[0].containerSelector` matches `#legacy-root-table`. `components[0].selector` matches `#legacy-top-nav`.

---

## 3. Selector & Extraction Mappings
| Directive | Target Selector | Extractor Pipeline | Status |
| :--- | :--- | :--- | :--- |
| `reconstruct` | `#legacy-root-table` | `UiTableListPage` | PASS |
| `child tableItems` | `#data-table-body > tr:not(.table-header)` | `RowBase` -> `AdvancedRow` | PASS |
| `bind title` | `td.cell-title` | `\| text` | PASS |
| `bind price` | `td.cell-price` | `\| text \| cleanNumber` | PASS |
| `bind tags` | `td.cell-tags` | `\| text \| split:,` | PASS |
| `preserve` | `#duplicate-form-1` | Legacy Search Form Slot | PASS |
| `action: hide` | `marquee, font[size='7'], #duplicate-form-2` | Hides deprecated elements | PASS |

---

## 4. Defect Findings
| Defect ID | Location | Classification | Evidence | Proposed Fix |
| :--- | :--- | :--- | :--- | :--- |
| `DEFECT-LEGACY-01` | `legacy.vnr:L12` | DSL Syntax / Friction | `customStyles` requires `{ "..." }` block wrapper | Documented in `veneer-reference.md` and syntax enforced |

---

## 5. Recommended Actions
1. Ensure modernizer `cleanNumber` extractor cleanly strips HTML formatting tags (`<font>`, `<b>`) wrapping table cell text nodes prior to float parsing.
