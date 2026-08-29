import path from 'path';
import { fileURLToPath } from 'url';
import { EnvironmentPreset } from '../../e2e/helpers';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const manifestPath = path.join(__dirname, 'manifest.json');
const manifestObj = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

export const EXTREME_COMPONENTS_PRESET: EnvironmentPreset = {
  id: 'site-p-extreme-components',
  name: 'Extreme Custom Web Components Modernization',
  route: '/route/site-p',
  fixtureHtmlPath: path.join(__dirname, 'fixtures/page-snapshot.html'),
  manifestPath,
  manifestObj,
  highlightSelector: '#section-1-web-components',
  expectedSelector: '.spm-reconstructed, custom-card, h2',
  annotationText: 'Extreme Web Components UiDashboardPage Reconstructed',
  snapshotName: '09_extreme_components_modernized'
};
