'use client';

import type { ThemesType, ThemeTypes } from '@pierre/diffs';
import { useMemo } from 'react';

import {
  type DiffThemeInput,
  diffThemeProps,
  diffThemeSelectionFromInput,
} from '../js/diffThemeProps';
import { hasThemeNameSelection } from '../js/ThemeSource';
import { useThemeSource } from './useThemeSource';

export function useDiffThemeProps(theme?: DiffThemeInput): {
  theme: ThemesType;
  themeType: ThemeTypes;
} {
  const { activeTheme, source } = useThemeSource();
  return useMemo(() => {
    if (theme != null) {
      return diffThemeProps(
        diffThemeSelectionFromInput(theme, activeTheme.colorScheme)
      );
    }
    const sourceSelection = hasThemeNameSelection(source)
      ? source.getThemeNameSelection()
      : undefined;
    if (sourceSelection != null) {
      return diffThemeProps(sourceSelection);
    }
    return diffThemeProps({
      lightThemeName: 'pierre-dark',
      darkThemeName: 'pierre-dark',
      colorScheme: activeTheme.colorScheme,
    });
  }, [
    theme,
    source,
    activeTheme.colorScheme,
  ]);
}
