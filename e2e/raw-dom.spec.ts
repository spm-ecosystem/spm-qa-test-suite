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
