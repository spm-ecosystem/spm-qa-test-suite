import path from 'path';
import { fileURLToPath } from 'url';
import { EnvironmentPreset } from '../../e2e/helpers';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const manifestPath = path.join(__dirname, 'manifest.json');
const manifestObj = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

export const EXTREME_LAYOUT_PRESET: EnvironmentPreset = {
  id: 'site-n-extreme-layout',
  name: 'Extreme Layout & Shadow DOM Modernization',
  route: '/extreme-layout',
  fixtureHtmlPath: path.join(__dirname, 'fixtures/page-snapshot.html'),
  manifestPath,
  manifestObj,
  customCss: '#inline-stress-container { width: 100% !important; }',
  highlightSelector: '#section-1',
  annotationText: 'Extreme Layout UiModernGridPage Reconstructed',
  snapshotName: '07_extreme_layout_modernized'
};
