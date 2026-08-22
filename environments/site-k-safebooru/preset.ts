import path from 'path';
import { fileURLToPath } from 'url';
import { EnvironmentPreset } from '../../e2e/helpers';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const SAFEBOORU_PRESET: EnvironmentPreset = {
  id: 'site-k-safebooru',
  name: 'Safebooru.org Gallery & Navigation Modernization',
  route: '/safebooru',
  fixtureHtmlPath: path.join(__dirname, 'page-snapshot.html'),
  manifestPath: path.join(__dirname, 'manifest.json'),
  customCss: 'body { background-color: #0f172a !important; color: #f8fafc !important; }',
  highlightSelector: '#grid-container',
  annotationText: 'Safebooru UiModernGridPage layout reconstructed',
  snapshotName: '04_safebooru_modernized'
};
