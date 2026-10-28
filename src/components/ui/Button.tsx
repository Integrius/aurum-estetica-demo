import Link from 'next/link';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'primary' | 'outline';

const baseClasses =
  'inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-medium tracking-wide transition-colors duration-200';

const variantClasses: Record<Variant, string> = {
  primary: 'bg-terracotta text-white hover:bg-charcoal',
  outline: 'border border-charcoal text-charcoal hover:bg-charcoal hover:text-white',
};

interface BaseProps {
  children: ReactNode;
  variant?: Variant;
  className?: string;
}

interface LinkButtonProps extends BaseProps {
  href: string;
  onClick?: never;
  type?: never;
}

interface ActionButtonProps
  extends BaseProps,
    Pick<
      ButtonHTMLAttributes<HTMLButtonElement>,
      'onClick' | 'type' | 'aria-label' | 'aria-busy' | 'disabled'
    > {
  href?: never;
}

type ButtonProps = LinkButtonProps | ActionButtonProps;

export function Button({ children, variant = 'primary', className = '', ...rest }: ButtonProps) {
  const classes = `${baseClasses} ${variantClasses[variant]} ${className}`;

  if ('href' in rest && rest.href) {
    return (
      <Link href={rest.href} className={classes}>
        {children}
      </Link>
    );
  }

  const {
    onClick,
    type,
    'aria-label': ariaLabel,
    'aria-busy': ariaBusy,
    disabled,
  } = rest as ActionButtonProps;
  return (
    <button
      type={type ?? 'button'}
      onClick={onClick}
      aria-label={ariaLabel}
      aria-busy={ariaBusy}
      disabled={disabled}
      className={`${classes} disabled:cursor-not-allowed disabled:opacity-60`}
    >
      {children}
    </button>
  );
}
