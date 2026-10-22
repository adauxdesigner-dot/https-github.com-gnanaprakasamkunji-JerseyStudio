import * as React from 'react';
import { cn } from '@/lib/utils';
import { AlertCircle } from 'lucide-react';

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  errorMessage?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  wrapperClassName?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type = 'text',
      label,
      helperText,
      errorMessage,
      leftIcon,
      rightIcon,
      id: customId,
      disabled,
      wrapperClassName,
      ...props
    },
    ref
  ) => {
    const generatedId = React.useId();
    const id = customId || generatedId;
    const hasError = Boolean(errorMessage);

    return (
      <div className={cn('flex flex-col gap-1.5 w-full', wrapperClassName)}>
        {label && (
          <label
            htmlFor={id}
            className="text-xs font-medium text-text-primary select-none flex items-center justify-between"
          >
            <span>{label}</span>
          </label>
        )}

        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-2.5 flex items-center pointer-events-none text-text-muted">
              {leftIcon}
            </div>
          )}

          <input
            id={id}
            type={type}
            ref={ref}
            disabled={disabled}
            aria-invalid={hasError}
            aria-describedby={
              hasError
                ? `${id}-error`
                : helperText
                ? `${id}-helper`
                : undefined
            }
            className={cn(
              'h-9 w-full rounded-sm border bg-surface px-3 py-1.5 text-sm text-text-primary transition-colors',
              'placeholder:text-text-muted',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-transparent',
              'disabled:cursor-not-allowed disabled:bg-surface-subtle disabled:text-text-muted',
              hasError
                ? 'border-error focus-visible:ring-error/40 pr-8'
                : 'border-border hover:border-border-hover',
              leftIcon && 'pl-8',
              rightIcon && !hasError && 'pr-8',
              className
            )}
            {...props}
          />

          {hasError ? (
            <div className="absolute right-2.5 pointer-events-none text-error">
              <AlertCircle className="w-4 h-4" />
            </div>
          ) : (
            rightIcon && (
              <div className="absolute right-2.5 flex items-center text-text-muted">
                {rightIcon}
              </div>
            )
          )}
        </div>

        {hasError && (
          <p id={`${id}-error`} className="text-xs text-error font-normal mt-0.5">
            {errorMessage}
          </p>
        )}

        {!hasError && helperText && (
          <p id={`${id}-helper`} className="text-xs text-text-secondary mt-0.5">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
