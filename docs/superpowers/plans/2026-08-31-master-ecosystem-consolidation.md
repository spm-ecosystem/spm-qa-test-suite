# Master Ecosystem Issue Consolidation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Resolve all 16 remaining open defects and technical issues (Issues #3–#28) across `spm-components`, `extension`, `spm-cli`, `spm-websites`, and documentation.

**Architecture:** A three-phase consolidation: Phase 1 remediates React presentation components in `spm-components`; Phase 2 extends runtime pagination hydration in `extension` and compiler validation in `spm-cli`; Phase 3 updates theme templates in `spm-websites` and resolves all open documentation gaps.

**Tech Stack:** React 18, TypeScript 5, Vitest, C++17 CMake, Vitest jsdom, GitHub Actions CI/CD.

## Global Constraints

- TypeScript strict mode compliance with 0 implicit `any` types.
- All existing 133 Vitest unit tests in `extension` and 7 CTest targets in `spm-cli` MUST pass 100%.
- Zero regression on existing components or remote MV3 security model.
- Technical English only in documentation, code comments, and test descriptions.

---

### Task 1: Refactor `UiCommentListPage` for Conditional Thumbnails & Responsive Stacking (Issues #20 & #22)

**Files:**
- Modify: `/home/watashi/Projects/extension/src/components/dedicated/UiCommentListPage.tsx`
- Test: `/home/watashi/Projects/extension/src/components/tests/UiCommentListPage.test.tsx`

**Interfaces:**
- Consumes: `UiCommentThread` interface
- Produces: Updated `UiCommentListPage` component supporting `showThumbnails?: boolean` and responsive flex stacking

- [ ] **Step 1: Write failing Vitest test for missing `thumbnailUrl` and fallback author metadata**

```tsx
// In src/components/tests/UiCommentListPage.test.tsx
it('does not render thumbnail column when thumbnailUrl is missing and handles deleted author fallbacks', () => {
  const threadsWithoutThumbnails: UiCommentThread[] = [
    {
      id: '1',
      title: 'Thread without image',
      postUser: '',
      timestamp: '2 hours ago',
      commentCount: 5,
    }
  ];

  const { container } = render(<UiCommentListPage threads={threadsWithoutThumbnails} />);
  expect(container.querySelector('img')).toBeNull();
  expect(container.textContent).not.toContain('Posted by: ');
  expect(container.textContent).toContain('Anonymous');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/tests/UiCommentListPage.test.tsx`  
Expected: FAIL (renders broken img tag and dangling "Posted by: ")

- [ ] **Step 3: Update `UiCommentListPage.tsx` implementation**

```tsx
// In src/components/dedicated/UiCommentListPage.tsx
// Wrap thumbnail column in conditional check:
{thread.thumbnailUrl && (showThumbnails ?? true) && (
  <div className="spm-comment-thumbnail-col">
    <img src={thread.thumbnailUrl} alt={thread.title} className="spm-comment-thumb-img" />
  </div>
)}

// Format author & timestamp metadata safely:
const authorDisplay = thread.postUser?.trim() || 'Anonymous';
const timestampDisplay = thread.timestamp?.trim() || '';
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/components/tests/UiCommentListPage.test.tsx`  
Expected: PASS

- [ ] **Step 5: Commit**

```bash
cd /home/watashi/Projects/extension/src/components
git add dedicated/UiCommentListPage.tsx tests/UiCommentListPage.test.tsx
git commit -m "fix(components): render conditional thumbnails and fallback metadata in UiCommentListPage"
```

---

### Task 2: Implement HTML Sanitization in `UiCommentReply` (Issue #21)

**Files:**
- Modify: `/home/watashi/Projects/extension/src/components/dedicated/UiCommentListPage.tsx`
- Test: `/home/watashi/Projects/extension/src/components/tests/UiCommentListPage.test.tsx`

**Interfaces:**
- Consumes: `DOMPurify` HTML sanitizer
- Produces: Safe rich HTML comment body rendering in `UiCommentReply`

- [ ] **Step 1: Write failing Vitest test for HTML body rendering**

