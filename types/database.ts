/**
 * Database types that align with the Convex schema
 * These are derived from the database schema and used for type-safe operations
 */

import { Doc, Id } from "../convex/_generated/dataModel";

// ============================================
// DATABASE DOCUMENT TYPES
// ============================================

export type IPODocument = Doc<"ipos">;
export type GMPHistoryDocument = Doc<"gmp_history">;
export type SubscriptionHistoryDocument = Doc<"subscription_history">;
export type CurrentGMPDocument = Doc<"current_gmp">;
export type CurrentSubscriptionDocument = Doc<"current_subscription">;
export type SystemLogDocument = Doc<"system_logs">;
export type UserSettingsDocument = Doc<"user_settings">;

// ============================================
// ENRICHED TYPES FOR FRONTEND
// ============================================

// IPO with current GMP and subscription data (for dashboard queries)
export interface EnrichedIPO extends IPODocument {
  current_gmp?: CurrentGMPDocument | null;
  current_subscription?: CurrentSubscriptionDocument | null;
}

// IPO with historical data (for detailed views)
export interface IPOWithHistory extends EnrichedIPO {
  recent_gmp_history?: GMPHistoryDocument[];
  recent_subscription_history?: SubscriptionHistoryDocument[];
}

// ============================================
// FRONTEND TRANSFORMATION TYPES
// ============================================

// Transform database IPO to frontend IPO format
export interface FrontendIPO {
  id: string;
  type: "BSE SME" | "NSE SME" | "Mainline";
  company: string;
  symbol?: string;
  ipoSize: number; // ipo_size_cr
  lot: number; // lot_size
  price: {
    min: number; // price_min
    max: number; // price_max
  };
  amount: {
    retail: number; // retail_amount
    shni: number; // shni_amount
  };
  gmp: {
    percentage: number;
    price: number;
    estListingPrice: number;
    estProfit: {
      retail: number;
      shni: number;
    };
  };
  subscription: {
    qib: number;
    bhni: number;
    shni: number;
    retail: number;
    employee: number;
    shareholder: number;
    total: number;
    totalAmount: number;
    totalBidAmount?: number;
    totalApplications?: number;
  };
  dates: {
    opening: Date;
    closing: Date;
    allotment: Date;
    refund: Date;
    listing: Date;
  };
  status: "upcoming" | "open" | "closed" | "listed";
  kostakRates: {
    retail: number;
    shni: number;
  };
  subjectToSauda: {
    retail: number;
    shni: number;
  };
  exchange: "NSE" | "BSE" | "Both";
  sector: string;
  industry: string;
  leadManagers: string[];
  
  // For listed IPOs
  listingPrice?: number;
  actualProfit?: {
    retail: number;
    shni: number;
  };
  listingGains?: number;
  listingDate?: Date;
  
  // Metadata
  lastUpdated: Date;
  createdAt: Date;
}

// ============================================
// INPUT TYPES FOR MUTATIONS
// ============================================

export interface CreateIPOInput {
  company_name: string;
  type: "BSE SME" | "NSE SME" | "Mainline";
  ipo_size_cr: number;
  price_per_share: number;
  price_min: number;
  price_max: number;
  lot_size: number;
  retail_min_lot_size: number;
  shni_min_lot_size: number;
  bhni_min_lot_size: number;
  opening_date: string; // ISO date
  closing_date: string; // ISO date
  allotment_date: string; // ISO date
  refund_date: string; // ISO date
  listing_date: string; // ISO date
  exchange: "NSE" | "BSE" | "Both";
  sector: string;
  industry: string;
  lead_managers: string[];
  symbol?: string;
  status?: "upcoming" | "open" | "closed" | "listed";
}

export interface GMPBatchInput {
  ipo_id: Id<"ipos">;
  gmp_percent: number;
  price_per_share: number;
  kostak_rates: number;
  retail_sauda_rates: number;
  shni_sauda_rates?: number;
}

export interface SubscriptionBatchInput {
  ipo_id: Id<"ipos">;
  qib_sub: number;
  bhni_sub: number;
  shni_sub: number;
  retail_sub: number;
  emp_sub: number;
  sh_sub: number;
  total_amount_applied: number;
  total_bid_amount?: number;
  total_applications?: number;
}

export interface UpdateListingInput {
  ipo_id: Id<"ipos">;
  listing_price: number;
  listing_gains: number;
  actual_profit_retail: number;
  actual_profit_shni: number;
}

// ============================================
// QUERY FILTER TYPES
// ============================================

export interface IPOFilters {
  type?: "SME" | "Mainline";
  status?: "upcoming" | "open" | "closed" | "listed";
  sort_by?: string;
}

