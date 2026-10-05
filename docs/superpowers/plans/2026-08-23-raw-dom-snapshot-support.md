# Raw DOM Snapshot Support Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Expand QA environment presets to support both clean `page-snapshot.html` mock fixtures AND `raw-dom-snapshot.html` uncompressed production DOM snapshots, with dedicated Playwright E2E test variants for each fixture type.

**Architecture:** The `EnvironmentPreset` interface is extended with an optional `rawDomHtmlPath` field. The HTTP server in `modernizer.spec.ts` is updated to serve both fixture types on distinct routes (`/route` for clean, `/route/raw` for raw). A new `raw-dom.spec.ts` Playwright test file registers one test per preset that provides a raw DOM fixture, exercising the modernizer against dirty, real-world HTML. Five selected environments each get a `fixtures/raw-dom-snapshot.html` authored to simulate realistic dirty DOM (nested tables, inline scripts, lazy-loading attrs, tracking pixels, legacy class soup).

**Tech Stack:** TypeScript, Playwright, Node.js HTTP server, HTML fixtures (hand-authored realistic dirty DOM — no real scraping of live sites)

## Global Constraints

- TypeScript strict mode — no `any` unless unavoidable
- All new fixtures are static hand-authored HTML — no live network calls in tests
- Raw DOM snapshots must be self-contained (no external CDN/script dependencies)
- No changes to `e2e/helpers.ts` `runEnvironmentE2ETest()` signature — new helpers are additive
- No changes to existing preset `.ts` files that would break current tests
- All existing 5 Playwright tests must continue to pass after every task
- Node ≥ 18, Playwright ≥ 1.40
- Commit after every task

---

## File Map

| File | Action | Task |
|---|---|---|
| `e2e/helpers.ts` | Modify: add `rawDomHtmlPath?` to `EnvironmentPreset` + `runRawDomE2ETest()` | Task 1 |
| `e2e/raw-dom.spec.ts` | Create: new Playwright test file for raw DOM variants | Task 1 |
| `e2e/presets.ts` | Modify: export `RAW_DOM_PRESETS` array | Task 2 |
| `environments/site-k-safebooru/fixtures/raw-dom-snapshot.html` | Create | Task 2 |
| `environments/site-f-wiki/fixtures/raw-dom-snapshot.html` | Create | Task 2 |
| `environments/site-l-extreme-legacy/fixtures/raw-dom-snapshot.html` | Create | Task 3 |
| `environments/site-m-extreme-events/fixtures/raw-dom-snapshot.html` | Create | Task 3 |
| `environments/site-n-extreme-layout/fixtures/raw-dom-snapshot.html` | Create | Task 3 |
| `environments/site-k-safebooru/preset.ts` | Modify: add `rawDomHtmlPath` | Task 4 |
| `environments/site-f-wiki/preset.ts` | Modify: add `rawDomHtmlPath` | Task 4 |
| `environments/site-l-extreme-legacy/preset.ts` | Modify: add `rawDomHtmlPath` | Task 4 |
| `environments/site-m-extreme-events/preset.ts` | Modify: add `rawDomHtmlPath` | Task 4 |
| `environments/site-n-extreme-layout/preset.ts` | Modify: add `rawDomHtmlPath` | Task 4 |
| `modernizer.spec.ts` | Modify: serve raw DOM on `/route/raw` | Task 4 |

---

## Task 1: Extend `EnvironmentPreset` Interface + `raw-dom.spec.ts` Scaffold

**Files:**
- Modify: `e2e/helpers.ts`
- Create: `e2e/raw-dom.spec.ts`

**Interfaces:**
- Produces: `EnvironmentPreset.rawDomHtmlPath?: string` — optional path to raw DOM fixture
- Produces: `runRawDomE2ETest(preset: EnvironmentPreset): Promise<void>` — same flow as `runEnvironmentE2ETest` but navigates to `/route/raw`

- [ ] **Step 1: Add `rawDomHtmlPath` to `EnvironmentPreset` in `e2e/helpers.ts`**

Add one optional field to the existing interface (do not change anything else):

```typescript
export interface EnvironmentPreset {
  id: string;
  name: string;
  route: string;
  fixtureHtmlPath?: string;
  rawDomHtmlPath?: string;            // ← ADD THIS LINE
  manifestPath?: string;
  manifestObj?: object;
  customCss?: string;
  highlightSelector?: string;
  annotationText?: string;
  snapshotName: string;
  assertions?: (page: Page) => Promise<void>;
}
```

- [ ] **Step 2: Add `runRawDomE2ETest()` helper to `e2e/helpers.ts`**

Append the following function at the bottom of `e2e/helpers.ts` (after the existing `runEnvironmentE2ETest`):

