# Task Brief: site-l-extreme-legacy

## 1. Target Environment Overview
- **Site Name:** Extreme Legacy Portal
- **Domain:** `synthetic-legacy-portal.internal`
- **Scenario:** Extreme legacy DOM structure containing 4-level nested tables, duplicate input/form IDs, deprecated HTML tags (`<font>`, `<marquee>`, `<center>`), custom elements (`<custom-card>`), and fragmented text nodes.

---

## 2. Requirements & Goals
1. Reconstruct main nested table layout into a modern `UiTableListPage` React layout.
2. Bind table rows using complex structural exclusions (`tr:not(.table-header):not(.table-footer)`).
3. Extract item attributes using extractor pipes: `| text`, `| cleanNumber`, `| split:,`, and `| attr:src`.
4. Preserve hidden inputs and legacy search form controls in `preserve` slot.
5. Hide deprecated marquee banners, broken footer spans, and duplicate sidebars using `selector action: hide`.