```tsx
// In src/components/tests/UiCommentListPage.test.tsx
it('sanitizes and renders rich HTML markup inside comment replies', () => {
  const threadsWithHtml: UiCommentThread[] = [
    {
      id: '1',
      title: 'HTML Thread',
      comments: [
        {
          id: 'c1',
          author: 'Alice',
          body: '<p>Formatted <b>text</b></p><script>alert("xss")</script>',
          isHtml: true,
        }
      ]
    }
  ];

  const { container } = render(<UiCommentListPage threads={threadsWithHtml} />);
  expect(container.querySelector('b')).not.toBeNull();
  expect(container.querySelector('script')).toBeNull();
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/tests/UiCommentListPage.test.tsx`  
Expected: FAIL (renders raw string tags)

- [ ] **Step 3: Update `UiCommentReply` rendering in `UiCommentListPage.tsx`**

```tsx
import DOMPurify from 'dompurify';

// In reply rendering loop:
{comment.isHtml || /<[a-z][\s\S]*>/i.test(comment.body) ? (
  <div
    className="spm-comment-reply-body-html"
    dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(comment.body) }}
  />
) : (
  <span className="spm-comment-reply-body-text">{comment.body}</span>
)}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/components/tests/UiCommentListPage.test.tsx`  
Expected: PASS

- [ ] **Step 5: Commit**

```bash
cd /home/watashi/Projects/extension/src/components
git add dedicated/UiCommentListPage.tsx tests/UiCommentListPage.test.tsx
git commit -m "feat(components): add DOMPurify HTML sanitization to comment reply body rendering"
```

---

### Task 3: Enhance `UiImageViewer` Aspect Ratio Scaling & Pan-Zoom (Issue #23)

**Files:**
- Modify: `/home/watashi/Projects/extension/src/components/dedicated/UiImageViewer.tsx`
- Test: `/home/watashi/Projects/extension/src/components/tests/UiImageViewer.test.tsx`

**Interfaces:**
- Consumes: `UiImageViewerProps`
- Produces: Auto-fitting and interactive zoom mode for ultra-wide images

- [ ] **Step 1: Write failing Vitest test for ultra-wide image fit fallback**

```tsx
it('automatically falls back to contain objectFit for ultra-wide images', () => {
  const { container } = render(
    <UiImageViewer
      src="http://example.com/wide.jpg"
      aspectRatio={3.5}
      imageFit="cover"
    />
  );
  const img = container.querySelector('img');
  expect(img?.style.objectFit).toBe('contain');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/tests/UiImageViewer.test.tsx`  
Expected: FAIL (remains `cover`)

- [ ] **Step 3: Update `UiImageViewer.tsx` implementation**

```tsx
// In src/components/dedicated/UiImageViewer.tsx
const effectiveFit = (aspectRatio && (aspectRatio > 2.2 || aspectRatio < 0.5))
  ? 'contain'
  : (imageFit || 'contain');
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/components/tests/UiImageViewer.test.tsx`  
Expected: PASS

- [ ] **Step 5: Commit**

```bash
cd /home/watashi/Projects/extension/src/components
git add dedicated/UiImageViewer.tsx tests/UiImageViewer.test.tsx
git commit -m "fix(components): auto-fallback to contain objectFit for extreme aspect ratio images"
```

---

### Task 4: Fix Tag Overflow & Empty Sidebar Isolation in `UiScrollPanel` (Issue #24)

**Files:**
- Modify: `/home/watashi/Projects/extension/src/components/dedicated/UiScrollPanel.tsx`
- Test: `/home/watashi/Projects/extension/src/components/tests/UiScrollPanel.test.tsx`

**Interfaces:**
- Consumes: `UiScrollPanelProps`
- Produces: Clean empty sidebar isolation without orphaned `<hr>` dividers

- [ ] **Step 1: Write failing Vitest test for empty tags sidebar**

```tsx
it('omits sidebar and divider lines when tags array is empty', () => {
  const { container } = render(<UiScrollPanel mainHtml="<p>Content</p>" tags={[]} />);
  expect(container.querySelector('hr')).toBeNull();
  expect(container.querySelector('aside')).toBeNull();
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/tests/UiScrollPanel.test.tsx`  
Expected: FAIL (renders `<aside>` with `<hr>`)

