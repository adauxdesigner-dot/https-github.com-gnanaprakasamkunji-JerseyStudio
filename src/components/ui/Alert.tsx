import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import {
  Info,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export const alertVariants = cva(
  'relative w-full rounded-md border p-3 flex gap-3 text-sm transition-all',
  {
    variants: {
      variant: {
        info: 'bg-primary-subtle/50 border-primary/20 text-text-primary [&>svg]:text-primary',
        success: 'bg-success-subtle/70 border-success/30 text-text-primary [&>svg]:text-success',
        warning: 'bg-warning-subtle/70 border-warning/30 text-text-primary [&>svg]:text-warning',
        error: 'bg-error-subtle/70 border-error/30 text-text-primary [&>svg]:text-error',
        danger: 'bg-error-subtle/70 border-error/30 text-text-primary [&>svg]:text-error',
      },
    },
    defaultVariants: {
      variant: 'info',
    },
  }
);

const iconMap = {
  info: Info,
  success: CheckCircle2,
  warning: AlertTriangle,
  error: AlertCircle,
  danger: AlertCircle,
};

export interface AlertProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertVariants> {
  title?: string;
  description?: React.ReactNode;
  onDismiss?: () => void;
}

export const Alert: React.FC<AlertProps> = ({
  className,
  variant = 'info',
  title,
  description,
  children,
  onDismiss,
  ...props
}) => {
  const Icon = iconMap[variant || 'info'];

  return (
    <div
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    >
      <Icon className="w-5 h-5 shrink-0 mt-0.5" />
      <div className="flex-1 pr-2">
        {title && (
          <h5 className="font-semibold text-xs tracking-tight text-text-primary mb-0.5">
            {title}
          </h5>
        )}
        <div className="text-xs text-text-secondary leading-relaxed">
          {description || children}
        </div>
      </div>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="text-text-muted hover:text-text-primary rounded-sm p-1 transition-colors self-start focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          aria-label="Dismiss alert"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
