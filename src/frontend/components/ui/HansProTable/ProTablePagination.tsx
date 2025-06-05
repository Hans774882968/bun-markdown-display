import {
  Table as ReactTableType,
} from '@tanstack/react-table';
import { Button } from '@/frontend/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/frontend/components/ui/select';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { DEFAULT_PAGE_SIZE_OPTIONS } from '../../../utils/const';
import { getPageNumbers } from '../../../utils/getPageNumbers';
import { Dispatch, SetStateAction } from 'react';

interface ProTablePaginationProps<TData> {
  defaultPageSizeOptions?: number[]
  pageIndex: number
  pageSize: number
  setPageSize: Dispatch<SetStateAction<number>>
  table: ReactTableType<TData>
}

export default function ProTablePagination<TData>({
  defaultPageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
  pageIndex,
  pageSize,
  setPageSize,
  table,
}: ProTablePaginationProps<TData>) {
  const totalPages = table.getPageCount();
  const currentPage = pageIndex + 1;
  const totalItems = table.getFilteredRowModel().rows.length;
  const shouldDisablePreviousPageButton = !table.getCanPreviousPage();
  const shouldDisableNextPageButton = !table.getCanNextPage();

  return (
    <div className="rounded-lg border p-4 flex items-center justify-end gap-16">
      <div className="flex items-center space-x-6">
        <div className="flex items-center space-x-2">
          <p className="text-sm font-medium">每页显示</p>
          <Select
            value={pageSize.toString()}
            onValueChange={(value) => {
              setPageSize(Number(value));
              table.setPageSize(Number(value));
            }}
          >
            <SelectTrigger className="h-8 w-17.5">
              <SelectValue placeholder={pageSize.toString()} />
            </SelectTrigger>
            <SelectContent side="top">
              {
                defaultPageSizeOptions.map((size) => (
                  <SelectItem key={size} value={size.toString()}>
                    {size}
                  </SelectItem>
                ))
              }
            </SelectContent>
          </Select>
          <p className="text-sm font-medium">条</p>
        </div>
        <div className="text-sm text-muted-foreground">
          共 {totalItems} 条
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="icon"
          onClick={() => table.previousPage()}
          disabled={shouldDisablePreviousPageButton}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        {
          getPageNumbers(currentPage, totalPages).map(({ value: pageNum, key }) => {
            return (
              pageNum === '...' ? (
                <span key={key} className="px-2">...</span>
              ) : (
                <Button
                  key={key}
                  variant={currentPage === pageNum ? 'outline' : 'default'}
                  size="sm"
                  className="min-w-8"
                  onClick={() => table.setPageIndex(pageNum - 1)}
                >
                  {pageNum}
                </Button>
              )
            );
          }
          )
        }
        <Button
          variant="outline"
          size="icon"
          onClick={() => table.nextPage()}
          disabled={shouldDisableNextPageButton}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
