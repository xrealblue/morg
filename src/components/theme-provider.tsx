'use client';

import type { ColorMode, ColorScheme } from '@pierre/theming';
import { useThemeController } from '@pierre/theming/react';
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { themeController } from '~/components/theming/themeController';

interface ThemeProviderProps {
  attribute?: 'class' | `data-${string}` | Array<'class' | `data-${string}`>;
  children: ReactNode;
  enableColorScheme?: boolean;
  value?: Partial<Record<ColorScheme, string>>;
}

interface ThemeContextValue {
  colorMode?: ColorMode;
  colorModes: ColorMode[];
  resolvedColorScheme?: ColorScheme;
  setColorMode: (mode: ColorMode) => void;
}

const COLOR_MODES: ColorMode[] = ['light', 'dark', 'system'];
const COLOR_SCHEMES: ColorScheme[] = ['light', 'dark'];
const SCHEME_THEME_COLOR: Record<ColorScheme, string> = {
  light: '#ffffff',
  dark: '#0a0a0a',
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

function setThemeColorMeta(color: string) {
  let meta = document.querySelector('meta[name="theme-color"]');
  if (meta == null) {
    meta = document.createElement('meta');
    meta.setAttribute('name', 'theme-color');
    document.head.appendChild(meta);
  }
  meta.setAttribute('content', color);
}

function applyColorScheme({
  attribute,
  enableColorScheme,
  resolvedColorScheme,
  value,
}: {
  attribute: ThemeProviderProps['attribute'];
  enableColorScheme: boolean;
  resolvedColorScheme: ColorScheme;
  value: Partial<Record<ColorScheme, string>> | undefined;
}) {
  const root = document.documentElement;
  const resolvedValue = value?.[resolvedColorScheme] ?? resolvedColorScheme;
  const attributes = Array.isArray(attribute) ? attribute : [attribute];
  const classValues = COLOR_SCHEMES.map((scheme) => value?.[scheme] ?? scheme);

  for (const currentAttribute of attributes) {
    if (currentAttribute === 'class') {
      root.classList.remove(...classValues);
      root.classList.add(resolvedValue);
      continue;
    }
    if (currentAttribute != null) {
      root.setAttribute(currentAttribute, resolvedValue);
    }
  }

  if (enableColorScheme) {
    root.style.colorScheme = resolvedColorScheme;
  }

  setThemeColorMeta(SCHEME_THEME_COLOR[resolvedColorScheme]);
}

export function ThemeProvider({
  attribute = 'data-theme',
  children,
  enableColorScheme = true,
  value,
}: ThemeProviderProps) {
  const state = useThemeController(themeController);

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const colorMode = mounted ? state.mode : undefined;
  const resolvedColorScheme = mounted ? state.resolvedColorScheme : undefined;

  useEffect(() => {
    applyColorScheme({
      attribute,
      enableColorScheme,
      resolvedColorScheme: state.resolvedColorScheme,
      value,
    });
  }, [attribute, enableColorScheme, state.resolvedColorScheme, value]);

  const setColorMode = useCallback((next: ColorMode) => {
    themeController.setColorMode(next);
  }, []);

  const contextValue = useMemo<ThemeContextValue>(
    () => ({
      colorMode,
      colorModes: COLOR_MODES,
      resolvedColorScheme,
      setColorMode,
    }),
    [colorMode, resolvedColorScheme, setColorMode]
  );

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  return (
    useContext(ThemeContext) ?? {
      colorModes: [],
      setColorMode: () => {},
    }
  );
}
