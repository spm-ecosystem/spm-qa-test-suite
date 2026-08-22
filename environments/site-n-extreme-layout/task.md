# Task Brief: site-n-extreme-layout

## 1. Target Environment Overview
- **Site Name:** Extreme Layout & Shadow DOM Gallery
- **Domain:** `synthetic-layout-portal.internal`
- **Scenario:** 50+ inline CSS rules with `!important`, dynamic DOM mutations via `setTimeout` and `requestAnimationFrame`, Shadow DOM open root, and media gallery with `srcset`/base64 images.

---

## 2. Requirements & Goals
1. Reconstruct main media gallery into a `UiModernGridPage` React layout.
2. Bind gallery item images with `srcset` and base64 URIs using `| attr:src` and `| attr:srcset`.
3. Handle async DOM mutation container in `preserve` slot.
4. Extract tag arrays and pricing metadata using `| split` and `| cleanNumber`.
5. Replace header with a sticky `UiNavHeader` component.
