import {ReactNode} from 'react';
import {motion} from 'motion/react';
import {cn} from '@/lib/utils';

interface CardProps {
  children: ReactNode;
  className?: string;
  padding?: 'none' | 'small' | 'medium' | 'large';
  hover?: boolean;
  variant?: 'solid' | 'glass';
}

export function Card({
  children,
  className = '',
  padding = 'medium',
  hover = true,
  variant = 'glass',
}: CardProps) {
  const paddingClasses = {
    none: '',
    small: 'p-4',
    medium: 'p-6',
    large: 'p-8',
  };

  const variantClasses = {
    solid: 'bg-white dark:bg-gray-800 shadow-md',
    glass: 'glass',
  };

  const hoverClass = hover ? 'hover:shadow-lg' : '';

  return (
    <motion.div
      initial={{opacity: 0, y: 10}}
      animate={{opacity: 1, y: 0}}
      className={cn(
        'rounded-xl transition-all duration-200',
        variantClasses[variant],
        paddingClasses[padding],
        hoverClass,
        className,
      )}
    >
      {children}
    </motion.div>
  );
}
