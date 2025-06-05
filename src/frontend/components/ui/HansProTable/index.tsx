import { useState } from 'react';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  ColumnFiltersState,
  getFilteredRowModel,
} from '@tanstack/react-table';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/frontend/components/ui/table';
import { DEFAULT_PAGE_SIZE_OPTIONS } from '../../../utils/const';
import { DEFAULT_PAGE_SIZE } from '../../../utils/const';
import ProTableSearchFields, { SearchFieldProps } from './ProTableSearchFields';
import ProTablePagination from './ProTablePagination';

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  defaultPageSize?: number
  defaultPageSizeOptions?: number[]
  // eslint-disable-next-line no-unused-vars
  onRowClick?: (row: TData) => void
  searchFields?: SearchFieldProps[]
  // eslint-disable-next-line no-unused-vars
  onSearch?: (value: string) => void
}

export function HansProTable<TData, TValue>({
  columns,
  data,
  defaultPageSize = DEFAULT_PAGE_SIZE,
  defaultPageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
  onRowClick,
  searchFields = [],
  onSearch,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [rowSelection, setRowSelection] = useState({});
  const [pageSize, setPageSize] = useState<number>(defaultPageSize);
  const [pageIndex, setPageIndex] = useState<number>(0);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onRowSelectionChange: setRowSelection,
    onPaginationChange: (updater) => {
      const newState = typeof updater === 'function' ? updater(table.getState().pagination) : updater;
      setPageIndex(newState.pageIndex);
      setPageSize(newState.pageSize);
    },
    state: {
      sorting,
      columnFilters,
      rowSelection,
      pagination: {
        pageSize,
        pageIndex,
      },
    },
  });

  return (
    <div className="space-y-4">
      <ProTableSearchFields
        searchFields={searchFields}
        onSearch={onSearch}
        table={table}
      />
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                  onClick={() => onRowClick?.(row.original)}
                  className={onRowClick ? 'cursor-pointer' : ''}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  暂无数据
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <ProTablePagination
        defaultPageSizeOptions={defaultPageSizeOptions}
        pageIndex={pageIndex}
        pageSize={pageSize}
        setPageSize={setPageSize}
        table={table}
      />
    </div>
  );
}
