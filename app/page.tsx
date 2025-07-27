"use client";

import { Header } from "@/components/layout/header";
import { LiveIPOsTable } from "@/components/tables/live_ipos_table";
import { ListedIPOsTable } from "@/components/tables/listed_ipos_table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { RefreshCw, Activity, TrendingUp, Database, AlertCircle } from "lucide-react";
import { useLiveIPOs, useListedIPOs, useIPODataRefresh } from "@/hooks/useIPOData";
import { FrontendIPO } from "@/types/database";

export default function Dashboard() {
  // Use real database queries
  const { data: liveIPOs, isLoading: liveLoading } = useLiveIPOs();
  const { data: listedIPOs, isLoading: listedLoading } = useListedIPOs();
  const { seedAllData } = useIPODataRefresh();
  
  const isDataLoading = liveLoading || listedLoading;
  const hasData = (liveIPOs && liveIPOs.length > 0) || (listedIPOs && listedIPOs.length > 0);

  const handleRefresh = async () => {
    // Refresh is automatic with Convex real-time updates
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

  const handleIPOClick = (ipo: FrontendIPO) => {
    console.log("IPO clicked:", ipo.company);
    // TODO: Navigate to IPO detail page
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold font-heading text-foreground mb-2">
              IPO Dashboard
            </h1>
            <p className="text-muted-foreground">
              Track active and listed IPOs with real-time data and performance metrics
            </p>
          </div>
          
          <div className="flex items-center gap-2 mt-4 md:mt-0">
            {!hasData && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleSeedDatabase}
                disabled={isDataLoading}
                className="flex items-center gap-2"
              >
                <Database className={`w-4 h-4 ${isDataLoading ? "animate-spin" : ""}`} />
                Seed Database
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isDataLoading}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${isDataLoading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Active IPOs Table */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              Active IPOs
              <span className="text-sm font-normal text-muted-foreground">
                ({liveIPOs?.length || 0} IPOs)
              </span>
            </CardTitle>
            <CardDescription>
              Active and upcoming IPOs with current data and key dates
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!hasData && !isDataLoading ? (
              <div className="text-center py-8">
                <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg font-medium text-muted-foreground mb-2">No Data Available</p>
                <p className="text-sm text-muted-foreground mb-4">
                  Click "Seed Database" to populate with sample IPO data
                </p>
                <Button onClick={handleSeedDatabase} className="flex items-center gap-2">
                  <Database className="w-4 h-4" />
                  Seed Database
                </Button>
              </div>
            ) : (
              <LiveIPOsTable
                data={liveIPOs || []}
                loading={isDataLoading}
                onRowClick={handleIPOClick}
              />
            )}
          </CardContent>
        </Card>

        {/* Separator */}
        <Separator className="my-8" />

        {/* Listed IPOs Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-secondary" />
              Listed IPOs
              <span className="text-sm font-normal text-muted-foreground">
                ({listedIPOs?.length || 0} IPOs)
              </span>
            </CardTitle>
            <CardDescription>
              Historical IPO performance with actual listing results vs GMP predictions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ListedIPOsTable
              data={listedIPOs || []}
              loading={isDataLoading}
              onRowClick={handleIPOClick}
            />
          </CardContent>
        </Card>

        {/* Footer Note */}
        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>
            {hasData
              ? "Real-time data from database • Updated automatically"
              : "Database is empty • Use admin panel to seed with data"
            }
          </p>
          <p className="mt-1">
            GMP rates are indicative and not guaranteed • Invest responsibly
          </p>
          <p className="mt-1 text-xs text-blue-500">
            Database Status: {hasData ? "Connected & Populated" : "Empty - Seed Required"}
          </p>
        </div>
      </main>
    </div>
  );
}
