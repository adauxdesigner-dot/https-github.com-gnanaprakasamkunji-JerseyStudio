import * as React from 'react';
import { cn } from '@/lib/utils';

export interface SwitchProps {
  id?: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  label?: string;
  description?: string;
  className?: string;
}

export const Switch: React.FC<SwitchProps> = ({
  id: customId,
  checked,
  onCheckedChange,
  disabled = false,
  label,
  description,
  className,
}) => {
  const generatedId = React.useId();
  const id = customId || generatedId;

  return (
    <div className={cn('flex items-start justify-between gap-3', className)}>
      {(label || description) && (
        <label
          htmlFor={id}
          className={cn(
            'flex flex-col cursor-pointer select-none',
            disabled && 'cursor-not-allowed opacity-60'
          )}
        >
          {label && (
            <span className="text-xs font-medium text-text-primary">
              {label}
            </span>
          )}
          {description && (
            <span className="text-xs text-text-secondary mt-0.5">
              {description}
            </span>
          )}
        </label>
      )}

      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onCheckedChange(!checked)}
        className={cn(
          'relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1',
          'disabled:cursor-not-allowed disabled:opacity-50',
          checked ? 'bg-primary' : 'bg-border'
        )}
      >
        <span
          className={cn(
            'pointer-events-none inline-block h-4 w-4 transform rounded-full bg-surface shadow-sm ring-0 transition duration-200 ease-in-out',
            checked ? 'translate-x-4' : 'translate-x-0'
          )}
        />
      </button>
    </div>
  );
};
