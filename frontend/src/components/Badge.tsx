import type { ReactNode } from 'react';
import './Badge.css';

interface BadgeProps {
  tone?: 'neutral' | 'success' | 'danger' | 'warning' | 'accent';
  children: ReactNode;
}

export function Badge({ tone = 'neutral', children }: BadgeProps) {
  return (
    <span className={`badge badge--${tone} mono-label`}>
      {children}
    </span>
  );
}
