'use client';

import type { CodeViewHandle, CodeViewItem } from '@pierre/diffs';
import type { Ref } from 'react';
import { useMemo } from 'react';

import { CodeViewHeader } from '~/components/CodeViewHeader';
import { ThemedCodeView } from '~/components/theming/react/ThemedCodeView';
import { useDiffSettings } from '~/hooks/use-diff-settings';
import type { DiffThemeInput } from '~/components/theming/js/diffThemeProps';

interface DiffViewWrapperProps<LAnnotation = undefined> {
  initialUrl: string;
  diffItems: CodeViewItem<LAnnotation>[];
  renderHeaderMetadata?: (props: {
    item: CodeViewItem<LAnnotation>;
    index: number;
  }) => React.ReactNode;
  ref?: Ref<CodeViewHandle<LAnnotation>>;
  theme?: DiffThemeInput;
}

export function DiffViewWrapper<LAnnotation = undefined>({
  initialUrl,
  diffItems,
  renderHeaderMetadata,
  ref,
  theme,
}: DiffViewWrapperProps<LAnnotation>) {
  const settings = useDiffSettings();

  const options = useMemo(
    () => ({
      stickyHeaders: true,
      showLineNumbers: settings.lineNumbers,
      overflow: settings.wordWrap ? ('wrap' as const) : ('scroll' as const),
      showBackground: settings.showBackgrounds,
    }),
    [settings]
  );

  if (diffItems.length === 0) {
    return (
      <>
        <CodeViewHeader initialUrl={initialUrl} />
        <div className="flex flex-1 items-center justify-center text-sm text-[var(--muted-foreground)]/70">
          No files changed
        </div>
      </>
    );
  }

  return (
    <>
      <CodeViewHeader initialUrl={initialUrl} />
      <ThemedCodeView<LAnnotation>
        ref={ref}
        initialItems={diffItems}
        options={options}
        renderHeaderMetadata={renderHeaderMetadata}
        theme={theme}
      />
    </>
  );
}
