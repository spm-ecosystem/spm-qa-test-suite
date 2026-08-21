import { Page } from '@playwright/test';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

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
  // Inject border highlight and badge comment directly into the page's DOM
  await page.evaluate(
    ({ sel, text }) => {
      // Find element (handles both standard DOM and shadow DOM checks if needed)
      const el = document.querySelector(sel);
      if (!el) {
        console.warn(`[E2E Highlight] Element not found for selector: ${sel}`);
        return;
      }

      // Draw custom highlight border
      (el as HTMLElement).style.outline = '3px dashed #ff4757';
      (el as HTMLElement).style.outlineOffset = '2px';
      (el as HTMLElement).style.position = 'relative';

      // Create a visual badge overlay
      const badge = document.createElement('div');
      badge.className = 'spm-e2e-annotation';
      badge.textContent = text;
      
      // Style the annotation badge overlay
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

      // Append badge to the highlighted element
      el.appendChild(badge);
    },
    { sel: selector, text: comment }
  );

  // Define E2E screenshots directory inside spm-qa-test-suite
  const screenshotsDir = path.join(__dirname, '../screenshots');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  const screenshotPath = path.join(screenshotsDir, `${screenshotName}.png`);
  
  // Capture page screenshot
  await page.screenshot({ path: screenshotPath });
  console.log(`[E2E QA] Visual snapshot captured and annotated: ${screenshotPath}`);
  
  return screenshotPath;
}