```typescript
/**
 * Raw DOM variant runner — same flow as runEnvironmentE2ETest but navigates
 * to the /route/raw endpoint which serves rawDomHtmlPath fixture.
 */
export async function runRawDomE2ETest(preset: EnvironmentPreset) {
  if (!preset.rawDomHtmlPath) {
    throw new Error(`[Raw DOM Runner] preset '${preset.id}' has no rawDomHtmlPath defined`);
  }

  const pathToExtension = process.env.EXTENSION_DIST_PATH || path.resolve(__dirname, '../../extension/dist');

  const context = await chromium.launchPersistentContext('', {
    headless: false,
    args: [
      `--headless=new`,
      `--disable-extensions-except=${pathToExtension}`,
      `--load-extension=${pathToExtension}`,
    ],
  });

  try {
    const page = await context.newPage();

    await page.goto('http://localhost:8080/');
    await page.waitForSelector('html[data-spm-extension-id]', { timeout: 10000 });
    const extensionId = await page.evaluate(() =>
      document.documentElement.getAttribute('data-spm-extension-id') || ''
    );

    if (!extensionId) {
      throw new Error(`[Raw DOM Runner] Could not detect loaded SPM extension ID for preset '${preset.name}'`);
    }

    let manifestData = preset.manifestObj;
    if (!manifestData && preset.manifestPath) {
      manifestData = JSON.parse(fs.readFileSync(preset.manifestPath, 'utf8'));
    }
    if (!manifestData) {
      throw new Error(`[Raw DOM Runner] No valid manifest provided for preset '${preset.name}'`);
    }

    const settingsPage = `chrome-extension://${extensionId}/index.html`;
    await page.goto(settingsPage);
    await page.evaluate(async ({ manifest, css }) => {
      const domain = 'localhost';
      await new Promise<void>((resolve) => {
        chrome.storage.local.set({
          spm_global_enabled: true,
          spm_dev_mode: { [domain]: true },
          [`dev-draft-manifest:${domain}`]: JSON.stringify(manifest),
          [`dev-draft-css:${domain}`]: css || ''
        }, () => resolve());
      });
    }, { manifest: manifestData, css: preset.customCss });

    // Navigate to the /raw variant route
    await page.goto(`http://localhost:8080${preset.route}/raw`);
    await page.waitForTimeout(2000);

    if (preset.assertions) {
      await preset.assertions(page);
    }

    if (preset.highlightSelector) {
      await annotateAndScreenshot(
        page,
        preset.highlightSelector,
        `[RAW DOM] ${preset.annotationText || preset.name}`,
        `${preset.snapshotName}_raw`
      );
    }

    console.log(`[Raw DOM Runner] Successfully completed raw DOM test: ${preset.name}`);
  } finally {
    await context.close();
  }
}
```

- [ ] **Step 3: Create `e2e/raw-dom.spec.ts`**

```typescript
import { test } from '@playwright/test';
import http from 'http';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { runRawDomE2ETest } from './helpers';
import { RAW_DOM_PRESETS } from './presets';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

