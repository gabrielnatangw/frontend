import { tv, type TV } from 'tailwind-variants';

/**
 * Preconfigured tailwind-variants with twMerge enabled by default.
 * Usage:
 *   const button = tvc({
 *     base: "inline-flex items-center justify-center rounded px-3 py-2",
 *     variants: {
 *       color: {
 *         primary: "bg-brand-500 text-white hover:bg-brand-600",
 *         ghost: "bg-transparent text-foreground hover:bg-muted-100",
 *       },
 *       size: { sm: "h-8 text-sm", md: "h-10 text-base" },
 *     },
 *     defaultVariants: { color: "primary", size: "md" },
 *   });
 */
export const tvc: TV = (config => tv({ ...config })) as TV;

export type { VariantProps } from 'tailwind-variants';
