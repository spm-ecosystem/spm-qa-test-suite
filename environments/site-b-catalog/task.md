# QA Task Brief: Site B - Retro E-Commerce Catalog (`site-b-catalog`)

## Target Site & Page Scenario
- **Domain / Site:** `retro-ecommerce-catalog.com`
- **Page Type:** Product Grid Catalog with ultra-wide hero banners and tag sidebars.
- **Target Components:** `UiSplitLayout`, `UiImageViewer`, `UiScrollPanel`

## Task Instructions
1. Inspect the legacy catalog markup and `catalog.vnr` theme rules.
2. Rely **strictly** on the documentation in `docs/` (`docs/veneer-reference.md`, `docs/component-specs.md`, `docs/manifest-schema.md`, `docs/cli-tooling.md`).
3. Conduct destructive testing on edge cases:
   - Ultra-panoramic 32:9 image ratios loaded inside `UiImageViewer`.
   - Empty tag filter arrays (`tags: []`) in `UiScrollPanel`.
   - Navigation clicks outside standard anchor bounds in scroll panels.
4. Evaluate documentation sufficiency and friction points.
5. Generate the environment report at `environments/site-b-catalog/result.md` in English.
6. Commit all changes locally: `git add environments/site-b-catalog/ && git commit -m "qa(site-b-catalog): complete evaluation and generate result.md"`.
