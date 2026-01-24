import {ReactNode} from 'react';

interface ContainerProps {
  children: ReactNode;
  className?: string;
}

export function Container({children, className = ''}: ContainerProps) {
  return (
    <div className={`container mx-auto px-4 py-8 max-w-7xl ${className}`}>
      {children}
    </div>
  );
}
