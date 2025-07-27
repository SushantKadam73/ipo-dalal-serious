"use client";

import { useState } from "react";
import { ListedIPO } from "@/types/ipo";
import { IPOBadge } from "@/components/common/ipo-badge";
import { formatIndianCurrency, formatIndianDate, formatPercentage } from "@/lib/formatters";
import { TrendingUp, TrendingDown, Minus, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ListedIPOsTableProps {
  data: ListedIPO[];
  loading?: boolean;
  onRowClick?: (ipo: ListedIPO) => void;
  className?: string;
}

type SortField = "type" | "company" | "symbol" | "ipoSize" | "listingPrice" | "listingGains" | "listingDate";

export function ListedIPOsTable({
  data,
  loading = false,
  onRowClick,
  className
}: ListedIPOsTableProps) {
  
  const [sortField, setSortField] = useState<SortField>("listingDate");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return <ArrowUpDown className="w-4 h-4" />;
    return sortDirection === "asc" ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />;
  };

  const getNestedValue = (obj: any, path: string) => {
    return path.split('.').reduce((value, key) => value?.[key], obj);
  };

  const sortedData = [...data].sort((a, b) => {
    const aValue = getNestedValue(a, sortField);
    const bValue = getNestedValue(b, sortField);
    
    if (aValue === bValue) return 0;
    const comparison = aValue < bValue ? -1 : 1;
    return sortDirection === "asc" ? comparison : -comparison;
  });

  const getListingGainsColor = (gains: number) => {
    if (gains > 0) return "text-green-500";
    if (gains < 0) return "text-red-500";
    return "text-muted-foreground";
  };

  const getListingGainsIcon = (gains: number) => {
    if (gains > 0) return <TrendingUp className="w-4 h-4" />;
    if (gains < 0) return <TrendingDown className="w-4 h-4" />;
    return <Minus className="w-4 h-4" />;
  };

  if (loading) {
    return (
      <div className={className}>
        <div className="w-full overflow-x-auto">
          <table className="w-full data-table">
            <thead>
              <tr>
                {["Type", "Company", "Symbol", "Size (₹Cr)", "Price (₹)", "Listing Price (₹)", "Listing Gains", "GMP vs Actual", "Profit (₹)", "Listed On"].map((header) => (
                  <th key={header} className="p-3 text-left font-bold border-b border-border bg-muted">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[...Array(5)].map((_, index) => (
                <tr key={index}>
                  {[...Array(10)].map((_, cellIndex) => (
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
                {["Type", "Company", "Symbol", "Size (₹Cr)", "Price (₹)", "Listing Price (₹)", "Listing Gains", "GMP vs Actual", "Profit (₹)", "Listed On"].map((header) => (
                  <th key={header} className="p-3 text-left font-bold border-b border-border bg-muted">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={10} className="text-center py-8 text-muted-foreground">
                  No listed IPOs available
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
              <th className="p-3 text-center font-bold border-b border-border bg-muted">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort("symbol")}
                  className="h-auto p-0 font-bold hover:bg-transparent"
                >
                  <div className="flex items-center gap-2">
                    Symbol
                    {getSortIcon("symbol")}
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
                Price (₹)
              </th>
              <th className="p-3 text-right font-bold border-b border-border bg-muted">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort("listingPrice")}
                  className="h-auto p-0 font-bold hover:bg-transparent"
                >
                  <div className="flex items-center gap-2">
                    Listing Price (₹)
                    {getSortIcon("listingPrice")}
                  </div>
                </Button>
              </th>
              <th className="p-3 text-center font-bold border-b border-border bg-muted">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort("listingGains")}
                  className="h-auto p-0 font-bold hover:bg-transparent"
                >
                  <div className="flex items-center gap-2">
                    Listing Gains
                    {getSortIcon("listingGains")}
                  </div>
                </Button>
              </th>
              <th className="p-3 text-center font-bold border-b border-border bg-muted">
                GMP vs Actual
              </th>
              <th className="p-3 text-right font-bold border-b border-border bg-muted">
                Profit (₹)
              </th>
              <th className="p-3 text-center font-bold border-b border-border bg-muted">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort("listingDate")}
                  className="h-auto p-0 font-bold hover:bg-transparent"
                >
                  <div className="flex items-center gap-2">
                    Listed On
                    {getSortIcon("listingDate")}
                  </div>
                </Button>
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
                
                <td className="p-3 text-center">
                  <span className="font-mono text-sm">
                    {ipo.symbol || "-"}
                  </span>
                </td>
                
                <td className="p-3 text-right">
                  <span className="font-medium">
                    {formatIndianCurrency(ipo.ipoSize, { showCrores: true, compact: true })}
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
                  <span className="font-bold text-lg">
                    ₹{ipo.listingPrice}
                  </span>
                </td>
                
                <td className="p-3 text-center">
                  <div className={`flex items-center justify-center gap-1 ${getListingGainsColor(ipo.listingGains)}`}>
                    {getListingGainsIcon(ipo.listingGains)}
                    <span className="font-bold">
                      {ipo.listingGains >= 0 ? "+" : ""}{formatPercentage(ipo.listingGains)}
                    </span>
                  </div>
                </td>
                
                <td className="p-3 text-center">
                  <div className="flex flex-col">
                    <span className="text-xs text-muted-foreground">
                      GMP: {formatPercentage(ipo.gmp.percentage)}
                    </span>
                    <span className="text-xs">
                      {Math.abs(ipo.listingGains - ipo.gmp.percentage) < 5 ? "✅ Accurate" : "❌ Off"}
                    </span>
                  </div>
                </td>
                
                <td className="p-3 text-right">
                  <div className="flex flex-col">
                    <span className={`font-medium text-sm ${
                      ipo.actualProfit!.retail >= 0 ? "text-green-500" : "text-red-500"
                    }`}>
                      {formatIndianCurrency(ipo.actualProfit!.retail, { compact: true })}
                    </span>
                    <span className={`text-xs ${
                      ipo.actualProfit!.shni >= 0 ? "text-green-500" : "text-red-500"
                    }`}>
                      {formatIndianCurrency(ipo.actualProfit!.shni, { compact: true })}
                    </span>
                  </div>
                </td>
                
                <td className="p-3 text-center">
                  <span className="text-sm text-muted-foreground">
                    {formatIndianDate(ipo.listingDate)}
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