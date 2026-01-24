import {ReactNode} from 'react';

interface BadgeProps {
  children: ReactNode;
  color?: string;
  className?: string;
}

export function Badge({children, color, className = ''}: BadgeProps) {
  const style = color ? {backgroundColor: color} : {};

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white ${className}`}
      style={style}
    >
      {children}
    </span>
  );
}
