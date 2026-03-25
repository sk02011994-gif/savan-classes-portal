import { clsx } from 'clsx';

type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'default';

const variants: Record<BadgeVariant, string> = {
  success: 'bg-green-900/40 text-green-400 border-green-800',
  warning: 'bg-amber-900/40 text-amber-400 border-amber-800',
  danger: 'bg-red-900/40 text-red-400 border-red-800',
  info: 'bg-blue-900/40 text-blue-400 border-blue-800',
  default: 'bg-slate-700/40 text-slate-300 border-slate-600',
};

export function Badge({ children, variant = 'default' }: { children: React.ReactNode; variant?: BadgeVariant }) {
  return (
    <span className={clsx('inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border', variants[variant])}>
      {children}
    </span>
  );
}
