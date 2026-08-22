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
      } else if (req.url === '/safebooru') {
        const fixtureHtmlPath = path.join(__dirname, '../environments/site-k-safebooru/page-snapshot.html');
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
      const extensionId = await page.evaluate(() => {
        return document.documentElement.getAttribute('data-spm-extension-id') || '';
      });

      if (!extensionId) {
        throw new Error('Could not find loaded extension ID');
      }
      
      const settingsPage = `chrome-extension://${extensionId}/index.html`;

      await page.goto(settingsPage);
      await page.evaluate(async () => {
        const domain = 'localhost';
        const manifest = {
          targetUrl: "localhost/*",
          theme: {
            label: "Wiki Dark",
            cssVariables: {
              "--spm-bg-primary": "#1a1a2e"
            }
          },
          reconstructs: [
            {
              containerSelector: "#mw-navigation",
              layoutComponent: "UiNavHeader",
              props: { siteName: "ArchWiki Mocked" }
            }
          ]
        };

        await new Promise<void>((resolve) => {
          chrome.storage.local.set({
            spm_global_enabled: true,
            spm_dev_mode: { [domain]: true },
            [`dev-draft-manifest:${domain}`]: JSON.stringify(manifest)
          }, () => resolve());
        });
      });

      await page.goto('http://localhost:8080/wiki');
      await page.waitForTimeout(1000);
      await annotateAndScreenshot(page, '#mw-navigation', 'ArchWiki layout reconstructed', '01_wiki_modernized');

    } finally {
      await context.close();
    }
  });

  test('should load extension, modernize Safebooru.org page, and capture visual snapshot', async () => {
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
      const extensionId = await page.evaluate(() => {
        return document.documentElement.getAttribute('data-spm-extension-id') || '';
      });

      if (!extensionId) {
        throw new Error('Could not find loaded extension ID');
      }
      
      const settingsPage = `chrome-extension://${extensionId}/index.html`;
      const safebooruManifestPath = path.join(__dirname, '../environments/site-k-safebooru/manifest.json');
      const safebooruManifest = JSON.parse(fs.readFileSync(safebooruManifestPath, 'utf8'));

      await page.goto(settingsPage);
      await page.evaluate(async (manifestObj) => {
        const domain = 'localhost';
        await new Promise<void>((resolve) => {
          chrome.storage.local.set({
            spm_global_enabled: true,
            spm_dev_mode: { [domain]: true },
            [`dev-draft-manifest:${domain}`]: JSON.stringify(manifestObj),
            [`dev-draft-css:${domain}`]: "body { background-color: #0f172a !important; color: #f8fafc !important; }"
          }, () => resolve());
        });
      }, safebooruManifest);

      await page.goto('http://localhost:8080/safebooru');
      await page.waitForTimeout(2000);

      await annotateAndScreenshot(page, '#grid-container', 'Safebooru UiModernGridPage layout reconstructed', '04_safebooru_modernized');
      console.log('[E2E QA] Safebooru visual snapshot successfully generated!');

    } finally {
      await context.close();
    }
  });
});
