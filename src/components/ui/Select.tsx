import * as React from 'react';
import { cn } from '@/lib/utils';
import { ChevronDown, AlertCircle } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  helperText?: string;
  errorMessage?: string;
  options: SelectOption[];
  placeholder?: string;
  wrapperClassName?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      className,
      label,
      helperText,
      errorMessage,
      options,
      placeholder,
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
            className="text-xs font-medium text-text-primary select-none"
          >
            {label}
          </label>
        )}

        <div className="relative flex items-center">
          <select
            id={id}
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
              'h-9 w-full appearance-none rounded-sm border bg-surface px-3 py-1.5 pr-8 text-sm text-text-primary transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-transparent',
              'disabled:cursor-not-allowed disabled:bg-surface-subtle disabled:text-text-muted',
              hasError
                ? 'border-error focus-visible:ring-error/40'
                : 'border-border hover:border-border-hover',
              className
            )}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option
                key={option.value}
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </option>
            ))}
          </select>

          <div className="pointer-events-none absolute right-2.5 flex items-center text-text-muted">
            {hasError ? (
              <AlertCircle className="w-4 h-4 text-error" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </div>
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

Select.displayName = 'Select';
