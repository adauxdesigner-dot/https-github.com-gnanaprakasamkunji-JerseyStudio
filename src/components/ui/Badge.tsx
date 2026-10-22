import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

export const badgeVariants = cva(
  'inline-flex items-center gap-1 font-medium select-none transition-colors tabular-nums',
  {
    variants: {
      variant: {
        default:
          'bg-surface-subtle text-text-secondary border border-border',
        primary:
          'bg-primary-subtle text-primary border border-primary/20',
        success:
          'bg-success-subtle text-success border border-success/20',
        warning:
          'bg-warning-subtle text-warning border border-warning/20',
        error:
          'bg-error-subtle text-error border border-error/20',
        outline:
          'bg-transparent text-text-primary border border-border',
      },
      size: {
        sm: 'text-[11px] px-1.5 py-0.5 rounded-sm',
        md: 'text-xs px-2 py-0.5 rounded-sm',
        lg: 'text-xs px-2.5 py-1 rounded-md font-semibold',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  dot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant,
  size,
  dot,
  children,
  ...props
}) => {
  return (
    <span className={cn(badgeVariants({ variant, size, className }))} {...props}>
      {dot && (
        <span
          className={cn(
            'w-1.5 h-1.5 rounded-full',
            variant === 'primary' && 'bg-primary',
            variant === 'success' && 'bg-success',
            variant === 'warning' && 'bg-warning',
            variant === 'error' && 'bg-error',
            (!variant || variant === 'default' || variant === 'outline') &&
              'bg-text-secondary'
          )}
        />
      )}
      {children}
    </span>
  );
};