test.describe('SPM Extension E2E Raw DOM Modernization Flow', () => {
  let server: http.Server;

  test.beforeAll(() => {
    server = http.createServer((req, res) => {
      // Raw DOM variants are served at /route/raw
      const rawPreset = RAW_DOM_PRESETS.find(p => req.url === `${p.route}/raw`);
      if (rawPreset?.rawDomHtmlPath && fs.existsSync(rawPreset.rawDomHtmlPath)) {
        const rawHtml = fs.readFileSync(rawPreset.rawDomHtmlPath, 'utf8');
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(rawHtml);
        return;
      }
      // Root route still needed for extension ID detection
      const cleanPreset = RAW_DOM_PRESETS.find(p => p.route === req.url);
      if (cleanPreset?.fixtureHtmlPath && fs.existsSync(cleanPreset.fixtureHtmlPath)) {
        const cleanHtml = fs.readFileSync(cleanPreset.fixtureHtmlPath, 'utf8');
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(cleanHtml);
        return;
      }
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end('<html><head></head><body>Blank page</body></html>');
    });
    server.listen(8081);
    console.log('[Raw DOM Server] Running at http://localhost:8081');
  });

  test.afterAll(() => {
    server.close();
    console.log('[Raw DOM Server] Stopped');
  });

  for (const preset of RAW_DOM_PRESETS) {
    test(`[RAW] [${preset.id}] ${preset.name}`, async () => {
      await runRawDomE2ETest(preset);
    });
  }
});
```

> **Note:** `raw-dom.spec.ts` uses port **8081** to avoid conflict with `modernizer.spec.ts` on 8080 when both run in the same CI session.

- [ ] **Step 4: Verify TypeScript compiles with no errors**

```bash
npx tsc --noEmit
```

Expected: no errors. If `RAW_DOM_PRESETS` is missing from `presets.ts`, that's expected — Task 2 adds it. Comment it out temporarily or add a stub:

```typescript
// In e2e/presets.ts — temporary stub until Task 2
export const RAW_DOM_PRESETS: EnvironmentPreset[] = [];
```

- [ ] **Step 5: Commit**

```bash
git add e2e/helpers.ts e2e/raw-dom.spec.ts e2e/presets.ts
git commit -m "feat(qa): extend EnvironmentPreset with rawDomHtmlPath + add raw-dom.spec.ts scaffold"
```

---

## Task 2: Raw DOM Fixtures for `site-k-safebooru` + `site-f-wiki`

**Files:**
- Create: `environments/site-k-safebooru/fixtures/raw-dom-snapshot.html`
- Create: `environments/site-f-wiki/fixtures/raw-dom-snapshot.html`

**Interfaces:**
- Consumes: Nothing from Task 1 at runtime — just HTML files on disk
- The raw DOM HTML must: contain the same key selectors as the clean fixture AND introduce dirty DOM noise (inline scripts, nested tables, legacy class soup, `style=""` attrs, tracking pixels, lazy-load `data-src`, unclosed elements corrected by browser parser)

- [ ] **Step 1: Create `environments/site-k-safebooru/fixtures/raw-dom-snapshot.html`**

This simulates a Safebooru-style page DOM as it would be scraped live — with inline scripts, legacy class soup, ad containers, tracking pixels, nested tables, lazy-loading, and an unclosed `<div>` that the browser auto-closes:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <title>Safebooru - Anime Image Board</title>
  <!-- Legacy IE shim, real sites still have these -->
  <!--[if lt IE 9]><script src="/ie-shim.js"></script><![endif]-->
  <style type="text/css">
    body{margin:0;padding:0;background:#f5f5f5;font-family:Verdana,sans-serif;font-size:12px}
    #header{background:#336699;color:#fff;padding:8px 12px}
    #tag-sidebar{float:left;width:150px;padding:4px}
    #post-list{margin-left:160px}
    span.thumb{display:inline-block;margin:3px;border:2px solid #ccc}
    span.thumb a img{display:block}
    #paginator{clear:both;text-align:center;padding:8px}
  </style>
</head>
<body>
<!-- Real sites inline tracking noise before any meaningful DOM -->
<script type="text/javascript">
  var _gaq=_gaq||[];
  _gaq.push(['_setAccount','UA-XXXXXX-1']);
</script>
<noscript><img src="https://tracking.example.com/pixel.gif" width="1" height="1" alt="" /></noscript>

<div id="header">
  <table border="0" cellpadding="0" cellspacing="0" width="100%">
    <tr>
      <td class="header-logo">
        <a href="/"><img src="/images/header_logo.png" alt="Safebooru" border="0" /></a>
      </td>
      <td class="header-search" align="right">
        <form id="searchform" action="/index.php" method="get">
          <input type="hidden" name="page" value="post" />
          <input type="hidden" name="s" value="list" />
          <input type="text" name="tags" value="" size="40" style="font-size:12px" />
          <input type="submit" value="Search" style="font-size:11px" />
        </form>
      </td>
    </tr>
  </table>
</div>

<!-- Ad container — common in legacy image boards -->
<div id="ad-top" style="text-align:center;padding:4px;min-height:90px">
  <script type="text/javascript">/* ad code */</script>
</div>

<div id="content">
  <!-- Legacy nested table layout -->
  <table id="layout-table" border="0" cellpadding="4" cellspacing="0" width="100%">
    <tr>
      <td id="tag-sidebar" valign="top" width="150">
        <div class="aside" id="tag-sidebar">
          <div class="tag-block" id="tags">
            <h5 class="tag-type-artist"><a>Artist</a></h5>
            <ul class="tag-list">
              <li class="tag-type-artist">
                <a href="?page=post&amp;s=list&amp;tags=nice_artist" class="tag-link">nice_artist</a>
                <span class="tag-count">42</span>
              </li>
              <li class="tag-type-character">
                <a href="?page=post&amp;s=list&amp;tags=hatsune_miku" class="tag-link">hatsune_miku</a>
                <span class="tag-count">15,392</span>
              </li>
              <li class="tag-type-copyright">
                <a href="?page=post&amp;s=list&amp;tags=vocaloid" class="tag-link">vocaloid</a>
                <span class="tag-count">28,441</span>
              </li>
            </ul>
          </div>
        </div>
      </td>
      <td id="main-content" valign="top">
        <div id="post-list">
          <div class="content">
            <!-- Real Safebooru uses span.thumb wrapping anchors wrapping lazy-loaded imgs -->
            <span class="thumb" id="p7281901">
              <a href="/index.php?page=post&s=view&id=7281901" id="p7281901">
                <img
                  class="preview"
                  src="//safebooru.org//thumbnails/5082/thumbnail_abc123.jpg?7281901"
                  data-src="//safebooru.org//thumbnails/5082/thumbnail_abc123_lazy.jpg"
                  title="vocaloid hatsune_miku 1girl"
                  alt="preview"
                  width="150" height="150"
                  loading="lazy"
                />
              </a>
            </span>
            <span class="thumb" id="p7281800">
              <a href="/index.php?page=post&s=view&id=7281800" id="p7281800">
                <img
                  class="preview"
                  src="//safebooru.org//thumbnails/5081/thumbnail_def456.jpg?7281800"
                  data-src="//safebooru.org//thumbnails/5081/thumbnail_def456_lazy.jpg"
                  title="original 1girl solo"
                  alt="preview"
                  width="150" height="112"
                  loading="lazy"
                />
              </a>
            </span>
            <span class="thumb" id="p7281650">
              <a href="/index.php?page=post&s=view&id=7281650" id="p7281650">
                <img
                  class="preview"
                  src="//safebooru.org//thumbnails/5080/thumbnail_ghi789.jpg?7281650"
                  title="kantai_collection shimakaze 1girl"
                  alt="preview"
                  width="150" height="206"
                  loading="lazy"
                />
              </a>
            </span>
          </div>
        </div>

        <!-- Dirty legacy pagination with table layout -->
        <div id="paginator">
          <table border="0" cellpadding="2" align="center">
            <tr>
              <td><a href="?page=post&amp;s=list&amp;tags=all&amp;pid=0">first</a></td>
              <td><a href="?page=post&amp;s=list&amp;tags=all&amp;pid=39960">&lt;&lt;</a></td>
              <td>1...</td>
              <td><b>1665</b></td>
              <td>...9999</td>
              <td><a href="?page=post&amp;s=list&amp;tags=all&amp;pid=40000">&gt;&gt;</a></td>
              <td><a href="?page=post&amp;s=list&amp;tags=all&amp;pid=399980">last</a></td>
            </tr>
          </table>
        </div>
      </td>
    </tr>
  </table>
</div>

<!-- Ad at bottom — common pattern -->
<div id="ad-bottom" style="clear:both;text-align:center;padding:4px">
  <script>/* bottom ad */</script>
</div>

<!-- Legacy footer table -->
<div id="footer">
  <table width="100%" cellpadding="2">
    <tr>
      <td align="center" style="font-size:10px;color:#666">
        &copy; 2025 Safebooru | <a href="/tos">Terms</a> | <a href="/contact">Contact</a>
      </td>
    </tr>
  </table>
</div>
</body>
</html>
```

- [ ] **Step 2: Create `environments/site-f-wiki/fixtures/raw-dom-snapshot.html`**

Simulates a MediaWiki-style page as scraped from a live ArchWiki page — with inline mw scripts, legacy sidebar layout, redundant IDs, ad injection, and `<script>` noise:

