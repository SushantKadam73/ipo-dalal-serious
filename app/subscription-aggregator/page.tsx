"use client";

import { useState } from "react";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { IPOBadge } from "@/components/common/ipo-badge";
import { GMPIndicator } from "@/components/common/gmp-indicator";
import { RefreshCw, Download, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { allMockIPOs } from "@/lib/mock-data";
import { IPO } from "@/types/ipo";
import { formatIndianCurrency, formatIndianDate, formatSubscriptionTimes } from "@/lib/formatters";

type SortField = "type" | "company" | "ipoSize" | "gmp.percentage" | "subscription.total" | "subscription.qib" | "subscription.retail" | "dates.closing";

export default function SubscriptionAggregator() {
  const [loading, setLoading] = useState(false);
  const [sortField, setSortField] = useState<SortField>("dates.closing");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const handleRefresh = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLoading(false);
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

  const getNestedValue = (obj: any, path: string) => {
    return path.split('.').reduce((value, key) => value?.[key], obj);
  };

  // Only show active/upcoming IPOs for subscription data
  const activeIPOs = allMockIPOs.filter(ipo => ipo.status !== "listed");

  const sortedIPOs = [...activeIPOs].sort((a, b) => {
    const aValue = getNestedValue(a, sortField);
    const bValue = getNestedValue(b, sortField);
    
    if (aValue === bValue) return 0;
    const comparison = aValue < bValue ? -1 : 1;
    return sortDirection === "asc" ? comparison : -comparison;
  });

  const exportToCSV = () => {
    const csvContent = [
      ["Type", "Company", "Size (₹Cr)", "GMP", "QIB", "BHNI", "SHNI", "Retail", "Employee", "Shareholder", "Total", "Total Bid Amount (₹Cr)", "Total Applications", "Closing Date"].join(","),
      ...sortedIPOs.map(ipo => [
        ipo.type,
        `"${ipo.company}"`,
        ipo.ipoSize,
        `${ipo.gmp.percentage}%`,
        ipo.subscription.qib,
        ipo.subscription.bhni,
        ipo.subscription.shni,
        ipo.subscription.retail,
        ipo.subscription.employee,
        ipo.subscription.shareholder,
        ipo.subscription.total,
        ipo.subscription.totalBidAmount,
        ipo.subscription.totalApplications,
        formatIndianDate(ipo.dates.closing)
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `ipo-subscription-data-${new Date().toISOString().split('T')[0]}.csv`;
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
              Subscription Aggregator
            </h1>
            <p className="text-muted-foreground">
              Detailed subscription data across all investor categories
            </p>
          </div>
          
          <div className="flex items-center gap-2 mt-4 md:mt-0">
            <Button
              variant="outline"
              size="sm"
              onClick={exportToCSV}
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={loading}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Subscription Data Table */}
        <Card>
          <CardHeader>
            <CardTitle>IPO Subscription Data</CardTitle>
            <CardDescription>
              Category-wise subscription details with total bid amounts and application counts
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
                        onClick={() => handleSort("subscription.qib")}
                        className="h-auto p-0 font-bold hover:bg-transparent"
                      >
                        <div className="flex items-center gap-2">
                          QIB
                          {getSortIcon("subscription.qib")}
                        </div>
                      </Button>
                    </th>
                    <th className="p-3 text-center font-bold border-b border-border bg-muted">
                      BHNI
                    </th>
                    <th className="p-3 text-center font-bold border-b border-border bg-muted">
                      SHNI
                    </th>
                    <th className="p-3 text-center font-bold border-b border-border bg-muted">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSort("subscription.retail")}
                        className="h-auto p-0 font-bold hover:bg-transparent"
                      >
                        <div className="flex items-center gap-2">
                          Retail
                          {getSortIcon("subscription.retail")}
                        </div>
                      </Button>
                    </th>
                    <th className="p-3 text-center font-bold border-b border-border bg-muted">
                      Employee
                    </th>
                    <th className="p-3 text-center font-bold border-b border-border bg-muted">
                      Shareholder
                    </th>
                    <th className="p-3 text-center font-bold border-b border-border bg-muted">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSort("subscription.total")}
                        className="h-auto p-0 font-bold hover:bg-transparent"
                      >
                        <div className="flex items-center gap-2">
                          Total
                          {getSortIcon("subscription.total")}
                        </div>
                      </Button>
                    </th>
                    <th className="p-3 text-right font-bold border-b border-border bg-muted">
                      Total Bid Amount (₹Cr)
                    </th>
                    <th className="p-3 text-center font-bold border-b border-border bg-muted">
                      Total Applications
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
                  {loading ? (
                    [...Array(5)].map((_, index) => (
                      <tr key={index}>
                        {[...Array(14)].map((_, cellIndex) => (
                          <td key={cellIndex} className="p-3 border-b border-border/50">
                            <div className="h-4 bg-muted rounded animate-pulse" />
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : sortedIPOs.length === 0 ? (
                    <tr>
                      <td colSpan={14} className="text-center py-8 text-muted-foreground">
                        No IPOs available for subscription tracking
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
                          <GMPIndicator
                            percentage={ipo.gmp.percentage}
                            price={ipo.gmp.price}
                            size="sm"
                          />
                        </td>
                        
                        <td className="p-3 text-center">
                          <span className={`font-medium ${
                            ipo.subscription.qib > 1 ? "text-green-500" : "text-muted-foreground"
                          }`}>
                            {formatSubscriptionTimes(ipo.subscription.qib)}
                          </span>
                        </td>
                        
                        <td className="p-3 text-center">
                          <span className={`font-medium ${
                            ipo.subscription.bhni > 1 ? "text-green-500" : "text-muted-foreground"
                          }`}>
                            {formatSubscriptionTimes(ipo.subscription.bhni)}
                          </span>
                        </td>
                        
                        <td className="p-3 text-center">
                          <span className={`font-medium ${
                            ipo.subscription.shni > 1 ? "text-green-500" : "text-muted-foreground"
                          }`}>
                            {formatSubscriptionTimes(ipo.subscription.shni)}
                          </span>
                        </td>
                        
                        <td className="p-3 text-center">
                          <span className={`font-medium ${
                            ipo.subscription.retail > 1 ? "text-green-500" : "text-muted-foreground"
                          }`}>
                            {formatSubscriptionTimes(ipo.subscription.retail)}
                          </span>
                        </td>
                        
                        <td className="p-3 text-center">
                          <span className={`font-medium ${
                            ipo.subscription.employee > 1 ? "text-green-500" : "text-muted-foreground"
                          }`}>
                            {formatSubscriptionTimes(ipo.subscription.employee)}
                          </span>
                        </td>
                        
                        <td className="p-3 text-center">
                          <span className={`font-medium ${
                            ipo.subscription.shareholder > 1 ? "text-green-500" : "text-muted-foreground"
                          }`}>
                            {formatSubscriptionTimes(ipo.subscription.shareholder)}
                          </span>
                        </td>
                        
                        <td className="p-3 text-center">
                          <span className={`font-bold text-lg ${
                            ipo.subscription.total > 1 ? "text-primary" : "text-warning"
                          }`}>
                            {formatSubscriptionTimes(ipo.subscription.total)}
                          </span>
                        </td>
                        
                        <td className="p-3 text-right">
                          <span className="font-medium">
                            {formatIndianCurrency(ipo.subscription.totalBidAmount, { showCrores: true, compact: true })}
                          </span>
                        </td>
                        
                        <td className="p-3 text-center">
                          <span className="font-medium">
                            {(ipo.subscription.totalApplications / 100000).toFixed(1)}L
                          </span>
                        </td>
                        
                        <td className="p-3 text-center">
                          <span className="text-sm text-muted-foreground">
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
          <p>Subscription data updated every 5-10 minutes during market hours</p>
          <p className="mt-1">QIB: Qualified Institutional Buyers | BHNI: Big HNI (&gt;10L) | SHNI: Small HNI (2L-10L)</p>
        </div>
      </main>
    </div>
  );
}