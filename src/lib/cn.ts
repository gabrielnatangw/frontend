import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge conditional classnames with Tailwind conflict resolution.
 * Usage: cn("px-2", condition && "bg-brand-500", props.className)
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
