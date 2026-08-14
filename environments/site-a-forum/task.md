# QA Environment Task Brief: Site A - Hacker News Discussion Thread (`site-a-forum`)

## 🌐 Target Site & Page Details
- **Target URL Pattern:** `https://news.ycombinator.com/item?id=*`
- **Site Type:** Legacy Forum Discussion Thread (Hacker News)
- **Target Components:** `UiCommentListPage`, `UiSearchBar`

---

## 🎯 Modernization & QA Objectives

1. **Scraping Pipeline Validation (`comments.vnr`):**
   - Validate class inheritance and selector bindings targeting Hacker News comments (`tr.athing.comtr`).
   - Extract comment author (`a.hnuser | text`), timestamp (`span.age | text`), and comment body (`div.commtext | html`).
   - Reconstruct container `table.comment-tree` into `UiCommentListPage`.

2. **Destructive Boundary & Robustness Testing:**
   - **Malformed HTML Safety:** Test comment bodies containing unclosed tags or inline scripts via the `html` extractor pipe.
   - **Missing Metadata Fallbacks:** Test deleted authors (`[deleted]`) or missing timestamps.
   - **Viewport Scaling:** Test layout responsiveness on narrow screens (< 375px).

3. **Documentation Coverage Audit:**
   - Evaluate whether `docs/veneer-reference.md` and `docs/component-specs.md` accurately cover `UiCommentListPage` props and `html` pipe usage without missing steps.

4. **Report & Git Commit Protocol:**
   - Write complete findings to `environments/site-a-forum/result.md` in English.
   - Run `git add environments/site-a-forum/ && git commit -m "qa(site-a-forum): complete evaluation and generate result.md"`.
