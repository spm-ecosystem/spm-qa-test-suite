import { EnvironmentPreset } from './helpers';
import { ARCHWIKI_PRESET } from '../environments/site-f-wiki/preset';
import { SAFEBOORU_PRESET } from '../environments/site-k-safebooru/preset';

export { ARCHWIKI_PRESET } from '../environments/site-f-wiki/preset';
export { SAFEBOORU_PRESET } from '../environments/site-k-safebooru/preset';

/**
 * Global Registry of all QA environment presets.
 * New contributors simply create `environments/site-x/preset.ts` and add it here!
 */
export const ALL_ENVIRONMENT_PRESETS: EnvironmentPreset[] = [
  ARCHWIKI_PRESET,
  SAFEBOORU_PRESET
];
