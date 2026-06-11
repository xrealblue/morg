import { themeToTreeStyles, type TreeThemeStyles } from '@pierre/trees';

import { deriveChromeTokens } from './deriveChromeTokens';
import type { ActiveThemeSnapshot } from './ThemeSource';

export interface TreeThemePropsOptions {
  reconcileForegroundFromChrome?: boolean;
}

export function treeThemeProps(
  active: ActiveThemeSnapshot,
  options: TreeThemePropsOptions = {}
): { style: TreeThemeStyles } {
  const theme = active.theme;
  if (theme == null) return { style: {} };

  const treeStyles = themeToTreeStyles(theme);
  if (options.reconcileForegroundFromChrome === true) {
    const c = theme.colors ?? {};
    const primaryFg = deriveChromeTokens(theme)?.fg;
    if (
      primaryFg != null &&
      primaryFg !== c['sideBar.foreground'] &&
      primaryFg !== ''
    ) {
      treeStyles.color = primaryFg;
      treeStyles['--trees-theme-sidebar-fg'] = primaryFg;
      if (c['sideBarSectionHeader.foreground'] == null) {
        treeStyles['--trees-theme-sidebar-header-fg'] = primaryFg;
      }
      if (c['list.activeSelectionForeground'] == null) {
        treeStyles['--trees-theme-list-active-selection-fg'] = primaryFg;
      }
      if (
        c['list.focusOutline'] == null &&
        c['focusBorder'] == null &&
        c['sideBar.foreground'] == null
      ) {
        treeStyles['--trees-theme-focus-ring'] = primaryFg;
      }
    }
  }

  return { style: treeStyles };
}
