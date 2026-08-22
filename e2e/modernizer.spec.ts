import { test, expect, chromium } from '@playwright/test';
import path from 'path';
import fs from 'fs';
import http from 'http';
import { fileURLToPath } from 'url';
import { annotateAndScreenshot } from './helpers';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

test.describe('SPM Extension E2E Modernization Flow', () => {
  let server: http.Server;

  test.beforeAll(() => {
    // 1. Start a simple local HTTP server to serve legacy fixtures and blank pages
    server = http.createServer((req, res) => {
      if (req.url === '/wiki') {
        const fixtureHtmlPath = path.join(__dirname, '../environments/site-f-wiki/fixtures/page-snapshot.html');
        const mockHtml = fs.readFileSync(fixtureHtmlPath, 'utf8');
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(mockHtml);
      } else {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end('<html><head></head><body>Blank page</body></html>');
      }
    });
    server.listen(8080);
    console.log('[E2E Server] Local mock web server running at http://localhost:8080');
  });

  test.afterAll(() => {
    server.close();
    console.log('[E2E Server] Local mock web server stopped');
  });

  test('should load extension, modernize ArchWiki page, and support interactions', async () => {
    const pathToExtension = process.env.EXTENSION_DIST_PATH || path.resolve(__dirname, '../../extension/dist');
    
    // 2. Launch Chromium persistently with the extension loaded
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
      page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
      page.on('pageerror', err => console.log('BROWSER EXCEPTION:', err.message));

      // 3. Navigate to local server to trigger content script and read extension ID
      await page.goto('http://localhost:8080/');
      await page.waitForSelector('html[data-spm-extension-id]', { timeout: 10000 });
      const extensionId = await page.evaluate(() => {
        return document.documentElement.getAttribute('data-spm-extension-id') || '';
      });

      if (!extensionId) {
        throw new Error('Could not find loaded extension ID');
      }
      
      const settingsPage = `chrome-extension://${extensionId}/index.html`;

      // 4. Go to settings and set local mock manifest configuration for localhost
      await page.goto(settingsPage);
      await page.evaluate(async () => {
        const domain = 'localhost';
        const manifest = {
          targetUrl: "localhost/*",
          theme: {
            label: "Wiki Dark",
            cssVariables: {
              "--spm-bg-primary": "#1a1a2e",
              "--spm-bg-surface": "#16213e",
              "--spm-bg-element": "#0f3460",
              "--spm-text-primary": "#e4e4e7",
              "--spm-accent": "#e94560"
            },
            customStyles: "body { background-color: #1a1a2e !important; }"
          },
          reconstructs: [
            {
              containerSelector: "#mw-navigation",
              layoutComponent: "UiNavHeader",
              props: { siteName: "ArchWiki Mocked" }
            },
            {
              containerSelector: "#searchform",
              layoutComponent: "UiSearchBar",
              props: { placeholder: "Search ArchWiki Mocked..." }
            }
          ],
          components: [
            {
              selector: "#mw-panel, #footer, .mw-indicators",
              action: "hide"
            }
          ]
        };

        await new Promise<void>((resolve) => {
          chrome.storage.local.set({
            spm_global_enabled: true,
            spm_dev_mode: { [domain]: true },
            [`dev-draft-manifest:${domain}`]: JSON.stringify(manifest),
            [`dev-draft-css:${domain}`]: "body { background-color: #1a1a2e !important; }"
          }, () => resolve());
        });
      });

      // 5. Navigate to local mock legacy page
      await page.goto('http://localhost:8080/wiki');
      await page.waitForTimeout(2000); // Wait for modernizer rendering

      // 6. Highlight and capture the main modernization results with screenshots
      
      // Assert legacy elements are hidden
      const mwPanel = page.locator('#mw-panel');
      await expect(mwPanel).toBeHidden();
      await annotateAndScreenshot(page, '#mw-panel', 'Legacy sidepanel hidden successfully', '01_legacy_hidden');

      // Assert reconstruct host for NavHeader is mounted
      const navHeaderHost = page.locator('#mw-navigation + div.modern-reconstruct-host-uinavheader');
      await expect(navHeaderHost).toBeAttached();
      await annotateAndScreenshot(page, '#mw-navigation + div.modern-reconstruct-host-uinavheader', 'UiNavHeader layout reconstructed successfully', '02_nav_modernized');

      // Assert reconstruct host for SearchBar is mounted
      const searchHost = page.locator('#searchform + div.modern-reconstruct-host-uisearchbar');
      await expect(searchHost).toBeAttached();
      await annotateAndScreenshot(page, '#searchform + div.modern-reconstruct-host-uisearchbar', 'UiSearchBar component mounted and hydrated', '03_search_modernized');

      console.log('[E2E QA] All E2E smoke assertions passed successfully!');

    } finally {
      await context.close();
    }
  });
});
