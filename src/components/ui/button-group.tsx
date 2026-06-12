'use client';

import * as React from 'react';

import { cn } from '~/lib/utils';

interface ButtonGroupContextValue {
  value: string;
  onValueChange: (value: string) => void;
}

const ButtonGroupContext = React.createContext<ButtonGroupContextValue | null>(
  null
);

function useButtonGroupContext() {
  const ctx = React.useContext(ButtonGroupContext);
  if (!ctx) throw new Error('ButtonGroupItem must be inside ButtonGroup');
  return ctx;
}

interface ButtonGroupProps {
  value: string;
  onValueChange: (value: string) => void;
  className?: string;
  children: React.ReactNode;
}

function ButtonGroup({
  value,
  onValueChange,
  className,
  children,
}: ButtonGroupProps) {
  const ctx = React.useMemo(
    () => ({ value, onValueChange }),
    [value, onValueChange]
  );
  return (
    <ButtonGroupContext.Provider value={ctx}>
      <div
        className={cn(
          'bg-muted inline-flex items-center rounded-md p-0.5',
          className
        )}
      >
        {children}
      </div>
    </ButtonGroupContext.Provider>
  );
}

interface ButtonGroupItemProps {
  value: string;
  className?: string;
  children: React.ReactNode;
}

function ButtonGroupItem({ value, className, children }: ButtonGroupItemProps) {
  const ctx = useButtonGroupContext();
  const selected = ctx.value === value;
  return (
    <button
      type="button"
      data-state={selected ? 'on' : 'off'}
      className={cn(
        'inline-flex items-center justify-center rounded-sm px-2 py-1 text-xs transition-colors',
        selected
          ? 'bg-background text-foreground shadow-xs'
          : 'text-muted-foreground hover:text-foreground',
        className
      )}
      onClick={() => ctx.onValueChange(value)}
    >
      {children}
    </button>
  );
}

export { ButtonGroup, ButtonGroupItem };
