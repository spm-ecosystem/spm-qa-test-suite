import path from 'path';
import { fileURLToPath } from 'url';
import { EnvironmentPreset } from '../../e2e/helpers';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const manifestPath = path.join(__dirname, 'manifest.json');
const manifestObj = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

export const EXTREME_DYNAMIC_PRESET: EnvironmentPreset = {
  id: 'site-q-extreme-dynamic',
  name: 'Extreme Async Dynamic DOM Modernization',
  route: '/route/site-q',
  fixtureHtmlPath: path.join(__dirname, 'fixtures/page-snapshot.html'),
  manifestPath,
  manifestObj,
  highlightSelector: '#section-1-dynamic-feed',
  expectedSelector: '.spm-reconstructed, #mutation-target-box, h2',
  annotationText: 'Extreme Dynamic UiModernGridPage Reconstructed',
  snapshotName: '10_extreme_dynamic_modernized'
};
