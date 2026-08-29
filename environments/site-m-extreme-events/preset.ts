import path from 'path';
import { fileURLToPath } from 'url';
import { EnvironmentPreset } from '../../e2e/helpers';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const manifestPath = path.join(__dirname, 'manifest.json');
const manifestObj = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

export const EXTREME_EVENTS_PRESET: EnvironmentPreset = {
  id: 'site-m-extreme-events',
  name: 'Extreme Event Handlers & XSS Modernization',
  route: '/extreme-events',
  fixtureHtmlPath: path.join(__dirname, 'fixtures/page-snapshot.html'),
  rawDomHtmlPath: path.join(__dirname, 'fixtures/raw-dom-snapshot.html'),
  manifestPath,
  manifestObj,
  customCss: '#qa-log { border: 1px solid #00e5ff !important; }',
  highlightSelector: '#section-1-onclick-links',
  annotationText: 'Extreme Events UiDashboardPage Reconstructed',
  snapshotName: '06_extreme_events_modernized'
};