export interface HistoryFilters {
  ipo_id: Id<"ipos">;
  days?: number;
  hours?: number;
  source?: string;
}

// ============================================
// TRANSFORMATION UTILITIES
// ============================================

// Transform database IPO to frontend format
export function transformIPOToFrontend(enrichedIPO: EnrichedIPO): FrontendIPO {
  const ipo = enrichedIPO;
  const currentGMP = enrichedIPO.current_gmp;
  const currentSub = enrichedIPO.current_subscription;

  return {
    id: ipo._id,
    type: ipo.type,
    company: ipo.company_name,
    symbol: ipo.symbol,
    ipoSize: ipo.ipo_size_cr,
    lot: ipo.lot_size,
    price: {
      min: ipo.price_min,
      max: ipo.price_max,
    },
    amount: {
      retail: ipo.retail_amount,
      shni: ipo.shni_amount,
    },
    gmp: {
      percentage: currentGMP?.gmp_percent || 0,
      price: currentGMP?.gmp_price || 0,
      estListingPrice: currentGMP?.est_listing_price || ipo.price_per_share,
      estProfit: {
        retail: currentGMP?.est_retail_profit || 0,
        shni: currentGMP?.est_shni_profit || 0,
      },
    },
    subscription: {
      qib: currentSub?.qib_sub || 0,
      bhni: currentSub?.bhni_sub || 0,
      shni: currentSub?.shni_sub || 0,
      retail: currentSub?.retail_sub || 0,
      employee: currentSub?.emp_sub || 0,
      shareholder: currentSub?.sh_sub || 0,
      total: currentSub?.total_sub || 0,
      totalAmount: currentSub?.total_amount_applied || 0,
      totalBidAmount: currentSub?.total_bid_amount,
      totalApplications: currentSub?.total_applications,
    },
    dates: {
      opening: new Date(ipo.opening_date),
      closing: new Date(ipo.closing_date),
      allotment: new Date(ipo.allotment_date),
      refund: new Date(ipo.refund_date),
      listing: new Date(ipo.listing_date),
    },
    status: ipo.status,
    kostakRates: {
      retail: currentGMP?.retail_sauda_rates || 0,
      shni: currentGMP?.shni_sauda_rates || 0,
    },
    subjectToSauda: {
      retail: currentGMP?.retail_sauda_rates || 0,
      shni: currentGMP?.shni_sauda_rates || 0,
    },
    exchange: ipo.exchange,
    sector: ipo.sector,
    industry: ipo.industry,
    leadManagers: ipo.lead_managers,
    listingPrice: ipo.listing_price,
    actualProfit: ipo.actual_profit_retail !== undefined ? {
      retail: ipo.actual_profit_retail,
      shni: ipo.actual_profit_shni || 0,
    } : undefined,
    listingGains: ipo.listing_gains,
    listingDate: ipo.listing_date ? new Date(ipo.listing_date) : undefined,
    lastUpdated: new Date(ipo.last_modified),
    createdAt: new Date(ipo._creationTime),
  };
}

// Transform multiple IPOs to frontend format
export function transformIPOsToFrontend(enrichedIPOs: EnrichedIPO[]): FrontendIPO[] {
  return enrichedIPOs.map(transformIPOToFrontend);
}

// Transform GMP history for charts
export interface ChartDataPoint {
  date: string;
  value: number;
  label?: string;
}

export function transformGMPHistoryToChart(gmpHistory: GMPHistoryDocument[]): ChartDataPoint[] {
  return gmpHistory.map(record => ({
    date: record.date,
    value: record.gmp_percent,
    label: `${record.gmp_percent.toFixed(1)}%`,
  }));
}

// Transform subscription history for charts
export function transformSubscriptionHistoryToChart(subHistory: SubscriptionHistoryDocument[]): ChartDataPoint[] {
  return subHistory.map(record => ({
    date: record.date,
    value: record.total_sub,
    label: `${record.total_sub.toFixed(2)}x`,
  }));
}

// ============================================
// DASHBOARD STATISTICS TYPES
// ============================================

export interface DashboardStats {
  total_ipos: number;
  upcoming_ipos: number;
  active_ipos: number;
  listed_ipos: number;
  closed_ipos: number;
  total_market_value: number;
  avg_gmp: number;
}

// ============================================
// API RESPONSE TYPES
// ============================================

export interface DatabaseResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface BatchResponse {
  success: boolean;
  batch_id?: string;
  inserted_count?: number;
  inserted_ids?: string[];
  message?: string;
  error?: string;
}

export interface SeedResponse {
  success: boolean;
  ipos_inserted?: number;
  records_inserted?: number;
  message: string;
  error?: string;
}