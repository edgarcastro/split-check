import { ComponentProps } from 'react';
import { Button as ShadcnButton } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type ShadcnButtonProps = ComponentProps<typeof ShadcnButton>;

interface ButtonProps extends Omit<ShadcnButtonProps, 'variant'> {
  variant?: 'primary' | 'secondary' | 'danger';
  fullWidth?: boolean;
}

const variantMap = {
  primary: 'default',
  secondary: 'outline',
  danger: 'destructive',
} as const;

export function Button({
  variant = 'primary',
  fullWidth = false,
  className,
  ...props
}: ButtonProps) {
  return (
    <ShadcnButton
      variant={variantMap[variant]}
      className={cn(fullWidth && 'w-full', className)}
      {...props}
    />
  );
}
