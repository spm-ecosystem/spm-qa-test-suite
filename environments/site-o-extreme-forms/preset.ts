import path from 'path';
import { fileURLToPath } from 'url';
import { EnvironmentPreset } from '../../e2e/helpers';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const manifestPath = path.join(__dirname, 'manifest.json');
const manifestObj = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

export const EXTREME_FORMS_PRESET: EnvironmentPreset = {
  id: 'site-o-extreme-forms',
  name: 'Extreme Forms & Controls Modernization',
  route: '/route/site-o',
  fixtureHtmlPath: path.join(__dirname, 'fixtures/page-snapshot.html'),
  manifestPath,
  manifestObj,
  highlightSelector: '#section-1-form-controls',
  expectedSelector: '.spm-reconstructed, .form-card, h2',
  annotationText: 'Extreme Forms UiDashboardPage Reconstructed',
  snapshotName: '08_extreme_forms_modernized'
};
