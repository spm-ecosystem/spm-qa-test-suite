import { Page, chromium, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export interface EnvironmentPreset {
  id: string;
  name: string;
  route: string;
  fixtureHtmlPath?: string;
  rawDomHtmlPath?: string;
  manifestPath?: string;
  manifestObj?: object;
  customCss?: string;
  highlightSelector?: string;
  annotationText?: string;
  snapshotName: string;
  assertions?: (page: Page) => Promise<void>;
}

/**
 * Highlights a DOM element, injects a visual annotation badge containing a comment,
 * and takes a screenshot of the page.
 */
export async function annotateAndScreenshot(
  page: Page,
  selector: string,
  comment: string,
  screenshotName: string
) {
  await page.evaluate(
    ({ sel, text }) => {
      const el = document.querySelector(sel);
      if (!el) {
        console.warn(`[E2E Highlight] Element not found for selector: ${sel}`);
        return;
      }

      (el as HTMLElement).style.outline = '3px dashed #ff4757';
      (el as HTMLElement).style.outlineOffset = '2px';
      (el as HTMLElement).style.position = 'relative';

      const badge = document.createElement('div');
      badge.className = 'spm-e2e-annotation';
      badge.textContent = text;
      
      Object.assign(badge.style, {
        position: 'absolute',
        top: '-32px',
        left: '0',
        background: '#ff4757',
        color: '#ffffff',
        padding: '4px 8px',
        fontSize: '11px',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        fontWeight: 'bold',
        borderRadius: '4px',
        zIndex: '999999',
        boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
        pointerEvents: 'none',
        whiteSpace: 'nowrap',
      });

      el.appendChild(badge);
    },
    { sel: selector, text: comment }
  );

  const screenshotsDir = path.join(__dirname, '../screenshots');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  const screenshotPath = path.join(screenshotsDir, `${screenshotName}.png`);
  await page.screenshot({ path: screenshotPath });
  console.log(`[E2E QA] Visual snapshot captured and annotated: ${screenshotPath}`);
  
  return screenshotPath;
}

/**
 * Generic, preset-agnostic E2E runner for testing environment modernization.
 */
export async function runEnvironmentE2ETest(preset: EnvironmentPreset) {
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

    // 1. Navigate to base server to obtain extension ID
    await page.goto('http://localhost:8080/');
    await page.waitForSelector('html[data-spm-extension-id]', { timeout: 10000 });
    const extensionId = await page.evaluate(() => {
      return document.documentElement.getAttribute('data-spm-extension-id') || '';
    });

    if (!extensionId) {
      throw new Error(`[E2E Runner] Could not detect loaded SPM extension ID for preset '${preset.name}'`);
    }

    // 2. Load manifest object
    let manifestData = preset.manifestObj;
    if (!manifestData && preset.manifestPath) {
      manifestData = JSON.parse(fs.readFileSync(preset.manifestPath, 'utf8'));
    }

    if (!manifestData) {
      throw new Error(`[E2E Runner] No valid manifest provided for preset '${preset.name}'`);
    }

    // 3. Inject manifest configuration into Chrome local storage
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

    // 4. Navigate to target environment route
    await page.goto(`http://localhost:8080${preset.route}`);
    await page.waitForTimeout(2000); // Allow Shadow DOM React hydration

    // 5. Run custom assertions if provided
    if (preset.assertions) {
      await preset.assertions(page);
    }

    // 6. Capture visual snapshot if selector is provided
    if (preset.highlightSelector) {
      await annotateAndScreenshot(
        page,
        preset.highlightSelector,
        preset.annotationText || `${preset.name} reconstructed`,
        preset.snapshotName
      );
    }

    console.log(`[E2E Runner] Successfully completed preset test: ${preset.name}`);

  } finally {
    await context.close();
  }
}

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

