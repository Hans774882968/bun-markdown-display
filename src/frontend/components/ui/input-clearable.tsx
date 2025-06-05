import * as React from 'react';
import { X } from 'lucide-react';
import { Input, InputProps } from './input';
import { cn } from '@/common/utils';

interface InputClearableProps extends InputProps {
  defaultValue?: string
  onClear?: () => void
  wrapperClassName?: string
}

const InputClearable = React.forwardRef<HTMLInputElement, InputClearableProps>(
  ({ defaultValue, onClear, wrapperClassName, ...props }, ref) => {
    // 判断是否为受控组件
    const isControlled = typeof props.value !== 'undefined';
    const hasDefaultValue = typeof defaultValue !== 'undefined';

    // 只有在非受控模式下才使用内部状态
    const [internalValue, setInternalValue] = React.useState(hasDefaultValue ? defaultValue : '');

    // 使用受控值或内部状态值
    const value = isControlled ? props.value : internalValue;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      // 总是调用外部onChange
      if (props.onChange) {
        props.onChange(e);
      }

      // 只在非受控模式下更新内部状态
      if (!isControlled) {
        setInternalValue(e.target.value);
      }
    };

    const handleClear = () => {
      if (onClear) onClear();

      // 只在非受控模式下更新内部状态
      if (!isControlled) {
        setInternalValue(defaultValue || '');
      }

      // 触发onChange事件
      if (props.onChange) {
        const syntheticEvent = {
          target: { value: defaultValue || '' },
        } as React.ChangeEvent<HTMLInputElement>;
        props.onChange(syntheticEvent);
      }
    };

    return (
      <div className={cn('relative', wrapperClassName)}>
        <Input
          {...props}
          value={value}
          onChange={handleChange}
          ref={ref}
        />
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-sm p-1 opacity-50 hover:opacity-100 focus:outline-none"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }
);

InputClearable.displayName = 'InputClearable';

export { InputClearable };
