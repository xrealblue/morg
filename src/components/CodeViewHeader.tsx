'use client';

import { useTheme } from '~/components/theme-provider';
import { docsThemeCatalog } from '~/components/theming/themeCatalog';
import { themeController } from '~/components/theming/themeController';
import { Button } from '~/components/ui/button';
import { ButtonGroup, ButtonGroupItem } from '~/components/ui/button-group';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu';
import { Switch } from '~/components/ui/switch';
import { useDiffSettings } from '~/hooks/use-diff-settings';
import { cn } from '~/lib/utils';
import { DiffUrlForm } from './DiffUrlForm';
import { MorgLogo } from './MorgLogo';
import {
  useChromeThemeProps,
} from '~/components/theming/react/useChromeThemeProps';
import { diffshubChromeMapping } from '~/components/theming/js/diffshubChromeMapping';
import { useMemo, useRef, useState, useLayoutEffect } from 'react';
import Link from 'next/link';
import { Sun, Moon, Monitor, Check, ChevronRight, Settings2 } from 'lucide-react';

const SETTING_ROW_CLASS =
  'w-full flex cursor-pointer items-center justify-between gap-4 px-2 py-1.5 text-sm';

const THEMED_DROPDOWN_CONTENT_CLASS =
  'border-[var(--diffshub-popover-border,var(--color-border))] bg-[var(--diffshub-popover-bg,var(--color-popover))] text-[var(--diffshub-popover-fg,var(--color-popover-foreground))] shadow-[var(--diffshub-popover-shadow,0_10px_30px_rgb(0_0_0_/_0.15))]';

interface CodeViewHeaderProps {
  initialUrl: string;
  className?: string;
}

