import type { ReactNode } from 'react';

export type ContainerSize = 'default' | 'narrow';

const sizeClasses: Record<ContainerSize, string> = {
  default: 'max-w-6xl',
  narrow: 'max-w-3xl',
};

export function Container({
  children,
  size = 'default',
  className = '',
}: {
  children: ReactNode;
  size?: ContainerSize;
  className?: string;
}) {
  return (
    <div className={`mx-auto w-full ${sizeClasses[size]} px-6 md:px-10 ${className}`}>{children}</div>
  );
}
