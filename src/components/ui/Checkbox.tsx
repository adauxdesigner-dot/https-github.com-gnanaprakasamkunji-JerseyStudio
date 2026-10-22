import * as React from 'react';
import { Check, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  description?: string;
  indeterminate?: boolean;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      className,
      label,
      description,
      checked,
      indeterminate,
      disabled,
      id: customId,
      onChange,
      ...props
    },
    ref
  ) => {
    const generatedId = React.useId();
    const id = customId || generatedId;
    const inputRef = React.useRef<HTMLInputElement | null>(null);

    React.useEffect(() => {
      if (inputRef.current) {
        inputRef.current.indeterminate = Boolean(indeterminate);
      }
    }, [indeterminate]);

    const isChecked = Boolean(checked) || Boolean(indeterminate);

    return (
      <label
        htmlFor={id}
        className={cn(
          'inline-flex items-start gap-2.5 cursor-pointer select-none group',
          disabled && 'cursor-not-allowed opacity-60',
          className
        )}
      >
        <div className="relative flex items-center justify-center pt-0.5">
          <input
            id={id}
            type="checkbox"
            ref={(node) => {
              inputRef.current = node;
              if (typeof ref === 'function') {
                ref(node);
              } else if (ref) {
                ref.current = node;
              }
            }}
            checked={checked}
            disabled={disabled}
            onChange={onChange}
            className="sr-only peer"
            {...props}
          />
          <div
            className={cn(
              'w-4 h-4 rounded-sm border transition-colors flex items-center justify-center',
              'border-border bg-surface text-surface group-hover:border-border-hover',
              'peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-1',
              isChecked && 'bg-primary border-primary text-text-inverted',
              disabled && 'bg-surface-subtle border-border cursor-not-allowed'
            )}
          >
            {indeterminate ? (
              <Minus className="w-3 h-3 stroke-[3]" />
            ) : checked ? (
              <Check className="w-3 h-3 stroke-[3]" />
            ) : null}
          </div>
        </div>

        {(label || description) && (
          <div className="flex flex-col">
            {label && (
              <span className="text-xs font-medium text-text-primary leading-tight">
                {label}
              </span>
            )}
            {description && (
              <span className="text-xs text-text-secondary mt-0.5 leading-normal">
                {description}
              </span>
            )}
          </div>
        )}
      </label>
    );
  }
);

Checkbox.displayName = 'Checkbox';
