import { SelectHTMLAttributes, forwardRef } from 'react';
import { cn } from '../lib/utils';

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, ...props }, ref) => {
    return (
      <select
        className={cn(
          'flex h-9 w-full rounded-md border border-slate-200 bg-white px-3 py-1 text-sm',
          'shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium',
          'placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-1',
          'focus-visible:ring-slate-950 disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);

Select.displayName = 'Select';

export { Select };