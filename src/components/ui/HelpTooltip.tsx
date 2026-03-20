import { useEffect, useId, useRef, useState, type ReactNode } from 'react';

interface HelpTooltipProps {
  label: string;
  title?: string;
  children: ReactNode;
  variant?: 'icon' | 'chip';
  align?: 'left' | 'right';
}

export function HelpTooltip({
  label,
  title,
  children,
  variant = 'icon',
  align = 'left',
}: HelpTooltipProps) {
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const tooltipId = useId();

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  const triggerClassName = variant === 'chip' ? 'help-tooltip-trigger help-tooltip-trigger-chip' : 'help-tooltip-trigger';

  return (
    <div
      ref={rootRef}
      className={`help-tooltip ${align === 'right' ? 'align-right' : ''}`.trim()}
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <button
        type="button"
        className={triggerClassName}
        aria-label={title ? `${label}: ${title}` : label}
        aria-expanded={isOpen}
        aria-describedby={isOpen ? tooltipId : undefined}
        onClick={() => setIsOpen((current) => !current)}
        onFocus={() => setIsOpen(true)}
        onBlur={(event) => {
          if (!rootRef.current?.contains(event.relatedTarget as Node | null)) {
            setIsOpen(false);
          }
        }}
      >
        {variant === 'chip' ? label : '?'}
      </button>

      {isOpen && (
        <div id={tooltipId} role="tooltip" className="help-tooltip-panel">
          {title ? <div className="help-tooltip-title">{title}</div> : null}
          <div className="help-tooltip-body">{children}</div>
        </div>
      )}
    </div>
  );
}
