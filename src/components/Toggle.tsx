import { cn } from '../lib/utils';
import { InputHTMLAttributes, forwardRef } from 'react';

export interface ToggleProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

const Toggle = forwardRef<HTMLInputElement, ToggleProps>(
  ({ className, label, ...props }, ref) => {
    return (
      <label className="flex items-center space-x-2 cursor-pointer">
        <input
          type="checkbox"
          className={cn(
            'toggle-input appearance-none w-11 h-6 rounded-full bg-gray-200 cursor-pointer',
            'relative transition-colors duration-200 ease-in-out',
            'checked:bg-slate-900 focus-visible:ring-1 focus-visible:ring-slate-950',
            'after:content-[""] after:absolute after:top-0.5 after:left-0.5',
            'after:bg-white after:w-5 after:h-5 after:rounded-full',
            'after:shadow-sm after:transition-transform after:duration-200',
            'checked:after:translate-x-full',
            className
          )}
          ref={ref}
          {...props}
        />
        <span className="text-sm font-medium text-slate-700">{label}</span>
      </label>
    );
  }
);

Toggle.displayName = 'Toggle';

export { Toggle };