```html
<!DOCTYPE html>
<html class="client-nojs" lang="en" dir="ltr">
<head>
  <meta charset="UTF-8"/>
  <title>Pacman - ArchWiki</title>
  <meta name="generator" content="MediaWiki 1.40.1" />
  <link rel="stylesheet" href="/load.php?lang=en&modules=site.styles&only=styles&skin=vector" />
  <script>(window.RLQ=window.RLQ||[]).push(function(){mw.config.set({"wgPageName":"Pacman","wgTitle":"Pacman"});});</script>
  <style>
    #mw-head{position:fixed;top:0;left:0;right:0;z-index:5;height:2.8em;background:#fff}
    #mw-panel{position:fixed;left:0;top:2.8em;width:10em;overflow-x:hidden}
    #content{margin-left:10em;margin-top:2.8em;padding:1em}
  </style>
</head>
<body class="mediawiki ltr sitedir-ltr mw-hide-empty-elt ns-0 skin-vector">
<script>document.body.className="mediawiki ltr sitedir-ltr ns-0 skin-vector page-Pacman rootpage-Pacman";</script>

<div id="mw-page-base" class="noprint"></div>
<div id="mw-head-base" class="noprint"></div>

<div id="mw-navigation">
  <h2>Navigation</h2>
  <div id="mw-head">
    <div id="p-personal" role="navigation" aria-labelledby="p-personal-label">
      <h3 id="p-personal-label">Personal tools</h3>
      <ul>
        <li id="pt-login"><a href="/index.php?title=Special:UserLogin">Log in</a></li>
        <li id="pt-createaccount"><a href="/index.php?title=Special:CreateAccount">Create account</a></li>
      </ul>
    </div>
    <div id="left-navigation">
      <div id="p-namespaces" role="navigation" aria-labelledby="p-namespaces-label">
        <h3 id="p-namespaces-label">Namespaces</h3>
        <ul>
          <li id="ca-nstab-main" class="selected"><a href="/title/Pacman">Article</a></li>
          <li id="ca-talk"><a href="/index.php?title=Talk:Pacman">Talk</a></li>
        </ul>
      </div>
    </div>
    <div id="right-navigation">
      <div id="p-search" role="search">
        <form id="searchform" action="/index.php" method="get">
          <div id="simpleSearch">
            <input type="search" name="search" placeholder="Search ArchWiki" id="searchInput" autocomplete="off" />
            <input type="hidden" name="title" value="Special:Search" />
            <button type="submit" id="searchButton"><span>Search</span></button>
          </div>
        </form>
      </div>
    </div>
  </div>
</div>

<div id="mw-panel">
  <div class="portal" role="navigation" id="p-logo" aria-labelledby="p-logo-label">
    <a class="mw-wiki-logo" href="/title/Main_page" title="Visit the main page"></a>
  </div>
  <div class="portal" role="navigation" id="p-navigation" aria-labelledby="p-navigation-label">
    <h3 id="p-navigation-label">Navigation</h3>
    <div class="body">
      <ul>
        <li id="n-mainpage-description"><a href="/title/Main_page">Main page</a></li>
        <li id="n-Table-of-contents"><a href="/title/Table_of_contents">Table of contents</a></li>
        <li id="n-Getting-started"><a href="/title/Installation_guide">Getting started</a></li>
      </ul>
    </div>
  </div>
  <!-- Real wikis have many more portal divs here, with script-injected state -->
  <div class="portal" role="navigation" id="p-tb">
    <h3>Tools</h3>
    <div class="body">
      <ul>
        <li id="t-whatlinkshere"><a href="/index.php?title=Special:WhatLinksHere/Pacman">What links here</a></li>
        <li id="t-recentchangeslinked"><a href="/index.php?title=Special:RecentChangesLinked/Pacman">Related changes</a></li>
      </ul>
    </div>
  </div>
</div>

<div id="content" class="mw-body" role="main">
  <a id="top"></a>
  <div class="mw-indicators"></div>
  <h1 id="firstHeading" class="firstHeading mw-first-heading">Pacman</h1>
  <div id="bodyContent" class="vector-body">
    <div id="siteSub" class="noprint">From ArchWiki</div>
    <div id="contentSub" class="mw-content-ltr"></div>
    <div id="mw-content-text" class="mw-body-content">
      <div class="mw-parser-output">
        <div role="note" class="archwiki-template-box">
          <b>Related articles</b>
          <ul><li><a href="/title/Pacman/Tips_and_tricks">Pacman/Tips and tricks</a></li></ul>
        </div>
        <p><b>pacman</b> is the package manager for Arch Linux.</p>
        <div id="toc" class="toc">
          <div class="toctitle"><h2>Contents</h2></div>
          <ul>
            <li class="toclevel-1"><a href="#Usage"><span class="tocnumber">1</span> <span class="toctext">Usage</span></a></li>
          </ul>
        </div>
        <h2><span class="mw-headline" id="Usage">Usage</span></h2>
        <p>The general syntax is: <code>pacman &lt;operation&gt; [options] [packages]</code></p>
      </div>
    </div>
  </div>
</div>

<div id="footer" role="contentinfo">
  <ul id="footer-info">
    <li id="footer-info-lastmod">This page was last edited on 1 January 2024.</li>
  </ul>
  <ul id="footer-places">
    <li id="footer-places-privacy"><a href="/title/ArchWiki:Privacy_policy">Privacy policy</a></li>
    <li id="footer-places-about"><a href="/title/ArchWiki:About">About ArchWiki</a></li>
  </ul>
</div>

<script>(window.RLQ=window.RLQ||[]).push(function(){mw.loader.load(["site","mediawiki.page.ready"]);});</script>
</body>
</html>
```

- [ ] **Step 3: Verify files exist and are valid HTML**

