'use client';

import { useCallback, useMemo } from 'react';
import { useLocalStorage } from 'usehooks-ts';

export interface DiffSettings {
  showBackgrounds: boolean;
  lineNumbers: boolean;
  wordWrap: boolean;
  diffStyle: 'split' | 'unified';
}

const DEFAULT_SETTINGS: DiffSettings = {
  showBackgrounds: true,
  lineNumbers: true,
  wordWrap: false,
  diffStyle: 'unified',
};

const STORAGE_KEY = 'morg-diff-settings';

export function useDiffSettings() {
  const [settings, setSettings] = useLocalStorage<DiffSettings>(
    STORAGE_KEY,
    DEFAULT_SETTINGS
  );

  const updateSetting = useCallback(
    <K extends keyof DiffSettings>(key: K, value: DiffSettings[K]) => {
      setSettings((prev) => ({ ...prev, [key]: value }));
    },
    [setSettings]
  );

  const api = useMemo(
    () => ({
      ...settings,
      setShowBackgrounds: (v: boolean) => updateSetting('showBackgrounds', v),
      setLineNumbers: (v: boolean) => updateSetting('lineNumbers', v),
      setWordWrap: (v: boolean) => updateSetting('wordWrap', v),
      setDiffStyle: (v: 'split' | 'unified') => updateSetting('diffStyle', v),
    }),
    [settings, updateSetting]
  );

  return api;
}
