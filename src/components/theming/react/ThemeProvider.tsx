'use client';

import {
  createThemeResolver,
  type ThemeController,
  type ThemeResolver,
} from '@pierre/theming';
import { type ReactNode, useMemo } from 'react';

import {
  controllerSource,
  fixedSource,
  type ThemeInput,
} from '../js/ThemeSource';
import {
  ThemeControllerContext,
  ThemeResolverContext,
  ThemeSourceContext,
  useThemeResolver,
  useThemeSource,
} from './useThemeSource';

interface ControllerProviderProps {
  controller: ThemeController;
  theme?: never;
  children: ReactNode;
}

interface OverrideProviderProps {
  controller?: never;
  resolver?: ThemeResolver;
  theme?: ThemeInput;
  children: ReactNode;
}

type ThemeProviderProps = ControllerProviderProps | OverrideProviderProps;

export function ThemeProvider(props: ThemeProviderProps) {
  if (props.controller != null) {
    return (
      <ControllerThemeProvider controller={props.controller}>
        {props.children}
      </ControllerThemeProvider>
    );
  }
  if (props.theme == null) return <>{props.children}</>;
  return (
    <OverrideThemeProvider resolver={props.resolver} theme={props.theme}>
      {props.children}
    </OverrideThemeProvider>
  );
}

function ControllerThemeProvider({
  controller,
  children,
}: {
  controller: ThemeController;
  children: ReactNode;
}) {
  const source = useMemo(() => controllerSource(controller), [controller]);
  return (
    <ThemeControllerContext.Provider value={controller}>
      <ThemeResolverContext.Provider value={controller.resolver}>
        <ThemeSourceContext.Provider value={source}>
          {children}
        </ThemeSourceContext.Provider>
      </ThemeResolverContext.Provider>
    </ThemeControllerContext.Provider>
  );
}

function OverrideThemeProvider({
  resolver,
  theme,
  children,
}: {
  resolver?: ThemeResolver;
  theme: ThemeInput;
  children: ReactNode;
}) {
  const parentSource = useThemeSource();
  const parentResolver = useThemeResolver();
  const colorScheme = parentSource.activeTheme.colorScheme;
  const localResolver = useMemo(() => createThemeResolver(), []);
  const selectedResolver = resolver ?? parentResolver ?? localResolver;
  const source = useMemo(() => {
    return fixedSource(theme, { resolver: selectedResolver, colorScheme });
  }, [theme, selectedResolver, colorScheme]);
  return (
    <ThemeResolverContext.Provider value={selectedResolver}>
      <ThemeSourceContext.Provider value={source}>
        {children}
      </ThemeSourceContext.Provider>
    </ThemeResolverContext.Provider>
  );
}