```bash
# Quick sanity — both files must exist and have expected anchor selectors
grep -q 'id="post-list"' environments/site-k-safebooru/fixtures/raw-dom-snapshot.html && echo "safebooru: OK"
grep -q 'id="mw-navigation"' environments/site-f-wiki/fixtures/raw-dom-snapshot.html && echo "wiki: OK"
```

Expected output:
```
safebooru: OK
wiki: OK
```

- [ ] **Step 4: Commit**

```bash
git add environments/site-k-safebooru/fixtures/raw-dom-snapshot.html \
        environments/site-f-wiki/fixtures/raw-dom-snapshot.html
git commit -m "feat(qa): add raw DOM snapshots for site-k-safebooru and site-f-wiki"
```

---

## Task 3: Raw DOM Fixtures for Extreme Sites (`site-l`, `site-m`, `site-n`)

**Files:**
- Create: `environments/site-l-extreme-legacy/fixtures/raw-dom-snapshot.html`
- Create: `environments/site-m-extreme-events/fixtures/raw-dom-snapshot.html`
- Create: `environments/site-n-extreme-layout/fixtures/raw-dom-snapshot.html`

**Interfaces:**
- These three represent the "worst case" DOM environments the modernizer must survive
- `site-l` (extreme legacy): full `<table>`-based layout with `bgcolor`, `cellpadding`, `<font>` tags
- `site-m` (extreme events): ticket/event listing with inline `onclick` handlers, `javascript:` hrefs, base64-encoded tracking pixels
- `site-n` (extreme layout): CSS Grid + Flexbox page with deeply nested divs, `data-*` everywhere, multiple `<template>` tags, `<custom-element>` web components

- [ ] **Step 1: Create `environments/site-l-extreme-legacy/fixtures/raw-dom-snapshot.html`**

```html
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=iso-8859-1">
<title>Legacy Classifieds - Buy &amp; Sell</title>
</head>
<body bgcolor="#ffffff" text="#000000" link="#0000cc" vlink="#551a8b">
<table border="0" cellpadding="0" cellspacing="0" width="100%">
  <tr bgcolor="#336699">
    <td><font face="Arial" size="3" color="white"><b>Legacy Classifieds</b></font></td>
    <td align="right">
      <form name="searchform" id="searchform" method="get" action="/search.cgi">
        <input type="text" name="q" size="20">
        <input type="submit" value="Search">
      </form>
    </td>
  </tr>
</table>
<table border="0" cellpadding="3" cellspacing="1" bgcolor="#cccccc" width="100%">
  <tr bgcolor="#ffffff">
    <th width="50"><font face="Arial" size="2">ID</font></th>
    <th><font face="Arial" size="2">Title</font></th>
    <th width="100"><font face="Arial" size="2">Price</font></th>
    <th width="80"><font face="Arial" size="2">Date</font></th>
    <th width="100"><font face="Arial" size="2">Location</font></th>
  </tr>
  <tr class="listing-row" id="listing-10021" bgcolor="#f5f5f5">
    <td align="center"><font size="2">10021</font></td>
    <td><font size="2"><a href="/ad/10021">Sony 65&quot; 4K OLED TV - Excellent Condition</a></font></td>
    <td align="right"><font size="2" color="#cc0000"><b>R$ 5.499,00</b></font></td>
    <td><font size="2">Jan 15</font></td>
    <td><font size="2">São Paulo, SP</font></td>
  </tr>
  <tr class="listing-row" id="listing-10022" bgcolor="#ffffff">
    <td align="center"><font size="2">10022</font></td>
    <td><font size="2"><a href="/ad/10022">MacBook Pro 16&quot; M3 Pro - Sealed Box</a></font></td>
    <td align="right"><font size="2" color="#cc0000"><b>R$ 23.900,00</b></font></td>
    <td><font size="2">Jan 16</font></td>
    <td><font size="2">Rio de Janeiro, RJ</font></td>
  </tr>
  <tr class="listing-row" id="listing-10023" bgcolor="#f5f5f5">
    <td align="center"><font size="2">10023</font></td>
    <td><font size="2"><a href="/ad/10023">Nintendo Switch OLED - Bundle com jogos</a></font></td>
    <td align="right"><font size="2" color="#cc0000"><b>R$ 2.100,00</b></font></td>
    <td><font size="2">Jan 17</font></td>
    <td><font size="2">Curitiba, PR</font></td>
  </tr>
</table>
<table border="0" width="100%" cellpadding="4">
  <tr>
    <td align="center">
      <a href="/search?p=1">&lt;&lt; First</a> &nbsp;
      <a href="/search?p=4">Prev</a> &nbsp;
      Page <b>5</b> of 120 &nbsp;
      <a href="/search?p=6">Next</a> &nbsp;
      <a href="/search?p=120">Last &gt;&gt;</a>
    </td>
  </tr>
</table>
</body>
</html>
```

- [ ] **Step 2: Create `environments/site-m-extreme-events/fixtures/raw-dom-snapshot.html`**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>EventsNow - Find Events Near You</title>
  <script>
    // Inline tracking — blocks parser momentarily on real pages
    !function(f,b,e,v){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;}(window,document,'script');
    fbq('init','123456789');
    fbq('track','PageView');
  </script>
  <noscript>
    <img height="1" width="1" style="display:none" src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" />
  </noscript>
