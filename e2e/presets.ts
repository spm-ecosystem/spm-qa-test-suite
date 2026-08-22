import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { EnvironmentPreset } from './helpers';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * ArchWiki Modernization Preset
 */
export const ARCHWIKI_PRESET: EnvironmentPreset = {
  id: 'site-f-wiki',
  name: 'ArchWiki Documentation Modernization',
  route: '/wiki',
  fixtureHtmlPath: path.join(__dirname, '../environments/site-f-wiki/fixtures/page-snapshot.html'),
  manifestObj: {
    targetUrl: 'localhost/*',
    theme: {
      label: 'Wiki Dark',
      cssVariables: {
        '--spm-bg-primary': '#1a1a2e',
        '--spm-bg-surface': '#16213e',
        '--spm-bg-element': '#0f3460',
        '--spm-text-primary': '#e4e4e7',
        '--spm-accent': '#e94560'
      },
      customStyles: 'body { background-color: #1a1a2e !important; }'
    },
    reconstructs: [
      {
        containerSelector: '#mw-navigation',
        layoutComponent: 'UiNavHeader',
        props: { siteName: 'ArchWiki Mocked' }
      },
      {
        containerSelector: '#searchform',
        layoutComponent: 'UiSearchBar',
        props: { placeholder: 'Search ArchWiki Mocked...' }
      }
    ],
    components: [
      {
        selector: '#mw-panel, #footer, .mw-indicators',
        action: 'hide'
      }
    ]
  },
  customCss: 'body { background-color: #1a1a2e !important; }',
  highlightSelector: '#mw-navigation',
  annotationText: 'ArchWiki UiNavHeader reconstructed',
  snapshotName: '01_wiki_modernized'
};

/**
 * Safebooru.org Modernization Preset
 */
export const SAFEBOORU_PRESET: EnvironmentPreset = {
  id: 'site-k-safebooru',
  name: 'Safebooru.org Gallery & Navigation Modernization',
  route: '/safebooru',
  fixtureHtmlPath: path.join(__dirname, '../environments/site-k-safebooru/page-snapshot.html'),
  manifestPath: path.join(__dirname, '../environments/site-k-safebooru/manifest.json'),
  customCss: 'body { background-color: #0f172a !important; color: #f8fafc !important; }',
  highlightSelector: '#grid-container',
  annotationText: 'Safebooru UiModernGridPage layout reconstructed',
  snapshotName: '04_safebooru_modernized'
};

/**
 * Registry of all available QA environment presets
 */
export const ALL_ENVIRONMENT_PRESETS: EnvironmentPreset[] = [
  ARCHWIKI_PRESET,
  SAFEBOORU_PRESET
];
