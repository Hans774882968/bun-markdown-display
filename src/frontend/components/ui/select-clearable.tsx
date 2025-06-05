import * as React from 'react';
import { X } from 'lucide-react';
import { Select, SelectProps } from './select';
import { cn } from '@/common/utils';

interface SelectClearableProps extends SelectProps {
  defaultValue?: string
  onClear?: () => void
  wrapperClassName?: string
}

function SelectClearable({
  children,
  defaultValue,
  onClear,
  wrapperClassName,
  ...props
}: SelectClearableProps) {
  // 判断是否为受控组件
  const isControlled = typeof props.value !== 'undefined';
  const hasDefaultValue = typeof defaultValue !== 'undefined';

  // 只有在非受控模式下才使用内部状态
  const [internalValue, setInternalValue] = React.useState(hasDefaultValue ? defaultValue : '');

  // 使用受控值或内部状态值
  const value = isControlled ? props.value : internalValue;

  const handleChange = (newValue: string) => {
    // 总是调用外部onValueChange
    if (props.onValueChange) {
      props.onValueChange(newValue);
    }

    // 只在非受控模式下更新内部状态
    if (!isControlled) {
      setInternalValue(newValue);
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();

    // 只在非受控模式下更新内部状态
    if (!isControlled) {
      setInternalValue(defaultValue || '');
    }

    if (onClear) onClear();
    if (props.onValueChange) {
      props.onValueChange(defaultValue || '');
    }
  };

  return (
    <div className={cn('relative', wrapperClassName)}>
      <Select {...props} value={value} onValueChange={handleChange}>
        {children}
      </Select>
      <button
        type="button"
        onClick={handleClear}
        className="absolute right-8 top-1/2 -translate-y-1/2 rounded-sm p-1 opacity-50 hover:opacity-100 focus:outline-none"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

SelectClearable.displayName = 'SelectClearable';

export { SelectClearable };