</head>
<body>
  <header id="site-header" class="header sticky-header" data-sticky="true">
    <div class="header__inner container">
      <a href="/" class="header__logo" aria-label="EventsNow Home">
        <img src="/assets/logo.svg" alt="EventsNow" width="120" height="40" />
      </a>
      <nav class="header__nav" role="navigation" aria-label="Main navigation">
        <a href="/events" class="nav-link">Browse</a>
        <a href="/organizers" class="nav-link">Organizers</a>
        <a href="/create" class="nav-link nav-link--cta">Create Event</a>
      </nav>
    </div>
  </header>

  <main id="events-main" role="main">
    <div class="events-grid" id="events-container" data-view="grid" data-page="1" data-total="4892">
      <!-- Event card with inline onclick and javascript: href (legacy tracking) -->
      <article class="event-card" id="event-88291" data-event-id="88291" data-category="music"
               onclick="trackClick('88291','music','card_body')">
        <div class="event-card__image-wrap">
          <a href="javascript:void(0)" onclick="navigateEvent('/events/88291/rock-festival-sp-2024');return false;"
             class="event-card__img-link" tabindex="0">
            <img
              class="event-card__image lazyload"
              data-src="/events/88291/cover.jpg"
              src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 200'%3E%3C/svg%3E"
              alt="Rock Festival SP 2024"
              loading="lazy"
              width="400" height="200"
            />
          </a>
          <span class="event-card__category-badge" data-category="music">Music</span>
        </div>
        <div class="event-card__body">
          <h3 class="event-card__title">
            <a href="/events/88291/rock-festival-sp-2024" class="event-card__title-link">
              Rock Festival SP 2024
            </a>
          </h3>
          <div class="event-card__meta">
            <time class="event-card__date" datetime="2024-03-15T20:00:00-03:00">
              Sat, Mar 15 · 8:00 PM
            </time>
            <span class="event-card__location">Allianz Parque · São Paulo, SP</span>
          </div>
          <div class="event-card__price-row">
            <span class="event-card__price">R$ 280,00</span>
            <span class="event-card__tickets-left event-card__tickets-left--few">12 left</span>
          </div>
        </div>
      </article>

      <article class="event-card" id="event-88350" data-event-id="88350" data-category="tech"
               onclick="trackClick('88350','tech','card_body')">
        <div class="event-card__image-wrap">
          <a href="/events/88350/campus-party-2024" class="event-card__img-link">
            <img
              class="event-card__image lazyload"
              data-src="/events/88350/cover.jpg"
              src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 200'%3E%3C/svg%3E"
              alt="Campus Party Brasil 2024"
              loading="lazy"
              width="400" height="200"
            />
          </a>
          <span class="event-card__category-badge" data-category="tech">Tech</span>
        </div>
        <div class="event-card__body">
          <h3 class="event-card__title">
            <a href="/events/88350/campus-party-2024" class="event-card__title-link">
              Campus Party Brasil 2024
            </a>
          </h3>
          <div class="event-card__meta">
            <time class="event-card__date" datetime="2024-02-06T09:00:00-03:00">
              Tue, Feb 6 · 9:00 AM
            </time>
            <span class="event-card__location">Expo Center Norte · São Paulo, SP</span>
          </div>
          <div class="event-card__price-row">
            <span class="event-card__price">R$ 120,00</span>
            <span class="event-card__tickets-left">480 left</span>
          </div>
        </div>
      </article>
    </div>
  </main>

  <footer id="site-footer" class="footer">
    <div class="footer__inner container">
      <p class="footer__copy">&copy; 2024 EventsNow. All rights reserved.</p>
    </div>
  </footer>
