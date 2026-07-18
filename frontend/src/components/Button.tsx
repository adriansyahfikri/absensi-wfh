import type { ButtonHTMLAttributes, ReactNode } from 'react';
import './Button.css';

type ButtonState = 'idle' | 'loading' | 'error' | 'success';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  state?: ButtonState;
  children: ReactNode;
}

export function Button({
  variant = 'primary',
  state = 'idle',
  disabled,
  children,
  className,
  ...rest
}: ButtonProps) {
  return (
    <button
      className={['btn', `btn--${variant}`, className].filter(Boolean).join(' ')}
      data-state={state}
      disabled={disabled || state === 'loading'}
      {...rest}
    >
      {state === 'loading' ? <span className="btn__spinner" aria-hidden="true" /> : null}
      <span className="btn__label">{children}</span>
    </button>
  );
}
