import type { ButtonHTMLAttributes } from 'react';
import styles from './Button.module.css';

export type ButtonVariant =
  | 'primary'
  | 'ghost'
  | 'danger'
  | 'danger-solid'
  | 'accent'
  | 'orange'
  | 'magic'
  | 'indigo'
  | 'success'
  | 'subtle'
  | 'link';

export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual style of the button. */
  variant?: ButtonVariant;
  /** Size preset. */
  size?: ButtonSize;
  /** Pill-shaped border radius. */
  pill?: boolean;
  /** Circular (icon-only) button. */
  circle?: boolean;
  /** Use condensed label font style. */
  label?: boolean;
  /** Full-width button. */
  fullWidth?: boolean;
  /** Dashed border style. */
  dashed?: boolean;
}

const variantClass: Record<ButtonVariant, string> = {
  primary: styles.variantPrimary,
  ghost: styles.variantGhost,
  danger: styles.variantDanger,
  'danger-solid': styles.variantDangerSolid,
  accent: styles.variantAccent,
  orange: styles.variantOrange,
  magic: styles.variantMagic,
  indigo: styles.variantIndigo,
  success: styles.variantSuccess,
  subtle: styles.variantSubtle,
  link: styles.variantLink,
};

const sizeClass: Record<ButtonSize, string> = {
  xs: styles.sizeXs,
  sm: styles.sizeSm,
  md: styles.sizeMd,
  lg: styles.sizeLg,
};

export const Button = ({
  variant = 'ghost',
  size = 'md',
  pill,
  circle,
  label,
  fullWidth,
  dashed,
  className,
  children,
  ...rest
}: ButtonProps) => {
  const cls = [
    styles.button,
    variantClass[variant],
    sizeClass[size],
    pill && styles.shapePill,
    circle && styles.shapeCircle,
    label && styles.labelStyle,
    fullWidth && styles.fullWidth,
    dashed && styles.dashed,
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
