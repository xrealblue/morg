'use client';

import type { CodeViewItem } from '@pierre/diffs';
import { useMemo } from 'react';

import { CodeViewHeader } from '~/components/CodeViewHeader';
import { ThemedCodeView } from '~/components/theming/react/ThemedCodeView';
import { useDiffSettings } from '~/hooks/use-diff-settings';

interface DiffViewWrapperProps {
  initialUrl: string;
  diffItems: CodeViewItem[];
  renderHeaderMetadata?: (item: CodeViewItem) => React.ReactNode;
}

export function DiffViewWrapper({
  initialUrl,
  diffItems,
  renderHeaderMetadata,
}: DiffViewWrapperProps) {
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
      <ThemedCodeView
        initialItems={diffItems}
        options={options}
        renderHeaderMetadata={renderHeaderMetadata}
      />
    </>
  );
}