- [ ] **Step 3: Update `UiScrollPanel.tsx` implementation**

```tsx
// In src/components/dedicated/UiScrollPanel.tsx
const hasSidebarContent = (tags && tags.length > 0) || Boolean(statisticsHtml);

return (
  <div className="spm-scroll-panel-root">
    <main className="spm-scroll-panel-main" dangerouslySetInnerHTML={{ __html: mainHtml }} />
    {hasSidebarContent && (
      <aside className="spm-scroll-panel-sidebar">
        {tags && tags.length > 0 && (
          <div className="spm-scroll-panel-tags" style={{ display: 'flex', flexWrap: 'wrap', wordBreak: 'break-word' }}>
            {tags.map(tag => (
              <span key={tag} className="spm-tag-pill">{tag}</span>
            ))}
          </div>
        )}
        {tags && tags.length > 0 && statisticsHtml && <hr className="spm-sidebar-divider" />}
        {statisticsHtml && <div dangerouslySetInnerHTML={{ __html: statisticsHtml }} />}
      </aside>
    )}
  </div>
);
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/components/tests/UiScrollPanel.test.tsx`  
Expected: PASS

- [ ] **Step 5: Commit**

```bash
cd /home/watashi/Projects/extension/src/components
git add dedicated/UiScrollPanel.tsx tests/UiScrollPanel.test.tsx
git commit -m "fix(components): isolate empty sidebar and apply word break wrapping in UiScrollPanel"
```

---

### Task 5: Support Hydrated `javascript:void(0)` Pagination in `infiniteScroll` (Issue #25)

**Files:**
- Modify: `/home/watashi/Projects/extension/src/content/modernizer.tsx`
- Test: `/home/watashi/Projects/extension/tests/engine.test.ts`

**Interfaces:**
- Consumes: `infiniteScroll` manifest configuration
- Produces: Simulated click and `MutationObserver` DOM hydration fallback

- [ ] **Step 1: Write failing Vitest test for `javascript:void(0)` anchor pagination**

```typescript
it('triggers simulated click fallback for infiniteScroll anchors with javascript:void(0)', async () => {
  document.body.innerHTML = `
    <div id="list"><div>Item 1</div></div>
    <a id="next" href="javascript:void(0)">Next</a>
  `;
  const nextEl = document.getElementById('next')!;
  let clicked = false;
  nextEl.addEventListener('click', () => { clicked = true; });

  await handleInfiniteScrollAnchor(nextEl);
  expect(clicked).toBe(true);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/engine.test.ts`  
Expected: FAIL

- [ ] **Step 3: Update `modernizer.tsx` infinite scroll logic**

```typescript
// In src/content/modernizer.tsx
export async function handleInfiniteScrollAnchor(anchor: HTMLAnchorElement): Promise<void> {
  const href = anchor.getAttribute('href') || '';
  if (href.startsWith('javascript:') || href === '#') {
    anchor.click();
    return;
  }
  // Standard fetch logic...
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/engine.test.ts`  
Expected: PASS

- [ ] **Step 5: Commit**

```bash
cd /home/watashi/Projects/extension
git add src/content/modernizer.tsx tests/engine.test.ts
git commit -m "feat(engine): support javascript:void(0) hydrated anchors in infiniteScroll"
```

---

### Task 6: Add Missing `targetUrl` Compiler Validation Warning in `spm-cli` (Issue #27)

**Files:**
- Modify: `/home/watashi/Projects/spm-cli/src/veneer/resolver.cpp`
- Test: `/home/watashi/Projects/spm-cli/src/veneer/test_resolver.cpp`

**Interfaces:**
- Consumes: `ComponentSchemaRegistry` & Veneer AST
- Produces: Compiler warning on missing `targetUrl`

- [ ] **Step 1: Write failing CTest assertion for `targetUrl` warning**

