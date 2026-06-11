import { createThemeController, type ThemePersistence } from '@pierre/theming';

import { docsThemeCatalog } from './themeCatalog';

export { docsThemeCatalog } from './themeCatalog';

const MODE_KEY = 'theme';
const LIGHT_THEME_KEY = 'diffshub-light-theme';
const DARK_THEME_KEY = 'diffshub-dark-theme';

function readKey(key: string): string | null {
  try {
    return globalThis.localStorage?.getItem(key) ?? null;
  } catch {
    return null;
  }
}

function writeKey(key: string, value: string): void {
  try {
    globalThis.localStorage?.setItem(key, value);
  } catch {
  }
}

const docsPersistence: ThemePersistence = {
  load() {
    const mode = readKey(MODE_KEY);
    const light = readKey(LIGHT_THEME_KEY);
    const dark = readKey(DARK_THEME_KEY);
    if (mode == null && light == null && dark == null) return null;
    const validMode =
      mode === 'light' || mode === 'dark' || mode === 'system'
        ? mode
        : 'system';
    return {
      mode: validMode,
      lightThemeName: light ?? docsThemeCatalog.defaultLightThemeName,
      darkThemeName: dark ?? docsThemeCatalog.defaultDarkThemeName,
    };
  },
  save(selection) {
    writeKey(MODE_KEY, selection.mode);
    writeKey(LIGHT_THEME_KEY, selection.lightThemeName);
    writeKey(DARK_THEME_KEY, selection.darkThemeName);
  },
};

export const themeController = createThemeController({
  catalog: docsThemeCatalog,
  persistence: docsPersistence,
  defaultMode: 'system',
});

export const docsThemeResolver = themeController.resolver;
