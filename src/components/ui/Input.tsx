import { clsx } from 'clsx';
import { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, className, ...props }: InputProps) {
  return (
    <div className="w-full">
      {label && <label className="block text-xs font-medium text-slate-300 mb-1.5">{label}</label>}
      <input
        {...props}
        className={clsx(
          'w-full bg-background border border-slate-700 focus:border-primary rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition-colors',
          error && 'border-red-500',
          className
        )}
      />
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  );
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: { value: string; label: string }[];
}

export function Select({ label, options, className, ...props }: SelectProps) {
  return (
    <div className="w-full">
      {label && <label className="block text-xs font-medium text-slate-300 mb-1.5">{label}</label>}
      <select
        {...props}
        className={clsx(
          'w-full bg-background border border-slate-700 focus:border-primary rounded-xl px-4 py-2.5 text-sm text-white outline-none transition-colors',
          className
        )}
      >
        {options.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}
