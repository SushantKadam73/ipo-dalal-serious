"use client";

import { useState } from "react";
import { Header } from "@/components/layout/header";
import { LiveIPOsTable } from "@/components/tables/live-ipos-table";
import { ListedIPOsTable } from "@/components/tables/listed-ipos-table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { RefreshCw, Activity, TrendingUp } from "lucide-react";
import { mockLiveIPOs, mockListedIPOs } from "@/lib/mock-data";
import { LiveIPO, ListedIPO } from "@/types/ipo";

export default function Dashboard() {
  const [loading, setLoading] = useState(false);
  const [liveIPOs] = useState<LiveIPO[]>(mockLiveIPOs);
  const [listedIPOs] = useState<ListedIPO[]>(mockListedIPOs);

  const handleRefresh = async () => {
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLoading(false);
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
                ({liveIPOs.length} IPOs)
              </span>
            </CardTitle>
            <CardDescription>
              Active and upcoming IPOs with current data and key dates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LiveIPOsTable
              data={liveIPOs}
              loading={loading}
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
                ({listedIPOs.length} IPOs)
              </span>
            </CardTitle>
            <CardDescription>
              Historical IPO performance with actual listing results vs GMP predictions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ListedIPOsTable
              data={listedIPOs}
              loading={loading}
              onRowClick={handleIPOClick}
            />
          </CardContent>
        </Card>

        {/* Footer Note */}
        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>Data updated every 15-30 minutes • GMP rates are indicative and not guaranteed</p>
          <p className="mt-1">
            Invest responsibly • Past performance does not guarantee future results
          </p>
        </div>
      </main>
    </div>
  );
}
