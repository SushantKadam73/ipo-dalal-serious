"use client";

import { useState } from "react";
import { FrontendIPO } from "@/types/database";
import { IPOBadge } from "@/components/common/ipo_badge";
import { GMPIndicator } from "@/components/common/gmp_indicator";
import { formatIndianCurrency, formatIndianDate } from "@/lib/formatters";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LiveIPOsTableProps {
  data: FrontendIPO[];
  loading?: boolean;
  onRowClick?: (ipo: FrontendIPO) => void;
  className?: string;
}

type SortField = "type" | "company" | "ipoSize" | "gmp.percentage" | "dates.closing";

export function LiveIPOsTable({
  data,
  loading = false,
  onRowClick,
  className
}: LiveIPOsTableProps) {
  
  const [sortField, setSortField] = useState<SortField>("dates.closing");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return <ArrowUpDown className="w-4 h-4" />;
    return sortDirection === "asc" ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />;
  };

  const getNestedValue = (obj: unknown, path: string): unknown => {
    return path.split('.').reduce((value: unknown, key: string) => 
      value && typeof value === 'object' && key in value 
        ? (value as Record<string, unknown>)[key] 
        : undefined, obj);
  };

  const sortedData = [...data].sort((a, b) => {
    const aValue = getNestedValue(a, sortField);
    const bValue = getNestedValue(b, sortField);
    
    if (aValue === bValue) return 0;
    
    // Handle different types for sorting
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      const comparison = aValue.localeCompare(bValue);
      return sortDirection === "asc" ? comparison : -comparison;
    }
    
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      const comparison = aValue - bValue;
      return sortDirection === "asc" ? comparison : -comparison;
    }
    
    // Fallback for other types
    const aStr = String(aValue);
    const bStr = String(bValue);
    const comparison = aStr.localeCompare(bStr);
    return sortDirection === "asc" ? comparison : -comparison;
  });

  if (loading) {
    return (
      <div className={className}>
        <div className="w-full overflow-x-auto">
          <table className="w-full data-table">
            <thead>
              <tr>
                {["Type", "Company", "Size (₹Cr)", "Lot", "Price (₹)", "Amount (₹)", "GMP", "Closing", "Allotment", "Refund", "Listing"].map((header) => (
                  <th key={header} className="p-3 text-left font-bold border-b border-border bg-muted">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[...Array(5)].map((_, index) => (
                <tr key={index}>
                  {[...Array(11)].map((_, cellIndex) => (
                    <td key={cellIndex} className="p-3 border-b border-border/50">
                      <div className="h-4 bg-muted rounded animate-pulse" />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className={className}>
        <div className="w-full overflow-x-auto">
          <table className="w-full data-table">
            <thead>
              <tr>
                {["Type", "Company", "Size (₹Cr)", "Lot", "Price (₹)", "Amount (₹)", "GMP", "Closing", "Allotment", "Refund", "Listing"].map((header) => (
                  <th key={header} className="p-3 text-left font-bold border-b border-border bg-muted">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={11} className="text-center py-8 text-muted-foreground">
                  No active IPOs available
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="w-full overflow-x-auto">
        <table className="w-full data-table">
          <thead>
            <tr>
              <th className="p-3 text-left font-bold border-b border-border bg-muted">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort("type")}
                  className="h-auto p-0 font-bold hover:bg-transparent"
                >
                  <div className="flex items-center gap-2">
                    Type
                    {getSortIcon("type")}
                  </div>
                </Button>
              </th>
              <th className="p-3 text-left font-bold border-b border-border bg-muted">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort("company")}
                  className="h-auto p-0 font-bold hover:bg-transparent"
                >
                  <div className="flex items-center gap-2">
                    Company
                    {getSortIcon("company")}
                  </div>
                </Button>
              </th>
              <th className="p-3 text-right font-bold border-b border-border bg-muted">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort("ipoSize")}
                  className="h-auto p-0 font-bold hover:bg-transparent"
                >
                  <div className="flex items-center gap-2">
                    Size (₹Cr)
                    {getSortIcon("ipoSize")}
                  </div>
                </Button>
              </th>
              <th className="p-3 text-center font-bold border-b border-border bg-muted">
                Lot
              </th>
              <th className="p-3 text-center font-bold border-b border-border bg-muted">
                Price (₹)
              </th>
              <th className="p-3 text-right font-bold border-b border-border bg-muted">
                Amount (₹)
              </th>
              <th className="p-3 text-center font-bold border-b border-border bg-muted">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort("gmp.percentage")}
                  className="h-auto p-0 font-bold hover:bg-transparent"
                >
                  <div className="flex items-center gap-2">
                    GMP
                    {getSortIcon("gmp.percentage")}
                  </div>
                </Button>
              </th>
              <th className="p-3 text-center font-bold border-b border-border bg-muted">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort("dates.closing")}
                  className="h-auto p-0 font-bold hover:bg-transparent"
                >
                  <div className="flex items-center gap-2">
                    Closing
                    {getSortIcon("dates.closing")}
                  </div>
                </Button>
              </th>
              <th className="p-3 text-center font-bold border-b border-border bg-muted">
                Allotment
              </th>
              <th className="p-3 text-center font-bold border-b border-border bg-muted">
                Refund
              </th>
              <th className="p-3 text-center font-bold border-b border-border bg-muted">
                Listing
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedData.map((ipo) => (
              <tr
                key={ipo.id}
                onClick={() => onRowClick?.(ipo)}
                className={`border-b border-border/50 hover:bg-muted/30 ${
                  onRowClick ? "cursor-pointer" : ""
                }`}
              >
                <td className="p-3">
                  <IPOBadge type={ipo.type} />
                </td>
                
                <td className="p-3">
                  <div className="flex flex-col">
                    <span className="font-medium text-foreground">
                      {ipo.company}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {ipo.industry}
                    </span>
                  </div>
                </td>
                
                <td className="p-3 text-right">
                  <span className="font-medium">
                    {formatIndianCurrency(ipo.ipoSize, { showCrores: true, compact: true })}
                  </span>
                </td>
                
                <td className="p-3 text-center">
                  <span className="text-sm">
                    {ipo.lot.toLocaleString()}
                  </span>
                </td>
                
                <td className="p-3 text-center">
                  <div className="flex flex-col">
                    <span className="text-sm">
                      ₹{ipo.price.min} - ₹{ipo.price.max}
                    </span>
                  </div>
                </td>
                
                <td className="p-3 text-right">
                  <div className="flex flex-col">
                    <span className="font-medium text-sm">
                      {formatIndianCurrency(ipo.amount.retail, { compact: true })}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatIndianCurrency(ipo.amount.shni, { compact: true })}
                    </span>
                  </div>
                </td>
                
                <td className="p-3 text-center">
                  <GMPIndicator
                    percentage={ipo.gmp.percentage}
                    price={ipo.gmp.price}
                    size="sm"
                  />
                </td>
                
                <td className="p-3 text-center">
                  <span className="text-sm">
                    {formatIndianDate(ipo.dates.closing)}
                  </span>
                </td>
                
                <td className="p-3 text-center">
                  <span className="text-sm text-muted-foreground">
                    {formatIndianDate(ipo.dates.allotment)}
                  </span>
                </td>
                
                <td className="p-3 text-center">
                  <span className="text-sm text-muted-foreground">
                    {formatIndianDate(ipo.dates.refund)}
                  </span>
                </td>
                
                <td className="p-3 text-center">
                  <span className="text-sm text-muted-foreground">
                    {formatIndianDate(ipo.dates.listing)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}