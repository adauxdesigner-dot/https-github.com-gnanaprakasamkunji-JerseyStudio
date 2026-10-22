import * as React from 'react';
import { ChevronUp, ChevronDown, ChevronsUpDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './Button';

export interface Column<T> {
  id: string;
  header: string;
  accessorKey?: keyof T;
  cell?: (item: T) => React.ReactNode;
  sortable?: boolean;
  align?: 'left' | 'center' | 'right';
  width?: string;
}

export interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T) => string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  onSort?: (columnId: string) => void;
  currentPage?: number;
  totalPages?: number;
  pageSize?: number;
  totalItems?: number;
  onPageChange?: (page: number) => void;
  emptyMessage?: string;
  isLoading?: boolean;
}

export function Table<T>({
  columns,
  data,
  keyExtractor,
  sortBy,
  sortOrder,
  onSort,
  currentPage = 1,
  totalPages = 1,
  pageSize = 10,
  totalItems = data.length,
  onPageChange,
  emptyMessage = 'No records found',
  isLoading = false,
}: TableProps<T>) {
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  return (
    <div className="flex flex-col w-full rounded-md border border-border bg-surface overflow-hidden shadow-sm">
      <div className="w-full overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-border bg-surface-subtle">
              {columns.map((column) => {
                const isCurrentSort = sortBy === column.id;
                return (
                  <th
                    key={column.id}
                    scope="col"
                    style={{ width: column.width }}
                    className={cn(
                      'py-2.5 px-3 font-semibold text-text-secondary select-none uppercase tracking-wider text-[11px]',
                      column.align === 'center' && 'text-center',
                      column.align === 'right' && 'text-right',
                      column.sortable && 'cursor-pointer hover:text-text-primary'
                    )}
                    onClick={() => {
                      if (column.sortable && onSort) {
                        onSort(column.id);
                      }
                    }}
                  >
                    <div
                      className={cn(
                        'inline-flex items-center gap-1.5',
                        column.align === 'center' && 'justify-center',
                        column.align === 'right' && 'justify-end'
                      )}
                    >
                      <span>{column.header}</span>
                      {column.sortable && (
                        <span className="text-text-muted">
                          {isCurrentSort ? (
                            sortOrder === 'asc' ? (
                              <ChevronUp className="w-3.5 h-3.5 text-primary" />
                            ) : (
                              <ChevronDown className="w-3.5 h-3.5 text-primary" />
                            )
                          ) : (
                            <ChevronsUpDown className="w-3.5 h-3.5 opacity-40 hover:opacity-100" />
                          )}
                        </span>
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="py-10 text-center text-text-muted"
                >
                  Loading data...
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="py-10 text-center text-text-muted"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((item) => (
                <tr
                  key={keyExtractor(item)}
                  className="hover:bg-surface-subtle/60 transition-colors group"
                >
                  {columns.map((column) => (
                    <td
                      key={column.id}
                      className={cn(
                        'py-2.5 px-3 text-text-primary whitespace-nowrap',
                        column.align === 'center' && 'text-center',
                        column.align === 'right' && 'text-right'
                      )}
                    >
                      {column.cell
                        ? column.cell(item)
                        : column.accessorKey
                        ? String(item[column.accessorKey] ?? '')
                        : null}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="flex items-center justify-between px-3 py-2 border-t border-border bg-surface-subtle/50 text-xs text-text-secondary select-none">
        <div className="tabular-nums">
          Showing <span className="font-medium text-text-primary">{startItem}</span> to{' '}
          <span className="font-medium text-text-primary">{endItem}</span> of{' '}
          <span className="font-medium text-text-primary">{totalItems}</span> entries
        </div>

        {onPageChange && totalPages > 1 && (
          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage <= 1}
              aria-label="Previous page"
              className="h-7 px-2"
            >
              <ChevronLeft className="w-3.5 h-3.5 mr-1" /> Prev
            </Button>
            <span className="px-2 text-text-primary tabular-nums">
              {currentPage} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
              aria-label="Next page"
              className="h-7 px-2"
            >
              Next <ChevronRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
