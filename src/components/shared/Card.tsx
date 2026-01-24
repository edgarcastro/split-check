import {ReactNode} from 'react';
import {motion} from 'motion/react';

interface CardProps {
  children: ReactNode;
  className?: string;
  padding?: 'none' | 'small' | 'medium' | 'large';
  hover?: boolean;
}

export function Card({
  children,
  className = '',
  padding = 'medium',
  hover = true,
}: CardProps) {
  const paddingClasses = {
    none: '',
    small: 'p-4',
    medium: 'p-6',
    large: 'p-8',
  };

  const hoverClass = hover ? 'hover:shadow-lg' : '';

  return (
    <motion.div
      initial={{opacity: 0, y: 10}}
      animate={{opacity: 1, y: 0}}
      className={`bg-white rounded-xl shadow-md transition-shadow duration-200 ${paddingClasses[padding]} ${hoverClass} ${className}`}
    >
      {children}
    </motion.div>
  );
}
