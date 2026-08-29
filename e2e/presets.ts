import { EnvironmentPreset } from './helpers';
import { ARCHWIKI_PRESET } from '../environments/site-f-wiki/preset';
import { SAFEBOORU_PRESET } from '../environments/site-k-safebooru/preset';
import { EXTREME_LEGACY_PRESET } from '../environments/site-l-extreme-legacy/preset';
import { EXTREME_EVENTS_PRESET } from '../environments/site-m-extreme-events/preset';
import { EXTREME_LAYOUT_PRESET } from '../environments/site-n-extreme-layout/preset';

export { ARCHWIKI_PRESET } from '../environments/site-f-wiki/preset';
export { SAFEBOORU_PRESET } from '../environments/site-k-safebooru/preset';
export { EXTREME_LEGACY_PRESET } from '../environments/site-l-extreme-legacy/preset';
export { EXTREME_EVENTS_PRESET } from '../environments/site-m-extreme-events/preset';
export { EXTREME_LAYOUT_PRESET } from '../environments/site-n-extreme-layout/preset';

/**
 * Global Registry of all QA environment presets.
 * New contributors simply create `environments/site-x/preset.ts` and add it here!
 */
export const ALL_ENVIRONMENT_PRESETS: EnvironmentPreset[] = [
  ARCHWIKI_PRESET,
  SAFEBOORU_PRESET,
  EXTREME_LEGACY_PRESET,
  EXTREME_EVENTS_PRESET,
  EXTREME_LAYOUT_PRESET
];

/**
 * Subset of presets that have a rawDomHtmlPath fixture available.
 * Temporary stub until Task 2.
 */
export const RAW_DOM_PRESETS: EnvironmentPreset[] = [];

