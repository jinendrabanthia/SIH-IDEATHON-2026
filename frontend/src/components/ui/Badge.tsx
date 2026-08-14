import React from 'react';
import { cn } from '../../lib/utils';

export type BadgeVariant =
  | 'default'
  | 'secondary'
  | 'destructive'
  | 'outline'
  | 'success'
  | 'live'
  | 'warning'
  | 'disputed'
  | 'inferred';

const variantClasses: Record<BadgeVariant, string> = {
  default: 'border-transparent bg-slate-900 text-slate-50 shadow-sm hover:bg-slate-900/80',
  secondary: 'border-transparent bg-slate-100 text-slate-900 hover:bg-slate-100/80',
  destructive: 'border-transparent bg-red-500 text-white shadow-sm hover:bg-red-500/80',
  outline: 'text-slate-950 border-slate-200',
  success: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  live: 'border-emerald-400 bg-emerald-500 text-white animate-pulse',
  warning: 'border-amber-200 bg-amber-50 text-amber-800',
  disputed: 'border-rose-300 bg-rose-50 text-rose-800',
  inferred: 'border-blue-200 bg-blue-50 text-blue-800',
};

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: BadgeVariant;
}

export const Badge: React.FC<BadgeProps> = ({ className, variant = 'default', ...props }) => {
  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2',
        variantClasses[variant] || variantClasses.default,
        className
      )}
      {...props}
    />
  );
};
