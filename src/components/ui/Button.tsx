import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export const buttonVariants = cva(
  'inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 disabled:opacity-50 disabled:pointer-events-none select-none active:scale-[0.98]',
  {
    variants: {
      variant: {
        primary:
          'bg-primary text-text-inverted hover:bg-primary-hover shadow-sm',
        secondary:
          'bg-surface-subtle text-text-primary hover:bg-surface-muted border border-border',
        outline:
          'bg-surface text-text-primary border border-border hover:bg-surface-subtle',
        ghost:
          'text-text-primary hover:bg-surface-subtle hover:text-text-primary',
        destructive:
          'bg-error text-text-inverted hover:bg-error-hover shadow-sm',
        subtleDestructive:
          'bg-error-subtle text-error hover:bg-error/20 border border-error/30',
      },
      size: {
        sm: 'h-8 px-3 text-xs rounded-sm gap-1.5',
        md: 'h-9 px-4 text-sm rounded-sm gap-2',
        lg: 'h-11 px-5 text-base rounded-md gap-2.5',
        icon: 'h-8 w-8 p-0 rounded-sm',
        'icon-sm': 'h-7 w-7 p-0 rounded-sm',
        'icon-lg': 'h-10 w-10 p-0 rounded-md',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      isLoading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size, className }))}
        disabled={disabled || isLoading}
        aria-busy={isLoading}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin text-current" />
        ) : (
          leftIcon
        )}
        {children}
        {!isLoading && rightIcon}
      </button>
    );
  }
);

Button.displayName = 'Button';
