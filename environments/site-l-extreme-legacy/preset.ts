import path from 'path';
import { fileURLToPath } from 'url';
import { EnvironmentPreset } from '../../e2e/helpers';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const manifestPath = path.join(__dirname, 'manifest.json');
const manifestObj = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

export const EXTREME_LEGACY_PRESET: EnvironmentPreset = {
  id: 'site-l-extreme-legacy',
  name: 'Extreme Legacy DOM Modernization',
  route: '/extreme-legacy',
  fixtureHtmlPath: path.join(__dirname, 'fixtures/page-snapshot.html'),
  manifestPath,
  manifestObj,
  customCss: 'marquee { display: none !important; }',
  highlightSelector: 'header',
  annotationText: 'Extreme Legacy UiNavHeader & UiTableListPage Reconstructed',
  snapshotName: '05_extreme_legacy_modernized'
};