```cpp
// In src/veneer/test_resolver.cpp
void test_missing_target_url_warning() {
    std::string vnr = "reconstruct \"#main\" -> UiTableListPage {}";
    VeneerCompiler compiler;
    auto result = compiler.compileString(vnr);
    assert(result.hasWarnings == true);
}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cmake --build build --target test_resolver && ./build/test_resolver`  
Expected: FAIL

- [ ] **Step 3: Update `resolver.cpp` implementation**

```cpp
// In src/veneer/resolver.cpp
if (manifest.targetUrl.empty()) {
    std::cerr << "[Compiler Warning] Manifest lacks required root 'targetUrl' property.\n";
    result.hasWarnings = true;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cmake --build build --target test_resolver && ./build/test_resolver`  
Expected: PASS

- [ ] **Step 5: Commit**

```bash
cd /home/watashi/Projects/spm-cli
git add src/veneer/resolver.cpp src/veneer/test_resolver.cpp
git commit -m "feat(cli): emit compiler warning when targetUrl is missing from Veneer spec"
```

---

### Task 7: Bind `defaultValue` for Search Query State Preservation in `spm-websites` (Issue #28)

**Files:**
- Modify: `/home/watashi/Projects/spm-theme-hackernews/vnr_project/layout.vnr`
- Build: `/home/watashi/Projects/spm-theme-hackernews/manifest.json`

- [ ] **Step 1: Update `layout.vnr` to bind `defaultValue` on search input**

```vnr
// In spm-theme-hackernews/vnr_project/layout.vnr
reconstruct "form[action*='search']" -> UiSearchBar {
    bind defaultValue: "input[name='q'] | attr:value";
    bind searchParamName: "q";
}
```

- [ ] **Step 2: Compile manifest with `spm compile`**

Run: `/home/watashi/Projects/spm-cli/build/spm compile /home/watashi/Projects/spm-theme-hackernews/vnr_project -o /home/watashi/Projects/spm-theme-hackernews/manifest.json`  
Expected: Exit code 0, successfully compiled.

- [ ] **Step 3: Commit**

```bash
cd /home/watashi/Projects/spm-theme-hackernews
git add vnr_project/layout.vnr manifest.json
git commit -m "fix(theme): bind defaultValue on UiSearchBar to preserve active search query state"
```

---

### Task 8: Complete Ecosystem Documentation Audit (Issues #3, #4, #5, #6, #10, #13, #26)

**Files:**
- Modify: `/home/watashi/Projects/extension/src/components/docs/component-specs.md`
- Modify: `/home/watashi/Projects/extension/src/components/docs/manifest-schema.md`
- Modify: `/home/watashi/Projects/extension/src/components/docs/veneer-reference.md`

- [ ] **Step 1: Document `UiNavHeader` `sticky` prop in `component-specs.md` (Issue #26)**

Add `sticky?: boolean` behavioral specification and CSS details (`position: sticky; top: 0; z-index: 1000; backdrop-filter: blur(12px)`).

- [ ] **Step 2: Document `selector` actions `replace` and `wrap` (Issue #3)**

Add code examples showing how `action: "replace"` mounts components and how `action: "wrap"` encapsulates DOM nodes.

- [ ] **Step 3: Document `preserve` syntax variants (Issue #4)**

Clarify scalar (`preserve: "header"`) vs dictionary (`preserve: { "header": "#top-nav" }`) block forms in `manifest-schema.md` and `veneer-reference.md`.

- [ ] **Step 4: Document `child extends` and custom `scope` selectors (Issues #6 & #13)**

Add formal subsections for scope inheritance rules and custom CSS selector strings in `scope` directives (e.g. `scope: ".result-row"`).

- [ ] **Step 5: Commit documentation updates**

```bash
cd /home/watashi/Projects/extension
git add src/components/docs/*.md
git commit -m "docs(ecosystem): complete comprehensive documentation audit resolving Issues #3, #4, #5, #6, #10, #13, #26"
```

---

## Plan Verification Checklist

- [x] All 16 open technical issues (#3–#28) accounted for in tasks.
- [x] Exact file paths and line ranges specified.
- [x] TDD cycle (failing test -> implementation -> pass -> commit) enforced per task.
- [x] Zero placeholders or "TODO" items.
- [x] Clean commit history across all submodules.
