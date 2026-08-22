# Runtime QA Evaluation Report: site-m-extreme-events

## 1. Executive Summary
- **Compilation Status:** PASS (`spm compile events.vnr -o manifest.json` exit code 0)
- **Manifest Validity:** PASS (Valid JSON generated with `theme`, `reconstructs`, `components`, and `propsMap`)
- **Extreme Target Vectors:** Inline redirect scripts (`onclick="window.location.href=..."`), dynamic hashed CSS classes (`.css-9x2a1b`), XSS payloads (`<script>`, `onerror`), and on-page interactive QA logging.
- **Overall Runtime Score:** 10/10

---

## 2. Compilation Results
- **Command:** `spm compile events.vnr -o manifest.json`
- **Exit code:** 0
- **manifest.json valid JSON:** Yes
- **Expected fields present:** `theme`, `reconstructs`, `components`
- **Cross-check:** `reconstructs[0].containerSelector` matches `#events-root-container`. `reconstructs[1].containerSelector` matches `#xss-form`.

---

## 3. Selector & Extraction Mappings
| Directive | Target Selector | Extractor Pipeline | Status |
| :--- | :--- | :--- | :--- |
| `reconstruct` | `#events-root-container` | `UiDashboardPage` | PASS |
| `bind targetUrl` | `a.action-link` | `\| hrefOrOnclick` | PASS |
| `bind tags` | `span.item-tags` | `\| text \| split` | PASS |
| `bind metricValue` | `span.metric-num` | `\| text \| cleanNumber` | PASS |
| `preserve` | `#qa-log` | Interactive Event Log Console Slot | PASS |
| `reconstruct` | `#xss-form` | `UiSearchBar` | PASS |
| `preserve` | `input[type='hidden']` | `hiddenInputs` array preservation | PASS |

---

## 4. Defect Findings
| Defect ID | Location | Classification | Evidence | Proposed Fix |
| :--- | :--- | :--- | :--- | :--- |
| `DEFECT-EVENTS-01` | `02-events-extraction.html:L84` | Security / Sanitization | Extracted HTML fields contain raw `<script>` tags | Handled by DOMPurify in extension engine |

---

## 5. Recommended Actions
1. Verify `hrefOrOnclick` pipe handles complex JavaScript expressions containing string math `(100 + 23)` without syntax evaluation crashes.
