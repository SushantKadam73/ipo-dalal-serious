"use client";

import { useState } from "react";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { IPOBadge } from "@/components/common/ipo_badge";
import { GMPIndicator } from "@/components/common/gmp_indicator";
import { RefreshCw, Download, ArrowUpDown, ArrowUp, ArrowDown, Database, AlertCircle } from "lucide-react";
import { useGMPAggregatorData, useIPODataRefresh } from "@/hooks/useIPOData";
import { formatIndianCurrency, formatIndianDate, formatSubscriptionTimes } from "@/lib/formatters";

type SortField = "type" | "company" | "ipoSize" | "gmp.percentage" | "subscription.total" | "dates.closing";

export default function GMPAggregator() {
  const [sortField, setSortField] = useState<SortField>("dates.closing");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  // Use real database hooks
  const { data: ipos, isLoading } = useGMPAggregatorData();
  const { seedAllData } = useIPODataRefresh();
  const hasData = ipos && ipos.length > 0;

  const handleRefresh = async () => {
    window.location.reload();
  };

  const handleSeedDatabase = async () => {
    try {
      console.log("Seeding database...");
      const result = await seedAllData();
      if (result.success) {
        console.log("Database seeded successfully");
      } else {
        console.error("Database seeding failed:", result.error);
      }
    } catch (error) {
      console.error("Error seeding database:", error);
    }
  };

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

  const sortedIPOs = (ipos || []).sort((a, b) => {
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
    return sortDirection === "asc" ? comparison : -comparison;
  });

  const exportToCSV = () => {
    const csvContent = [
      ["Type", "Company", "Size (₹Cr)", "Price (₹)", "GMP %", "Est. Listing Price (₹)", "Est. Profit (₹)", "Kostak Rates (₹)", "Subject 2 Sauda Rates (₹)", "Total Subscription", "Closing Date"].join(","),
      ...sortedIPOs.map(ipo => [
        ipo.type,
        `"${ipo.company}"`,
        ipo.ipoSize,
        `"₹${ipo.price.min} - ₹${ipo.price.max}"`,
        ipo.gmp.percentage,
        ipo.gmp.estListingPrice,
        `"${formatIndianCurrency(ipo.gmp.estProfit.retail)} / ${formatIndianCurrency(ipo.gmp.estProfit.shni)}"`,
        `"₹${ipo.kostakRates.retail} / ₹${ipo.kostakRates.shni}"`,
        `"₹${ipo.subjectToSauda.retail} / ₹${ipo.subjectToSauda.shni}"`,
        ipo.subscription.total,
        formatIndianDate(ipo.dates.closing)
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `ipo-gmp-data-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold font-heading text-foreground mb-2">
              GMP Aggregator
            </h1>
            <p className="text-muted-foreground">
              Comprehensive Grey Market Premium data for all IPOs
            </p>
          </div>
          
          <div className="flex items-center gap-2 mt-4 md:mt-0">
            {!hasData && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleSeedDatabase}
                disabled={isLoading}
                className="flex items-center gap-2"
              >
                <Database className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
                Seed Database
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={exportToCSV}
              disabled={!hasData}
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* GMP Data Table */}
        <Card>
          <CardHeader>
            <CardTitle>IPO GMP Data</CardTitle>
            <CardDescription>
              Grey Market Premium data with kostak rates, subject to sauda rates, and subscription details
            </CardDescription>
          </CardHeader>
          <CardContent>
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
                      Price (₹)
                    </th>
                    <th className="p-3 text-center font-bold border-b border-border bg-muted">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSort("gmp.percentage")}
                        className="h-auto p-0 font-bold hover:bg-transparent"
                      >
                        <div className="flex items-center gap-2">
                          GMP %
                          {getSortIcon("gmp.percentage")}
                        </div>
                      </Button>
                    </th>
                    <th className="p-3 text-center font-bold border-b border-border bg-muted">
                      Est. Listing Price (₹)
                    </th>
                    <th className="p-3 text-right font-bold border-b border-border bg-muted">
                      Est. Profit (₹)
                    </th>
                    <th className="p-3 text-center font-bold border-b border-border bg-muted">
                      Kostak Rates (₹)
                    </th>
                    <th className="p-3 text-center font-bold border-b border-border bg-muted">
                      Subject 2 Sauda Rates (₹)
                    </th>
                    <th className="p-3 text-center font-bold border-b border-border bg-muted">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSort("subscription.total")}
                        className="h-auto p-0 font-bold hover:bg-transparent"
                      >
                        <div className="flex items-center gap-2">
                          Total Subscription
                          {getSortIcon("subscription.total")}
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
                          Closing Date
                          {getSortIcon("dates.closing")}
                        </div>
                      </Button>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    [...Array(5)].map((_, index) => (
                      <tr key={index}>
                        {[...Array(11)].map((_, cellIndex) => (
                          <td key={cellIndex} className="p-3 border-b border-border/50">
                            <div className="h-4 bg-muted rounded animate-pulse" />
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : !hasData ? (
                    <tr>
                      <td colSpan={11} className="text-center py-8">
                        <div className="flex flex-col items-center gap-4">
                          <AlertCircle className="w-12 h-12 text-muted-foreground" />
                          <div>
                            <p className="text-lg font-medium text-muted-foreground mb-2">No Data Available</p>
                            <p className="text-sm text-muted-foreground mb-4">
                              Click &quot;Seed Database&quot; to populate with sample IPO data
                            </p>
                            <Button onClick={handleSeedDatabase} className="flex items-center gap-2">
                              <Database className="w-4 h-4" />
                              Seed Database
                            </Button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    sortedIPOs.map((ipo) => (
                      <tr key={ipo.id} className="border-b border-border/50 hover:bg-muted/30">
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
                            ₹{ipo.price.min} - ₹{ipo.price.max}
                          </span>
                        </td>
                        
                        <td className="p-3 text-center">
                          <GMPIndicator
                            percentage={ipo.gmp.percentage}
                            price={ipo.gmp.price}
                            size="sm"
                          />
                        </td>
                        
                        <td className="p-3 text-center">
                          <span className="font-bold text-primary">
                            ₹{ipo.gmp.estListingPrice}
                          </span>
                        </td>
                        
                        <td className="p-3 text-right">
                          <div className="flex flex-col">
                            <span className={`font-medium text-sm ${
                              ipo.gmp.estProfit.retail >= 0 ? "text-green-500" : "text-red-500"
                            }`}>
                              {formatIndianCurrency(ipo.gmp.estProfit.retail, { compact: true })}
                            </span>
                            <span className={`text-xs ${
                              ipo.gmp.estProfit.shni >= 0 ? "text-green-500" : "text-red-500"
                            }`}>
                              {formatIndianCurrency(ipo.gmp.estProfit.shni, { compact: true })}
                            </span>
                          </div>
                        </td>
                        
                        <td className="p-3 text-center">
                          <div className="flex flex-col">
                            <span className="text-sm">
                              ₹{ipo.kostakRates.retail}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              ₹{ipo.kostakRates.shni}
                            </span>
                          </div>
                        </td>
                        
                        <td className="p-3 text-center">
                          <div className="flex flex-col">
                            <span className="text-sm">
                              ₹{ipo.subjectToSauda.retail}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              ₹{ipo.subjectToSauda.shni}
                            </span>
                          </div>
                        </td>
                        
                        <td className="p-3 text-center">
                          <span className="font-medium">
                            {formatSubscriptionTimes(ipo.subscription.total)}
                          </span>
                        </td>
                        
                        <td className="p-3 text-center">
                          <span className="text-sm">
                            {formatIndianDate(ipo.dates.closing)}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>
            {hasData
              ? "Real-time data from database • Updated automatically"
              : "Database is empty • Use admin panel to seed with data"
            }
          </p>
          <p className="mt-1">GMP data is indicative and sourced from grey market</p>
          <p className="mt-1 text-xs text-blue-500">
            Database Status: {hasData ? "Connected & Populated" : "Empty - Seed Required"}
          </p>
        </div>
      </main>
    </div>
  );
}