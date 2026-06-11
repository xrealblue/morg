'use client';

import { createThemeResolver } from '@pierre/theming';
import type { TreeThemeStyles } from '@pierre/trees';
import { useMemo } from 'react';

import { fixedSource, type ThemeInput } from '../js/ThemeSource';
import {
  treeThemeProps,
  type TreeThemePropsOptions,
} from '../js/treeThemeProps';
import { useThemeResolver, useThemeSource } from './useThemeSource';

export function useTreeThemeProps(
  theme?: ThemeInput,
  options?: TreeThemePropsOptions
): { style: TreeThemeStyles } {
  const providerSource = useThemeSource();
  const contextResolver = useThemeResolver();
  const colorScheme = providerSource.activeTheme.colorScheme;
  const localResolver = useMemo(() => createThemeResolver(), []);
  const resolver = contextResolver ?? localResolver;
  const override = useMemo(() => {
    if (theme == null) return undefined;
    return fixedSource(theme, { resolver, colorScheme });
  }, [theme, resolver, colorScheme]);
  const { activeTheme } = useThemeSource(override);
  const reconcile = options?.reconcileForegroundFromChrome ?? false;
  return useMemo(
    () =>
      treeThemeProps(activeTheme, { reconcileForegroundFromChrome: reconcile }),
    [activeTheme, reconcile]
  );
}
