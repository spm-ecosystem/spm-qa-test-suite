# QA Task Brief: Site A - Legacy vBulletin Forum Thread (`site-a-forum`)

## Target Site & Page Scenario
- **Domain / Site:** `old-vbulletin-thread.org`
- **Page Type:** Legacy Discussion Thread with nested replies, user info badges, and author avatars.
- **Target Components:** `UiCommentListPage`, `UiSearchBar`

## Task Instructions
1. Inspect the legacy DOM structure and `comments.vnr` theme rules.
2. Rely **strictly** on the documentation in `docs/` (`docs/veneer-reference.md`, `docs/component-specs.md`, `docs/manifest-schema.md`, `docs/cli-tooling.md`).
3. Conduct destructive testing on edge cases:
   - Malformed HTML strings inside comment bodies via the `html` extractor pipe.
   - Missing user avatars or empty usernames to test fallback layouts.
   - Responsive scaling under ultra-narrow viewports (< 375px).
4. Evaluate documentation sufficiency and friction points.
5. Generate the environment report at `environments/site-a-forum/result.md` in English.
6. Commit all changes locally: `git add environments/site-a-forum/ && git commit -m "qa(site-a-forum): complete evaluation and generate result.md"`.
