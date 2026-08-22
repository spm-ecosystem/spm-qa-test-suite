# SPM QA Master Testing Plan & Acceptance Criteria

> **Goal:** Systematically audit, test, and document all SPM QA test environments one by one, testing subagent friction, component compatibility, and engine behavior, updating `qa-result.md` after each completed environment.

---

## 1. Testing Protocol & Acceptance Criteria per Environment

For EVERY environment test, the following 5 acceptance criteria must be satisfied before moving to the next environment:

1. **Veneer Spec Compilation:** `spm compile <source.vnr> -o manifest.json` exits with code 0.
2. **Static Preprocessing (`spm apply`):** `apply.js` produces `fixtures/result.html` containing standalone manifest and engine script tags without DOM corruption.
3. **Subagent Delegation Evaluation:** `subagent_cli.py` tested to observe LLM failure retries, missing class declarations, and syntax friction.
4. **Visual & Engine Playwright E2E (`npm run test:e2e`):** Chrome loads the page snapshot with the SPM extension, renders React Shadow DOM components without NPEs, and generates an annotated snapshot in `screenshots/`.
5. **Centralized QA Result Update (`qa-result.md`):** Append/update `qa-result.md` with empirical failure logs, component gaps, and defect classifications.

---

## 2. Environment Test Suite Matrix

### Phase 1: Synthetic Extreme Edge-Case Environments (Core Engine Stress)
- [x] **Test 1: `site-l-extreme-legacy`** (4-Level Table Nesting, Duplicate Form IDs, Deprecated Tags) -> Completed & Audited in `qa-result.md`.
- [ ] **Test 2: `site-m-extreme-events`** (Inline `onclick` redirects, `hrefOrOnclick`, `customFetch()`, XSS payloads, QA console)
- [ ] **Test 3: `site-n-extreme-layout`** (Inline CSS `!important`, Async DOM mutations, Shadow DOM subtree, responsive media grid)

### Phase 2: Real-World Mocked Domain Environments
- [ ] **Test 4: `site-f-wiki`** (ArchWiki Navigation & Dark Mode)
- [ ] **Test 5: `site-k-safebooru`** (Safebooru Tag Sidebar, Image Grid, Header Navigation)
- [ ] **Test 6: `site-i-github`** (GitHub Code View, Issue Lists & Modern Headers)
- [ ] **Test 7: `site-j-stackoverflow`** (StackOverflow Question Threads & Answers)
- [ ] **Test 8: `site-g-gallery`** (Media Gallery Grid & Modal Viewers)
- [ ] **Test 9: `site-h-classifieds`** (Classified Ads Directory & Filtering)

---

## 3. Execution Schedule & Workflow

For each environment in the matrix:
1. Focus 100% on the single environment.
2. Run `subagent_cli.py` on the environment snapshot.
3. Run `spm compile` and `spm apply`.
4. Run `npm run test:e2e` to verify Playwright visual snapshot.
5. Record findings, component gaps, and subagent friction in `qa-result.md`.
6. Commit changes to git and move to the next environment.
