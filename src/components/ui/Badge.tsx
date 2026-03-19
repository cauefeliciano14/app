import styles from './Badge.module.css';

export interface BadgeProps {
  /** Visual variant of the badge. */
  variant?: 'warning' | 'info';
}

const variantClass: Record<NonNullable<BadgeProps['variant']>, string> = {
  warning: styles.variantWarning,
  info: styles.variantInfo,
};

const variantContent: Record<NonNullable<BadgeProps['variant']>, string> = {
  warning: '!',
  info: 'i',
};

export const Badge = ({ variant = 'warning' }: BadgeProps) => {
  return (
    <span
      className={`${styles.badge} ${variantClass[variant]}`}
      aria-hidden="true"
    >
      {variantContent[variant]}
    </span>
  );
};
