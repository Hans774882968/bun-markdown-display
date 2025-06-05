import { cn } from '@/common/utils';
import { Select, SelectProps } from './select';

interface SelectWithWrapperProps extends SelectProps {
  wrapperClassName?: string
}

export default function SelectWithWrapper({
  children,
  wrapperClassName,
  ...props
}: SelectWithWrapperProps) {
  return (
    <div className={cn('relative', wrapperClassName)}>
      <Select {...props}>
        {children}
      </Select>
    </div>
  );
}