</body>
</html>
```

- [ ] **Step 3: Create `environments/site-n-extreme-layout/fixtures/raw-dom-snapshot.html`**

```html
<!DOCTYPE html>
<html lang="en" data-theme="dark" data-layout="split">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>ModernStack - Developer Platform</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" crossorigin />
  <script type="module" src="/app.js"></script>
  <style>
    :root{--color-bg:#0d1117;--color-surface:#161b22;--color-border:#30363d;--color-text:#c9d1d9}
    *,*::before,*::after{box-sizing:border-box}
    body{margin:0;background:var(--color-bg);color:var(--color-text);font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
    #app-shell{display:grid;grid-template-areas:"sidebar main";grid-template-columns:240px 1fr;min-height:100vh}
  </style>
</head>
<body>
  <!-- Custom element (web component) wrapping nav — real modern apps do this -->
  <app-shell id="app-shell">
    <nav id="app-sidebar" slot="sidebar" aria-label="Primary navigation"
         class="sidebar" data-collapsed="false" data-version="2.1">
      <div class="sidebar__brand">
        <img src="/logo.svg" alt="ModernStack" class="sidebar__logo" width="32" height="32" />
        <span class="sidebar__brand-name">ModernStack</span>
      </div>
      <ul class="sidebar__nav" role="list">
        <li class="sidebar__nav-item sidebar__nav-item--active">
          <a href="/dashboard" class="sidebar__nav-link" aria-current="page"
             data-nav-key="dashboard">
            <svg class="sidebar__nav-icon" aria-hidden="true" width="16" height="16"><use href="#icon-dashboard"/></svg>
            Dashboard
          </a>
        </li>
        <li class="sidebar__nav-item">
          <a href="/projects" class="sidebar__nav-link" data-nav-key="projects">
            <svg class="sidebar__nav-icon" aria-hidden="true" width="16" height="16"><use href="#icon-folder"/></svg>
            Projects
          </a>
        </li>
        <li class="sidebar__nav-item">
          <a href="/deployments" class="sidebar__nav-link" data-nav-key="deployments">
            <svg class="sidebar__nav-icon" aria-hidden="true" width="16" height="16"><use href="#icon-deploy"/></svg>
            Deployments
          </a>
        </li>
        <li class="sidebar__nav-item">
          <a href="/settings" class="sidebar__nav-link" data-nav-key="settings">
            <svg class="sidebar__nav-icon" aria-hidden="true" width="16" height="16"><use href="#icon-settings"/></svg>
            Settings
          </a>
        </li>
      </ul>
    </nav>

    <main id="main-content" slot="main" class="main-content" role="main">
      <header class="page-header" id="page-header">
        <div class="page-header__inner">
          <div class="page-header__title-block">
            <h1 class="page-header__title">Projects</h1>
            <p class="page-header__subtitle">Manage your repositories and deployments</p>
          </div>
          <div class="page-header__actions">
            <button class="btn btn--primary" type="button" id="new-project-btn"
                    data-action="open-modal" data-modal="create-project">
              New Project
            </button>
          </div>
        </div>
      </header>

      <section class="projects-section" id="projects-list" aria-label="Projects"
               data-loaded="true" data-count="3">
        <div class="project-card" id="project-spm-cli" data-project-id="proj_abc123"
             data-status="active" data-framework="cmake">
          <div class="project-card__header">
            <div class="project-card__meta">
              <img src="/avatars/org/spm-ecosystem.png" alt="spm-ecosystem"
                   class="project-card__org-avatar" width="20" height="20" />
              <a href="/spm-ecosystem" class="project-card__org-link">spm-ecosystem</a>
              <span class="project-card__separator" aria-hidden="true">/</span>
              <a href="/spm-ecosystem/spm-cli" class="project-card__name-link">spm-cli</a>
            </div>
            <span class="project-card__status-badge project-card__status-badge--active"
                  data-status="active">Active</span>
          </div>
          <div class="project-card__body">
            <p class="project-card__description">C++17 native Veneer Spec compiler and runtime</p>
            <div class="project-card__stats">
              <span class="project-stat" data-stat="deployments">
                <svg aria-hidden="true" width="12" height="12"><use href="#icon-deploy"/></svg>
                14 deployments
              </span>
              <span class="project-stat" data-stat="last-deploy">
                Last deploy: <time datetime="2024-01-18T12:00:00Z">2 hours ago</time>
              </span>
            </div>
          </div>
        </div>

        <div class="project-card" id="project-spm-components" data-project-id="proj_def456"
             data-status="active" data-framework="react">
          <div class="project-card__header">
            <div class="project-card__meta">
              <img src="/avatars/org/spm-ecosystem.png" alt="spm-ecosystem"
                   class="project-card__org-avatar" width="20" height="20" />
              <a href="/spm-ecosystem" class="project-card__org-link">spm-ecosystem</a>
              <span class="project-card__separator" aria-hidden="true">/</span>
              <a href="/spm-ecosystem/spm-components" class="project-card__name-link">spm-components</a>
            </div>
            <span class="project-card__status-badge project-card__status-badge--active"
                  data-status="active">Active</span>
          </div>
          <div class="project-card__body">
            <p class="project-card__description">React UI component library for SPM modernization engine</p>
            <div class="project-card__stats">
              <span class="project-stat" data-stat="deployments">
                <svg aria-hidden="true" width="12" height="12"><use href="#icon-deploy"/></svg>
                8 deployments
              </span>
              <span class="project-stat" data-stat="last-deploy">
                Last deploy: <time datetime="2024-01-17T09:00:00Z">1 day ago</time>
              </span>
            </div>
          </div>
        </div>
      </section>

      <!-- Template element — browser does not render its content -->
      <template id="project-card-template">
        <div class="project-card" data-project-id="">
          <div class="project-card__header"></div>
          <div class="project-card__body"></div>
        </div>
      </template>
    </main>
  </app-shell>
</body>
</html>
```

- [ ] **Step 4: Verify all three files exist with expected selectors**

```bash
grep -q 'class="listing-row"' environments/site-l-extreme-legacy/fixtures/raw-dom-snapshot.html && echo "site-l: OK"
grep -q 'id="events-container"' environments/site-m-extreme-events/fixtures/raw-dom-snapshot.html && echo "site-m: OK"
grep -q 'id="app-sidebar"' environments/site-n-extreme-layout/fixtures/raw-dom-snapshot.html && echo "site-n: OK"
```

Expected:
```
site-l: OK
site-m: OK
site-n: OK
```

- [ ] **Step 5: Commit**

```bash
git add environments/site-l-extreme-legacy/fixtures/raw-dom-snapshot.html \
        environments/site-m-extreme-events/fixtures/raw-dom-snapshot.html \
        environments/site-n-extreme-layout/fixtures/raw-dom-snapshot.html
git commit -m "feat(qa): add raw DOM snapshots for extreme-legacy, extreme-events, extreme-layout"
```

---

## Task 4: Wire Presets, Update HTTP Server, Register `RAW_DOM_PRESETS`

**Files:**
- Modify: `environments/site-k-safebooru/preset.ts`
- Modify: `environments/site-f-wiki/preset.ts`
- Modify: `environments/site-l-extreme-legacy/preset.ts`
- Modify: `environments/site-m-extreme-events/preset.ts`
- Modify: `environments/site-n-extreme-layout/preset.ts`
- Modify: `e2e/presets.ts`
- Modify: `e2e/modernizer.spec.ts` (add `/route/raw` routes to original server)

**Interfaces:**
- Consumes: `rawDomHtmlPath?: string` from Task 1 interface on `EnvironmentPreset`
- Produces: `RAW_DOM_PRESETS` array exported from `e2e/presets.ts`

- [ ] **Step 1: Add `rawDomHtmlPath` to `environments/site-k-safebooru/preset.ts`**

Add one line to the existing preset object:

```typescript
// Before: (existing file)
export const SAFEBOORU_PRESET: EnvironmentPreset = {
  id: 'site-k-safebooru',
  name: 'Safebooru.org Gallery & Navigation Modernization',
  route: '/safebooru',
  fixtureHtmlPath: path.join(__dirname, 'page-snapshot.html'),
  // ... rest unchanged
};

// After: add rawDomHtmlPath
export const SAFEBOORU_PRESET: EnvironmentPreset = {
  id: 'site-k-safebooru',
  name: 'Safebooru.org Gallery & Navigation Modernization',
  route: '/safebooru',
  fixtureHtmlPath: path.join(__dirname, 'page-snapshot.html'),
  rawDomHtmlPath: path.join(__dirname, 'fixtures/raw-dom-snapshot.html'),  // ← ADD
  // ... rest unchanged
};
```

- [ ] **Step 2: Add `rawDomHtmlPath` to `environments/site-f-wiki/preset.ts`**

```typescript
export const ARCHWIKI_PRESET: EnvironmentPreset = {
  id: 'site-f-wiki',
  // ... existing fields unchanged ...
  fixtureHtmlPath: path.join(__dirname, 'fixtures/page-snapshot.html'),
  rawDomHtmlPath: path.join(__dirname, 'fixtures/raw-dom-snapshot.html'),  // ← ADD
  // ... rest unchanged
};
```

- [ ] **Step 3: Add `rawDomHtmlPath` to the three extreme site presets**

For each of `site-l-extreme-legacy`, `site-m-extreme-events`, `site-n-extreme-layout` — open the respective `preset.ts` and add:

```typescript
rawDomHtmlPath: path.join(__dirname, 'fixtures/raw-dom-snapshot.html'),
```

Check each preset's `fixtureHtmlPath` to find whether it uses `fixtures/` subdirectory or the root directory. Add `rawDomHtmlPath` pointing to `fixtures/raw-dom-snapshot.html` in all three cases.

- [ ] **Step 4: Update `e2e/presets.ts` — add `RAW_DOM_PRESETS` export**

Append to the bottom of the existing `presets.ts` (do not modify `ALL_ENVIRONMENT_PRESETS`):

```typescript
/**
 * Subset of presets that have a rawDomHtmlPath fixture available.
 * Used by raw-dom.spec.ts for dirty real-world DOM E2E tests.
 */
export const RAW_DOM_PRESETS: EnvironmentPreset[] = ALL_ENVIRONMENT_PRESETS.filter(
  p => p.rawDomHtmlPath != null
);
```

- [ ] **Step 5: Update `e2e/modernizer.spec.ts` server to also serve `/route/raw`**

The existing `beforeAll` server only serves `p.route`. Extend it to also handle `route + '/raw'` using `rawDomHtmlPath`:

```typescript
server = http.createServer((req, res) => {
  // Check for raw DOM route variant first (/route/raw)
  const rawPreset = ALL_ENVIRONMENT_PRESETS.find(p => req.url === `${p.route}/raw`);
  if (rawPreset?.rawDomHtmlPath && fs.existsSync(rawPreset.rawDomHtmlPath)) {
    const rawHtml = fs.readFileSync(rawPreset.rawDomHtmlPath, 'utf8');
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(rawHtml);
    return;
  }
  // Existing clean fixture route
  const targetPreset = ALL_ENVIRONMENT_PRESETS.find(p => p.route === req.url);
  if (targetPreset?.fixtureHtmlPath && fs.existsSync(targetPreset.fixtureHtmlPath)) {
    const mockHtml = fs.readFileSync(targetPreset.fixtureHtmlPath, 'utf8');
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(mockHtml);
    return;
  }
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end('<html><head></head><body>Blank page</body></html>');
});
```

- [ ] **Step 6: TypeScript compile check — no errors**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 7: Run existing E2E tests to verify no regression**

```bash
npx playwright test e2e/modernizer.spec.ts --reporter=list
```

Expected: all 5 existing tests still pass.

- [ ] **Step 8: Run raw DOM spec to verify new tests are registered**

```bash
npx playwright test e2e/raw-dom.spec.ts --reporter=list --list
```

Expected: shows 5 raw DOM test entries, one per preset with `rawDomHtmlPath`.

- [ ] **Step 9: Commit and push, close issue**

```bash
git add e2e/presets.ts \
        e2e/modernizer.spec.ts \
        environments/site-k-safebooru/preset.ts \
        environments/site-f-wiki/preset.ts \
        environments/site-l-extreme-legacy/preset.ts \
        environments/site-m-extreme-events/preset.ts \
        environments/site-n-extreme-layout/preset.ts
git commit -m "feat(qa): wire rawDomHtmlPath to all presets, register RAW_DOM_PRESETS, update HTTP server"
git push origin master
gh issue close 14 --repo spm-ecosystem/spm-qa-test-suite \
  -c "Implemented: raw-dom-snapshot.html fixtures for 5 environments, runRawDomE2ETest helper, raw-dom.spec.ts Playwright test suite, RAW_DOM_PRESETS registry."
```

---

## Self-Review

### Spec Coverage
- ✅ `fixtures/raw-dom-snapshot.html` alongside `page-snapshot.html` — **Task 2 + 3**
- ✅ E2E Playwright test variants validating modernization over raw DOM — **Task 1 (raw-dom.spec.ts) + Task 4**
- ✅ 5 environments covered: safebooru, archwiki, extreme-legacy, extreme-events, extreme-layout

### Placeholder Scan
- No TBD, TODO, or placeholder steps found.
- All HTML fixtures are complete, self-contained, and include the DOM selectors the presets' manifests target.
- All TypeScript code blocks are complete and compile-ready.

### Type Consistency
- `rawDomHtmlPath?: string` defined in Task 1, consumed in Task 4 — consistent.
- `RAW_DOM_PRESETS` defined as `EnvironmentPreset[]` in Task 4 — same type as `ALL_ENVIRONMENT_PRESETS`.
- `runRawDomE2ETest(preset: EnvironmentPreset)` defined in Task 1, called in Task 1's `raw-dom.spec.ts` — consistent.
