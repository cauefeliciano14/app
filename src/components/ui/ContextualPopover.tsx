import { useEffect, useId, useRef, useState, type ReactNode } from 'react';

interface ContextualPopoverProps {
  label: string;
  title?: string;
  children: ReactNode;
  variant?: 'icon' | 'chip';
  align?: 'left' | 'right';
}

export function ContextualPopover({
  label,
  title,
  children,
  variant = 'icon',
  align = 'left',
}: ContextualPopoverProps) {
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const popoverId = useId();

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

  const className = variant === 'chip' ? 'contextual-popover-trigger contextual-popover-trigger-chip' : 'contextual-popover-trigger';

  return (
    <div
      ref={rootRef}
      className={`contextual-popover ${align === 'right' ? 'align-right' : ''}`.trim()}
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <button
        type="button"
        className={className}
        aria-label={title ? `${label}: ${title}` : label}
        aria-expanded={isOpen}
        aria-describedby={isOpen ? popoverId : undefined}
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
        <div id={popoverId} role="tooltip" className="contextual-popover-panel">
          {title ? <div className="contextual-popover-title">{title}</div> : null}
          <div className="contextual-popover-body">{children}</div>
        </div>
      )}
    </div>
  );
}
