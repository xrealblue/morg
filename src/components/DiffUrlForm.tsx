'use client';

import { useRouter } from 'next/navigation';
import { type FormEvent, type ReactNode, useEffect, useRef, useState, useTransition } from 'react';

import { cn } from '~/lib/utils';

const GITHUB_URL_PATTERN = /^https?:\/\/github\.com\/([\w.-]+\/[\w.-]+(?:\/[^\s]*)?)$/;
const BARE_PATH_PATTERN = /^([\w.-]+\/[\w.-]+(?:\/[^\s]*)?)$/;

function parseUrl(input: string): string | undefined {
  const trimmed = input.trim();
  if (!trimmed) return undefined;

  const githubMatch = GITHUB_URL_PATTERN.exec(trimmed);
  if (githubMatch) return `/${githubMatch[1]}`;

  const bareMatch = BARE_PATH_PATTERN.exec(trimmed);
  if (bareMatch) return `/${bareMatch[1]}`;

  return undefined;
}

interface DiffUrlFormProps {
  className?: string;
  initialUrl?: string;
  inputClassName?: string;
  onUrlChange?: (url: string) => void;
  placeholder?: string;
  children?: (isPending: boolean, url: string) => ReactNode;
}

export function DiffUrlForm({
  className,
  initialUrl = '',
  inputClassName,
  onUrlChange,
  placeholder = 'https://github.com/org/repo',
  children,
}: DiffUrlFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [url, setURL] = useState(initialUrl);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setURL(initialUrl);
  }, [initialUrl]);

  useEffect(() => {
    onUrlChange?.(url);
  }, [onUrlChange, url]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalizedURL = url.trim();
    const path = parseUrl(normalizedURL);
    if (path == null) return;
    startTransition(() => {
      router.push(path);
    });
  };

  return (
    <form
      className={cn('flex min-w-0 items-center gap-1', className)}
      noValidate
      onSubmit={handleSubmit}
    >
      <input
        ref={inputRef}
        className={cn(
          'bg-transparent text-sm outline-none placeholder:text-[var(--muted-foreground)]',
          inputClassName
        )}
        enterKeyHint="go"
        value={url}
        type="text"
        onChange={({ currentTarget }) => setURL(currentTarget.value)}
        onBlur={() => {
          if (url.trim() === '') setURL(initialUrl);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Escape') {
            setURL(initialUrl);
            inputRef.current?.blur();
          }
        }}
        placeholder={placeholder}
      />
      {children?.(isPending, url)}
      <button type="submit" hidden />
    </form>
  );
}
