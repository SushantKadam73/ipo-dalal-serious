"use client";

import { useState } from "react";
import { Header } from "@/components/layout/header";
import { LiveIPOsTable } from "@/components/tables/live-ipos-table";
import { ListedIPOsTable } from "@/components/tables/listed-ipos-table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { RefreshCw, Activity, TrendingUp, Database } from "lucide-react";
import { mockLiveIPOs, mockListedIPOs } from "@/lib/mock-data";
import { LiveIPO, ListedIPO } from "@/types/ipo";
// Note: These hooks will work once Convex generates the API
// import { useLiveIPOs, useListedIPOs, useIPODataRefresh } from "@/hooks/useIPOData";

export default function Dashboard() {
  const [loading, setLoading] = useState(false);
  const [useRealData, setUseRealData] = useState(false);
  
  // Mock data (fallback)
  const [liveIPOs] = useState<LiveIPO[]>(mockLiveIPOs);
  const [listedIPOs] = useState<ListedIPO[]>(mockListedIPOs);
  
  // Real data hooks (will be enabled once API is generated)
  // const { data: realLiveIPOs, isLoading: liveLoading } = useLiveIPOs();
  // const { data: realListedIPOs, isLoading: listedLoading } = useListedIPOs();
  // const { seedAllData } = useIPODataRefresh();
  
  // Use real data if available, otherwise fall back to mock data
  const displayLiveIPOs = useRealData ? [] : liveIPOs; // realLiveIPOs ||
  const displayListedIPOs = useRealData ? [] : listedIPOs; // realListedIPOs ||
  const isDataLoading = loading; // || liveLoading || listedLoading;

  const handleRefresh = async () => {
    setLoading(true);
    try {
      if (useRealData) {
        // Refresh real data
        console.log("Refreshing database data...");
        // Note: This will work once the API is generated
        // await seedAllData();
      } else {
        // Simulate API call for mock data
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    } catch (error) {
      console.error("Error refreshing data:", error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleSeedDatabase = async () => {
    setLoading(true);
    try {
      console.log("Seeding database with mock data...");
      // Note: This will work once the API is generated
      // const result = await seedAllData();
      // if (result.success) {
      //   setUseRealData(true);
      //   console.log("Database seeded successfully");
      // }
      
      // For now, simulate the seeding
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log("Database seeding simulated (API not yet generated)");
    } catch (error) {
      console.error("Error seeding database:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleIPOClick = (ipo: LiveIPO | ListedIPO) => {
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
            <Button
              variant="outline"
              size="sm"
              onClick={handleSeedDatabase}
              disabled={loading}
              className="flex items-center gap-2"
            >
              <Database className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              {useRealData ? "Reseed DB" : "Seed Database"}
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

        {/* Active IPOs Table */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              Active IPOs
              <span className="text-sm font-normal text-muted-foreground">
                ({displayLiveIPOs.length} IPOs) {useRealData ? "• Real Data" : "• Mock Data"}
              </span>
            </CardTitle>
            <CardDescription>
              Active and upcoming IPOs with current data and key dates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LiveIPOsTable
              data={displayLiveIPOs}
              loading={isDataLoading}
              onRowClick={handleIPOClick}
            />
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
                ({displayListedIPOs.length} IPOs) {useRealData ? "• Real Data" : "• Mock Data"}
              </span>
            </CardTitle>
            <CardDescription>
              Historical IPO performance with actual listing results vs GMP predictions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ListedIPOsTable
              data={displayListedIPOs}
              loading={isDataLoading}
              onRowClick={handleIPOClick}
            />
          </CardContent>
        </Card>

        {/* Footer Note */}
        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>
            {useRealData
              ? "Real-time data from database • Updated automatically"
              : "Using mock data for demonstration • Click 'Seed Database' to use real data"
            }
          </p>
          <p className="mt-1">
            GMP rates are indicative and not guaranteed • Invest responsibly
          </p>
          <p className="mt-1 text-xs text-blue-500">
            Database Status: {useRealData ? "Connected & Seeded" : "Mock Data Mode"}
          </p>
        </div>
      </main>
    </div>
  );
}
