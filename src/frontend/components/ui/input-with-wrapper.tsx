import { cn } from '@/common/utils';
import { Input, InputProps } from './input';

interface InputWithWrapperProps extends InputProps {
  wrapperClassName?: string
}

export default function InputWithWrapper({
  children,
  wrapperClassName,
  ...props
}: InputWithWrapperProps) {
  return (
    <div className={cn('relative', wrapperClassName)}>
      <Input {...props}>
        {children}
      </Input>
    </div>
  );
}
