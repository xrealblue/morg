import type { CSSProperties } from 'react';

import { deriveChromeTokens } from './deriveChromeTokens';
import type { ChromeMapping } from './diffshubChromeMapping';
import type { ActiveThemeSnapshot } from './ThemeSource';

export type { ChromeMapping };

export function chromeThemeProps(
  active: ActiveThemeSnapshot,
  mapping: ChromeMapping
): { style: CSSProperties } {
  const theme = active.theme;
  if (theme == null) return { style: {} };
  return { style: mapping(deriveChromeTokens(theme), theme) ?? {} };
}
