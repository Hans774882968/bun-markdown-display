import {
  Table as ReactTableType,
} from '@tanstack/react-table';
import {
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/frontend/components/ui/select';
import { DEFAULT_PLACEHOLDERS } from '../../../utils/const';
import { SelectClearable } from '../select-clearable';
import { InputClearable } from '../input-clearable';
import InputWithWrapper from '../input-with-wrapper';
import SelectWithWrapper from '../select-with-wrapper';

type BaseSearchField = {
  clearable: boolean;
  key: string;
  label: string;
  placeholder?: string;
};

type InputSearchField = BaseSearchField & {
  type: 'input';
};

type SelectOption = {
  label: string;
  value: string;
};

type SelectSearchField = BaseSearchField & {
  type: 'select';
  options: SelectOption[];
  defaultValue?: string;
};

export type SearchFieldProps = InputSearchField | SelectSearchField;

interface SearchFieldsProps<TData> {
  searchFields?: SearchFieldProps[]
  // eslint-disable-next-line no-unused-vars
  onSearch?: (value: string) => void
  table: ReactTableType<TData>
}

function ProTableSearchFields<TData>({
  searchFields = [],
  onSearch,
  table,
}: SearchFieldsProps<TData>) {
  return (
    <div className="rounded-lg border p-4 grid grid-cols-3 gap-4">
      {
        searchFields.map((searchField) => {
          const { clearable, key, label, type } = searchField;
          const searchPlaceholder = searchField.placeholder || DEFAULT_PLACEHOLDERS[type];
          const currentColumnFilterValue = table.getColumn(key)?.getFilterValue() as string;
          const InputComponent = clearable ? InputClearable : InputWithWrapper;
          const SelectComponent = clearable ? SelectClearable : SelectWithWrapper;

          return (
            <div key={key} className="flex items-center gap-4">
              <label htmlFor={label} className="flex-1 text-end">{label}</label>
              {
                type === 'input' && (
                  <InputComponent
                    placeholder={searchPlaceholder}
                    value={currentColumnFilterValue || ''}
                    onChange={(event) => {
                      table.getColumn(key)?.setFilterValue(event.target.value);
                      onSearch?.(event.target.value);
                    }}
                    className="flex-2 max-w-sm"
                    wrapperClassName="flex-2 flex"
                  />
                )
              }
              {
                type === 'select' && (
                  <SelectComponent
                    value={currentColumnFilterValue ?? searchField.defaultValue ?? ''}
                    onValueChange={(value) => {
                      table.getColumn(key)?.setFilterValue(value);
                      onSearch?.(value);
                    }}
                    wrapperClassName="flex-2 flex"
                  >
                    <SelectTrigger className="flex-2 max-w-sm">
                      <SelectValue placeholder={searchPlaceholder} />
                    </SelectTrigger>
                    <SelectContent>
                      {searchField.options.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </SelectComponent>
                )
              }
            </div>
          );
        })
      }
    </div>
  );
}

export default ProTableSearchFields;
