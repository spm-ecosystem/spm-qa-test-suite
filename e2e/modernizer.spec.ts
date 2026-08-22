import { test } from '@playwright/test';
import path from 'path';
import fs from 'fs';
import http from 'http';
import { fileURLToPath } from 'url';
import { runEnvironmentE2ETest } from './helpers';
import { ALL_ENVIRONMENT_PRESETS, ARCHWIKI_PRESET, SAFEBOORU_PRESET } from './presets';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

test.describe('SPM Extension E2E Modernization Flow', () => {
  let server: http.Server;

  test.beforeAll(() => {
    // Start local HTTP server to serve preset HTML fixture snapshots
    server = http.createServer((req, res) => {
      const targetPreset = ALL_ENVIRONMENT_PRESETS.find(p => p.route === req.url);
      if (targetPreset && targetPreset.fixtureHtmlPath && fs.existsSync(targetPreset.fixtureHtmlPath)) {
        const mockHtml = fs.readFileSync(targetPreset.fixtureHtmlPath, 'utf8');
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

  test('should modernize ArchWiki environment', async () => {
    await runEnvironmentE2ETest(ARCHWIKI_PRESET);
  });

  test('should modernize Safebooru.org environment', async () => {
    await runEnvironmentE2ETest(SAFEBOORU_PRESET);
  });
});
