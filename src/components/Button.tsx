import { cn } from '../lib/utils';
import { ButtonHTMLAttributes, forwardRef } from 'react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', ...props }, ref) => {
    return (
      <button
        className={cn(
          'inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
          'disabled:pointer-events-none disabled:opacity-50',
          variant === 'primary' && 'bg-slate-900 text-slate-50 hover:bg-slate-900/90 focus-visible:ring-slate-950',
          variant === 'secondary' && 'bg-slate-100 text-slate-900 hover:bg-slate-100/80 focus-visible:ring-slate-950',
          variant === 'danger' && 'bg-red-500 text-white hover:bg-red-600 focus-visible:ring-red-500',
          variant === 'success' && 'bg-success-600 text-white hover:bg-success-700 focus-visible:ring-success-500',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';

export { Button };