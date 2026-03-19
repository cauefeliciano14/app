import type { ButtonHTMLAttributes } from 'react';
import styles from './Button.module.css';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual style of the button. */
  variant?: 'primary' | 'ghost' | 'danger' | 'accent';
  /** Size preset. */
  size?: 'sm' | 'md';
}

const variantClass: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary: styles.variantPrimary,
  ghost: styles.variantGhost,
  danger: styles.variantDanger,
  accent: styles.variantAccent,
};

const sizeClass: Record<NonNullable<ButtonProps['size']>, string> = {
  sm: styles.sizeSm,
  md: styles.sizeMd,
};

export const Button = ({
  variant = 'ghost',
  size = 'md',
  className,
  children,
  ...rest
}: ButtonProps) => {
  const cls = [
    styles.button,
    variantClass[variant],
    sizeClass[size],
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button className={cls} {...rest}>
      {children}
    </button>
  );
};
