import { EnvironmentPreset } from './helpers';
import { ARCHWIKI_PRESET } from '../environments/site-f-wiki/preset';
import { SAFEBOORU_PRESET } from '../environments/site-k-safebooru/preset';
import { EXTREME_LEGACY_PRESET } from '../environments/site-l-extreme-legacy/preset';
import { EXTREME_EVENTS_PRESET } from '../environments/site-m-extreme-events/preset';
import { EXTREME_LAYOUT_PRESET } from '../environments/site-n-extreme-layout/preset';
import { EXTREME_FORMS_PRESET } from '../environments/site-o-extreme-forms/preset';
import { EXTREME_COMPONENTS_PRESET } from '../environments/site-p-extreme-components/preset';
import { EXTREME_DYNAMIC_PRESET } from '../environments/site-q-extreme-dynamic/preset';

export { ARCHWIKI_PRESET } from '../environments/site-f-wiki/preset';
export { SAFEBOORU_PRESET } from '../environments/site-k-safebooru/preset';
export { EXTREME_LEGACY_PRESET } from '../environments/site-l-extreme-legacy/preset';
export { EXTREME_EVENTS_PRESET } from '../environments/site-m-extreme-events/preset';
export { EXTREME_LAYOUT_PRESET } from '../environments/site-n-extreme-layout/preset';
export { EXTREME_FORMS_PRESET } from '../environments/site-o-extreme-forms/preset';
export { EXTREME_COMPONENTS_PRESET } from '../environments/site-p-extreme-components/preset';
export { EXTREME_DYNAMIC_PRESET } from '../environments/site-q-extreme-dynamic/preset';

/**
 * Global Registry of all QA environment presets.
 * New contributors simply create `environments/site-x/preset.ts` and add it here!
 */
export const ALL_ENVIRONMENT_PRESETS: EnvironmentPreset[] = [
  ARCHWIKI_PRESET,
  SAFEBOORU_PRESET,
  EXTREME_LEGACY_PRESET,
  EXTREME_EVENTS_PRESET,
  EXTREME_LAYOUT_PRESET,
  EXTREME_FORMS_PRESET,
  EXTREME_COMPONENTS_PRESET,
  EXTREME_DYNAMIC_PRESET
];

/**
 * Alias for ALL_ENVIRONMENT_PRESETS
 */
export const ALL_PRESETS: EnvironmentPreset[] = ALL_ENVIRONMENT_PRESETS;

/**
 * Subset of presets that have a rawDomHtmlPath fixture available.
 * Used by raw-dom.spec.ts for dirty real-world DOM E2E tests.
 */
export const RAW_DOM_PRESETS: EnvironmentPreset[] = ALL_ENVIRONMENT_PRESETS.filter(
  p => p.rawDomHtmlPath != null
);
