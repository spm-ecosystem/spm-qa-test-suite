# Task Brief: site-m-extreme-events

## 1. Target Environment Overview
- **Site Name:** Dynamic Event & Extraction Portal
- **Domain:** `synthetic-events-portal.internal`
- **Scenario:** Complex inline `onclick` scripts, dynamic hashed selectors (`.css-9x2a1b`), XSS payloads, malformed tags, and interactive logging.

---

## 2. Requirements & Goals
1. Reconstruct main interactive panel into a `UiDashboardPage` React component.
2. Bind inline redirect links using `hrefOrOnclick` extractor.
3. Collect form hidden inputs using `hiddenInputs` extractor pipe.
4. Extract tags and values using chained `| text | split` and `| cleanNumber` pipes.
5. Hide unneeded tracker inputs and invalid image nodes.
