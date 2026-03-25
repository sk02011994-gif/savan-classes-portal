import { clsx } from 'clsx';
import { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

const variants = {
  primary: 'bg-primary text-slate-900 hover:bg-primary-dark font-semibold',
  secondary: 'bg-surface-2 text-white hover:bg-slate-600',
  danger: 'bg-red-600 text-white hover:bg-red-700',
  ghost: 'bg-transparent text-slate-300 hover:bg-surface-2',
};

const sizes = {
  sm: 'px-3 py-1.5 text-xs rounded-lg',
  md: 'px-4 py-2.5 text-sm rounded-xl',
  lg: 'px-6 py-3 text-base rounded-xl',
};

export function Button({ variant = 'primary', size = 'md', className, disabled, children, ...props }: ButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled}
      className={clsx(
        'transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        className
      )}
    >
      {children}
    </button>
  );
}
