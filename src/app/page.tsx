'use client';

import { ArrowRight, Github } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

import { DiffUrlForm } from '~/components/DiffUrlForm';
import { MorgLogo } from '~/components/MorgLogo';
import { Button } from '~/components/ui/button';

const DIFF_LINE_BADGE = 'inline-flex rounded-r py-0.25 pr-1.5 pl-1.5';
const DIFF_LINE_DELETED_BADGE = `${DIFF_LINE_BADGE} bg-[#ff6762]/15 text-[#ff2e3f] dark:bg-[#ff6762]/10 dark:text-[#ff6762]`;
const DIFF_LINE_ADDED_BADGE = `${DIFF_LINE_BADGE} bg-[#07c480]/15 text-[#18a46c] dark:bg-[#07c480]/10 dark:text-[#07c480]`;

const EXAMPLE_URLS = [
  'xrealblue/morg/pull/1',
  'nodejs/node/pull/59805',
  'oven-sh/bun/pull/30412',
] as const;

export default function Home() {
  const [repoUrl, setRepoUrl] = useState('');

  return (
    <div className="flex min-h-[100svh] flex-col items-center justify-center md:bg-[var(--diffshub-sidebar-bg)] md:py-12">
      <section className="relative flex min-h-[100svh] w-full max-w-[640px] flex-col justify-center space-y-4 px-6 pt-8 text-sm md:block md:min-h-0">
        <h2 className="flex items-center gap-1.5 text-2xl font-semibold tracking-tight">
          <MorgLogo />
          <span style={{ fontFamily: 'var(--font-berkeley-mono)' }}>Morg</span>
        </h2>
        <p className="text-muted-foreground text-pretty">
          AI-powered code analysis for any public GitHub repository. Browse
          commits, pull requests, and code diffs with intelligent summaries.
          No login required.
        </p>
        <div className="text-muted-foreground flex flex-col gap-[2px] font-mono leading-[22px] tracking-tight">
          <code className="rounded-l font-normal text-inherit">
            <span className="min-w-0 truncate">
              <code className={DIFF_LINE_DELETED_BADGE}>- github</code>
              .com/org/repo/pull/number
            </span>
          </code>
          <code className="truncate rounded-l border-l-[4px] border-[#07c480] font-normal text-inherit">
            <code className={DIFF_LINE_ADDED_BADGE}>+ morg</code>
            .app/org/repo/pull/number
          </code>
        </div>
        <div className="bg-accent md:bg-background rounded-lg border px-4 md:my-6">
          <DiffUrlForm
            placeholder="https://github.com/org/repo/123"
            inputClassName="text-md h-12 w-full text-start"
          >
            {(isPending, url) => (
              <Button
                type="submit"
                variant="ghost"
                size="icon-md"
                disabled={isPending || url.length === 0}
                aria-label={isPending ? 'Loading…' : 'Go'}
                className="hover:text-muted-foreground -mr-2 hover:bg-transparent"
              >
                <ArrowRight className="size-4" />
              </Button>
            )}
          </DiffUrlForm>
        </div>
        <div className="space-y-2">
          <h3 className="text-muted-foreground text-sm font-normal">
            Enter a URL above, or try one of these:
          </h3>
          <ul className="mb-5 flex flex-col gap-1 text-sm">
            {EXAMPLE_URLS.map((url) => (
              <li key={url} className="flex items-start justify-start gap-1">
                <ArrowRight className="mt-0.5 size-4 flex-shrink-0 opacity-50" />
                <div>
                  <Link href={`/${url}`} className="inline-link">
                    <span className="hidden md:inline">
                      https://github.com/
                    </span>
                    {url}
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>
      <section className="w-full max-w-[640px] space-y-4 px-5 pb-8">
        <hr className="my-8 max-w-[80px] opacity-50" />
        <p className="text-muted-foreground text-sm text-pretty">
          Built with{' '}
          <Link
            href="https://diffs.com/docs#codeview"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-link"
          >
            CodeView
          </Link>{' '}
          and powered by AI summaries via Google Gemini.
        </p>
        <nav
          aria-label="Social links"
          className="-ml-2 flex items-center gap-2 pt-2"
        >
          <a
            href="https://github.com/xrealblue/morg"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub"
            className="text-muted-foreground hover:text-foreground rounded-md p-2 transition-colors"
          >
            <Github className="size-5" />
          </a>
        </nav>
      </section>
    </div>
  );
}
