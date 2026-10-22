import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combines class names with Tailwind merge support to safely handle overrides.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Format numbers with unit display
 */
export function formatDimension(value: number, unit: 'in' | 'cm' | 'mm' | 'px'): string {
  if (unit === 'px') {
    return `${Math.round(value)} px`;
  }
  return `${value.toFixed(2)} ${unit}`;
}
