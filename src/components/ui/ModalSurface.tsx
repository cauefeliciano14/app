import type { HTMLAttributes, ReactNode } from 'react';

interface ModalSurfaceProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function ModalSurface({ children, className = '', ...props }: ModalSurfaceProps) {
  return (
    <div
      {...props}
      className={`app-modal-surface ${className}`.trim()}
    >
      {children}
    </div>
  );
}
