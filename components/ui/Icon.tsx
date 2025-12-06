import { LucideIcon, LucideProps } from 'lucide-react';

interface IconProps extends Omit<LucideProps, 'ref'> {
  icon: LucideIcon;
  // 默认属性
  size?: string | number;
  strokeWidth?: number;
  // 预设尺寸
  preset?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

const sizePresets = {
  xs: 'w-3 h-3',
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
  xl: 'w-8 h-8',
};

export function Icon({
  icon: LucideIconComponent,
  className,
  size = 24,
  strokeWidth = 2,
  preset,
  ...props
}: IconProps) {
  const sizeClass = preset ? sizePresets[preset] : '';

  return (
    <LucideIconComponent
      className={`${sizeClass} flex-shrink-0 ${className || ''}`}
      size={preset ? undefined : size}
      strokeWidth={strokeWidth}
      {...props}
    />
  );
}