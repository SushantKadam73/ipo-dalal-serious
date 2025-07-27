"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { TableColumn, SortOptions } from "@/types/ipo";
import { cn } from "@/lib/utils";

interface DataTableProps<T> {
  data: T[];
  columns: TableColumn[];
  onRowClick?: (item: T) => void;
  sortable?: boolean;
  loading?: boolean;
  className?: string;
  emptyMessage?: string;
}

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  onRowClick,
  sortable = true,
  loading = false,
  className,
  emptyMessage = "No data available"
}: DataTableProps<T>) {
  const [sortOptions, setSortOptions] = useState<SortOptions | null>(null);

  const handleSort = (field: string) => {
    if (!sortable) return;

    setSortOptions(prev => {
      if (prev?.field === field) {
        return {
          field: field as any,
          direction: prev.direction === "asc" ? "desc" : "asc"
        };
      }
      return {
        field: field as any,
        direction: "asc"
      };
    });
  };

  const getSortedData = () => {
    if (!sortOptions) return data;

    return [...data].sort((a, b) => {
      const aValue = getNestedValue(a, sortOptions.field);
      const bValue = getNestedValue(b, sortOptions.field);

      if (aValue === bValue) return 0;

      const comparison = aValue < bValue ? -1 : 1;
      return sortOptions.direction === "asc" ? comparison : -comparison;
    });
  };

  const getNestedValue = (obj: any, path: string) => {
    return path.split('.').reduce((value, key) => value?.[key], obj);
  };

  const getSortIcon = (field: string) => {
    if (!sortOptions || sortOptions.field !== field) {
      return <ArrowUpDown className="w-4 h-4" />;
    }
    return sortOptions.direction === "asc" 
      ? <ArrowUp className="w-4 h-4" />
      : <ArrowDown className="w-4 h-4" />;
  };

  const renderCellValue = (item: T, column: TableColumn) => {
    const value = getNestedValue(item, column.key);
    
    // Handle different data types
    if (value === null || value === undefined) return "-";
    if (typeof value === "boolean") return value ? "Yes" : "No";
    if (typeof value === "number") return value.toLocaleString();
    if (value instanceof Date) return value.toLocaleDateString();
    
    return String(value);
  };

  if (loading) {
    return (
      <div className={cn("w-full", className)}>
        <Table className="data-table">
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead key={column.key} style={{ width: column.width }}>
                  <div className="flex items-center gap-2">
                    {column.label}
                    {sortable && column.sortable && (
                      <ArrowUpDown className="w-4 h-4 opacity-50" />
                    )}
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array(5)].map((_, index) => (
              <TableRow key={index}>
                {columns.map((column) => (
                  <TableCell key={column.key}>
                    <div className="h-4 bg-muted rounded animate-pulse" />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className={cn("w-full", className)}>
        <Table className="data-table">
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead key={column.key} style={{ width: column.width }}>
                  {column.label}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell 
                colSpan={columns.length} 
                className="text-center py-8 text-muted-foreground"
              >
                {emptyMessage}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    );
  }

  const sortedData = getSortedData();

  return (
    <div className={cn("w-full overflow-auto", className)}>
      <Table className="data-table">
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead 
                key={column.key} 
                style={{ width: column.width }}
                className={cn(
                  column.align === "center" && "text-center",
                  column.align === "right" && "text-right"
                )}
              >
                {sortable && column.sortable ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSort(column.key)}
                    className="h-auto p-0 font-bold hover:bg-transparent"
                  >
                    <div className="flex items-center gap-2">
                      {column.label}
                      {getSortIcon(column.key)}
                    </div>
                  </Button>
                ) : (
                  column.label
                )}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedData.map((item, index) => (
            <TableRow
              key={index}
              onClick={() => onRowClick?.(item)}
              className={cn(
                onRowClick && "cursor-pointer hover:bg-muted/50"
              )}
            >
              {columns.map((column) => (
                <TableCell
                  key={column.key}
                  className={cn(
                    column.align === "center" && "text-center",
                    column.align === "right" && "text-right"
                  )}
                >
                  {renderCellValue(item, column)}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}