export function CodeViewHeader({ initialUrl, className }: CodeViewHeaderProps) {
  const { colorMode, setColorMode } = useTheme();
  const settings = useDiffSettings();
  const [currentUrl, setCurrentUrl] = useState(initialUrl);
  const { style: headerChromeStyle } = useChromeThemeProps(diffshubChromeMapping);
  const themeChromeStyle =
    Object.keys(headerChromeStyle).length > 0 ? headerChromeStyle : undefined;
  const dropdownThemeStyle = useMemo(
    () => getDropdownThemeStyle(themeChromeStyle),
    [themeChromeStyle]
  );

  return (
    <div
      className={cn(
        'z-10 flex flex-wrap items-center gap-2.5 border-b border-[var(--color-border-opaque)] px-4 py-2 md:flex-nowrap md:px-3 md:py-1.5',
        themeChromeStyle == null &&
          'bg-background md:bg-[var(--diffshub-sidebar-bg)]',
        className
      )}
      style={themeChromeStyle}
    >
      <Link
        href="/"
        className="absolute left-1/2 inline-flex -translate-x-1/2 transition-transform duration-200 hover:scale-110 md:static md:translate-x-0"
      >
        <MorgLogo />
      </Link>

      <DiffUrlForm
        className="order-last md:order-none md:mr-auto"
        initialUrl={initialUrl}
        onUrlChange={setCurrentUrl}
        placeholder="https://github.com/org/repo/123"
        inputClassName="w-full md:w-auto"
      />

      <div className="flex w-full items-center justify-end gap-2 md:w-auto">
        <ThemeDropdown
          colorMode={colorMode ?? 'system'}
          setColorMode={setColorMode}
          themeDropdownStyle={dropdownThemeStyle}
        />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon-md"
              aria-label="Display settings"
              title="Display settings"
              className="hover:text-muted-foreground hover:bg-transparent"
            >
              <Settings2 className="size-4 md:size-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className={cn('w-52', THEMED_DROPDOWN_CONTENT_CLASS)}
            style={dropdownThemeStyle}
          >
            <DropdownMenuItem
              className="cursor-default p-0"
              onSelect={(e) => e.preventDefault()}
            >
              <label className={SETTING_ROW_CLASS}>
                <span className="min-w-0 flex-1">Backgrounds</span>
                <Switch
                  checked={settings.showBackgrounds}
                  onCheckedChange={settings.setShowBackgrounds}
                />
              </label>
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-default p-0"
              onSelect={(e) => e.preventDefault()}
            >
              <label className={SETTING_ROW_CLASS}>
                <span className="min-w-0 flex-1">Line numbers</span>
                <Switch
                  checked={settings.lineNumbers}
                  onCheckedChange={settings.setLineNumbers}
                />
              </label>
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-default p-0"
              onSelect={(e) => e.preventDefault()}
            >
              <label className={SETTING_ROW_CLASS}>
                <span className="min-w-0 flex-1">Word wrap</span>
                <Switch
                  checked={settings.wordWrap}
                  onCheckedChange={settings.setWordWrap}
                />
              </label>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

function getDropdownThemeStyle(
  themeChromeStyle: React.CSSProperties | undefined
): React.CSSProperties | undefined {
  if (themeChromeStyle == null) return undefined;
  return {
    ...themeChromeStyle,
    backgroundColor: 'var(--diffshub-popover-bg, var(--color-popover))',
    borderColor: 'var(--diffshub-popover-border, var(--color-border))',
    boxShadow: 'var(--diffshub-popover-shadow, 0 10px 30px rgb(0 0 0 / 0.15))',
    color: 'var(--diffshub-popover-fg, var(--color-popover-foreground))',
  };
}

function colorModeIcon(colorMode: string) {
  if (colorMode === 'light') return Sun;
  if (colorMode === 'dark') return Moon;
  return Monitor;
}

interface ThemeDropdownProps {
  colorMode: string;
  setColorMode: (mode: 'light' | 'dark' | 'system') => void;
  themeDropdownStyle?: React.CSSProperties;
}

function ThemeDropdown({
  colorMode,
  setColorMode,
  themeDropdownStyle,
}: ThemeDropdownProps) {
  const TriggerIcon = colorModeIcon(colorMode);
  const [view, setView] = useState<'main' | 'light' | 'dark'>('main');
  const [lightThemeName, setLocalLightTheme] = useState(
    () => themeController.getState().lightThemeName
  );
  const [darkThemeName, setLocalDarkTheme] = useState(
    () => themeController.getState().darkThemeName
  );

  const setLightThemeName = (name: string) => {
    themeController.setThemeNameForScheme('light', name);
    setLocalLightTheme(name);
  };
  const setDarkThemeName = (name: string) => {
    themeController.setThemeNameForScheme('dark', name);
    setLocalDarkTheme(name);
  };

  const themesAreCustom =
    lightThemeName !== docsThemeCatalog.defaultLightThemeName ||
    darkThemeName !== docsThemeCatalog.defaultDarkThemeName;

  return (
    <DropdownMenu
      modal={false}
      onOpenChange={(open) => {
        if (!open) setView('main');
      }}
    >
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon-md"
          aria-label="Theme settings"
          title="Theme settings"
          className="hover:text-muted-foreground hover:bg-transparent"
        >
          <TriggerIcon className="size-4 md:size-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className={cn('w-72 p-2', THEMED_DROPDOWN_CONTENT_CLASS)}
        style={themeDropdownStyle}
      >
        {view === 'main' ? (
          <>
            <DropdownMenuItem
              className="cursor-default p-0 focus:bg-transparent"
              onSelect={(event) => event.preventDefault()}
            >
              <ButtonGroup
                className="w-full"
                value={colorMode}
                onValueChange={(value) => {
                  if (value === 'system' || value === 'light' || value === 'dark') {
                    setColorMode(value);
                  }
                }}
              >
                <ButtonGroupItem value="system" className="flex-1">
                  <Monitor className="size-3" />
                  Auto
                </ButtonGroupItem>
                <ButtonGroupItem value="light" className="flex-1">
                  <Sun className="size-3" />
                  Light
                </ButtonGroupItem>
                <ButtonGroupItem value="dark" className="flex-1">
                  <Moon className="size-3" />
                  Dark
                </ButtonGroupItem>
              </ButtonGroup>
            </DropdownMenuItem>
            <DropdownMenuItem
              className="mt-1 flex cursor-pointer items-center gap-2"
              onSelect={(event) => {
                event.preventDefault();
                setView('light');
              }}
            >
              <Sun className="size-3" />
              <span className="min-w-0 flex-1 truncate">{lightThemeName}</span>
              <ChevronRight
                aria-hidden
                className="text-muted-foreground size-3"
              />
            </DropdownMenuItem>
            <DropdownMenuItem
              className="flex cursor-pointer items-center gap-2"
              onSelect={(event) => {
                event.preventDefault();
                setView('dark');
              }}
            >
              <Moon className="size-3" />
              <span className="min-w-0 flex-1 truncate">{darkThemeName}</span>
              <ChevronRight
                aria-hidden
                className="text-muted-foreground size-3"
              />
            </DropdownMenuItem>
            {themesAreCustom && (
              <DropdownMenuItem
                className="text-muted-foreground hover:text-foreground mt-1 cursor-pointer justify-center text-xs focus:bg-transparent"
                onSelect={(event) => {
                  event.preventDefault();
                  setLightThemeName(docsThemeCatalog.defaultLightThemeName);
                  setDarkThemeName(docsThemeCatalog.defaultDarkThemeName);
                }}
              >
                Reset to default themes
              </DropdownMenuItem>
            )}
          </>
        ) : (
          <ThemeList
            view={view}
            currentLightThemeName={lightThemeName}
            currentDarkThemeName={darkThemeName}
            onBack={() => setView('main')}
            onPickLight={(theme) => {
              setLightThemeName(theme);
              setColorMode('light');
              setView('main');
            }}
            onPickDark={(theme) => {
              setDarkThemeName(theme);
              setColorMode('dark');
              setView('main');
            }}
          />
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

interface ThemeListProps {
  view: 'light' | 'dark';
  currentLightThemeName: string;
  currentDarkThemeName: string;
  onBack(): void;
  onPickLight(theme: string): void;
  onPickDark(theme: string): void;
}

function ThemeList({
  view,
  currentLightThemeName,
  currentDarkThemeName,
  onBack,
  onPickLight,
  onPickDark,
}: ThemeListProps) {
  const isLight = view === 'light';
  const themes = docsThemeCatalog.getThemeNames({
    colorScheme: isLight ? 'light' : 'dark',
  });
  const current = isLight ? currentLightThemeName : currentDarkThemeName;
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const selectedItemRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const container = scrollContainerRef.current;
    const selected = selectedItemRef.current;
    if (container == null || selected == null) return;
    const containerTop = container.getBoundingClientRect().top;
    const selectedTop = selected.getBoundingClientRect().top;
    const offsetWithinScroll =
      selectedTop - containerTop + container.scrollTop;
    const rowHeight = selected.offsetHeight;
    container.scrollTop = Math.max(0, offsetWithinScroll - rowHeight);
  }, [view]);

  return (
    <>
      <DropdownMenuItem
        className="flex cursor-pointer items-center gap-2"
        onSelect={(event) => {
          event.preventDefault();
          onBack();
        }}
      >
        <ChevronRight aria-hidden className="text-muted-foreground size-3 rotate-180" />
        {isLight ? <Sun className="size-3" /> : <Moon className="size-3" />}
        <span className="flex-1 truncate">
          {isLight ? 'Light theme' : 'Dark theme'}
        </span>
      </DropdownMenuItem>
      <div
        ref={scrollContainerRef}
        className="cv-mini-scrollbar mt-1 max-h-[320px] overflow-y-auto overscroll-contain"
      >
        {themes.map((theme) => (
          <DropdownMenuItem
            key={theme}
            ref={current === theme ? selectedItemRef : undefined}
            onSelect={(event) => {
              event.preventDefault();
              if (isLight) onPickLight(theme);
              else onPickDark(theme);
            }}
            selected={current === theme}
          >
            <span className="flex-1 truncate">{theme}</span>
            {current === theme ? (
              <Check className="size-4" />
            ) : (
              <div className="ml-2 h-4 w-4" />
            )}
          </DropdownMenuItem>
        ))}
      </div>
    </>
  );
}
