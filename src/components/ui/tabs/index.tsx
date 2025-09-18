import React from 'react';
import { cn } from '../../../lib/cn';

// Simple, accessible Tabs (uncontrolled or controlled)
// Usage:
// <Tabs defaultValue="tab1">
//   <TabsList>
//     <TabsTrigger value="tab1">Tab 1</TabsTrigger>
//     <TabsTrigger value="tab2">Tab 2</TabsTrigger>
//   </TabsList>
//   <TabsContent value="tab1">Content 1</TabsContent>
//   <TabsContent value="tab2">Content 2</TabsContent>
// </Tabs>

export type TabsProps = {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  className?: string;
  children?: React.ReactNode;
};

type Ctx = {
  value: string | undefined;
  setValue: (v: string) => void;
  registerTrigger: (el: HTMLButtonElement | null, value: string) => void;
  unregisterTrigger: (value: string) => void;
};

const TabsContext = React.createContext<Ctx | null>(null);

export function Tabs({
  value,
  defaultValue,
  onValueChange,
  className,
  children,
}: TabsProps) {
  const isControlled = value !== undefined;
  const [inner, setInner] = React.useState<string | undefined>(defaultValue);
  const selected = isControlled ? value : inner;

  const triggersRef = React.useRef<Map<string, HTMLButtonElement | null>>(
    new Map()
  );

  const setValue = React.useCallback(
    (v: string) => {
      if (!isControlled) setInner(v);
      onValueChange?.(v);
    },
    [isControlled, onValueChange]
  );

  const registerTrigger = React.useCallback(
    (el: HTMLButtonElement | null, v: string) => {
      triggersRef.current.set(v, el);
    },
    []
  );
  const unregisterTrigger = React.useCallback((v: string) => {
    triggersRef.current.delete(v);
  }, []);

  return (
    <TabsContext.Provider
      value={{ value: selected, setValue, registerTrigger, unregisterTrigger }}
    >
      <div className={cn('w-full', className)}>{children}</div>
    </TabsContext.Provider>
  );
}

export type TabsListProps = React.HTMLAttributes<HTMLDivElement> & {
  orientation?: 'horizontal' | 'vertical';
};
export function TabsList({
  className,
  orientation = 'horizontal',
  ...props
}: TabsListProps) {
  return (
    <div
      role='tablist'
      aria-orientation={orientation}
      className={cn(
        'flex gap-1 overflow-x-auto',
        orientation === 'vertical' ? 'flex-col' : 'flex-row',
        className
      )}
      {...props}
    />
  );
}

export type TabsTriggerProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  value: string;
};
export function TabsTrigger({
  className,
  value,
  onClick,
  onKeyDown,
  ...props
}: TabsTriggerProps) {
  const ctx = React.useContext(TabsContext);
  if (!ctx) throw new Error('TabsTrigger must be used within <Tabs>');
  const { value: selected, setValue, registerTrigger, unregisterTrigger } = ctx;
  const ref = React.useRef<HTMLButtonElement | null>(null);

  React.useEffect(() => {
    registerTrigger(ref.current, value);
    return () => unregisterTrigger(value);
  }, [registerTrigger, unregisterTrigger, value]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    onKeyDown?.(e);
    if (e.defaultPrevented) return;
    const current = ref.current;
    if (!current) return;
    const list = current.closest('[role="tablist"]');
    if (!list) return;
    const tabs = Array.from(
      list.querySelectorAll<HTMLButtonElement>('[role="tab"]')
    );
    const idx = tabs.indexOf(current);
    if (idx < 0) return;

    let nextIdx = idx;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown')
      nextIdx = (idx + 1) % tabs.length;
    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp')
      nextIdx = (idx - 1 + tabs.length) % tabs.length;
    if (nextIdx !== idx) {
      e.preventDefault();
      const next = tabs[nextIdx];
      next?.focus();
      const nextVal = next?.getAttribute('data-value');
      if (nextVal) setValue(nextVal);
    }
  };

  return (
    <button
      ref={ref}
      role='tab'
      type='button'
      data-value={value}
      aria-selected={selected === value}
      aria-controls={`panel-${value}`}
      className={cn(
        'px-3 py-1.5 rounded-md text-sm font-medium transition focus:outline-none focus-visible:ring-2 ring-brand-500 whitespace-nowrap',
        selected === value
          ? 'bg-blue-500/10 text-blue-700 border border-blue-300/60 shadow-sm'
          : 'text-zinc-600 hover:text-zinc-800 hover:bg-transparent',
        className
      )}
      onClick={e => {
        onClick?.(e);
        if (!e.defaultPrevented) setValue(value);
      }}
      onKeyDown={handleKeyDown}
      {...props}
    />
  );
}

export type TabsContentProps = React.HTMLAttributes<HTMLDivElement> & {
  value: string;
  keepMounted?: boolean;
};
export function TabsContent({
  className,
  value,
  keepMounted = false,
  ...props
}: TabsContentProps) {
  const ctx = React.useContext(TabsContext);
  if (!ctx) throw new Error('TabsContent must be used within <Tabs>');
  const selected = ctx.value;
  const hidden = selected !== value;

  if (!keepMounted && hidden) return null;

  return (
    <div
      role='tabpanel'
      id={`panel-${value}`}
      aria-labelledby={`tab-${value}`}
      hidden={hidden}
      className={cn('mt-3', className)}
      {...props}
    />
  );
}

Tabs.List = TabsList;
Tabs.Trigger = TabsTrigger;
Tabs.Content = TabsContent;

export default Tabs;
