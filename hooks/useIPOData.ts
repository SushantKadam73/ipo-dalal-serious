/**
 * React hooks for IPO data operations using Convex
 */

import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { FrontendIPO, transformIPOsToFrontend } from "../types/database";
import { Id } from "../convex/_generated/dataModel";

// ============================================
// QUERY HOOKS
// ============================================

// Get all dashboard data
export function useDashboardData() {
  const data = useQuery(api.ipo_functions.getDashboardData);
  
  return {
    data: data ? transformIPOsToFrontend(data) : undefined,
    isLoading: data === undefined,
  };
}

// Get live IPOs (active and upcoming)
export function useLiveIPOs() {
  const data = useQuery(api.ipo_functions.getLiveIPOs);
  
  return {
    data: data ? transformIPOsToFrontend(data) : undefined,
    isLoading: data === undefined,
  };
}

// Get listed IPOs
export function useListedIPOs() {
  const data = useQuery(api.ipo_functions.getListedIPOs);
  
  return {
    data: data ? transformIPOsToFrontend(data) : undefined,
    isLoading: data === undefined,
  };
}

// Get GMP aggregator data
export function useGMPAggregatorData(filterType?: "SME" | "Mainline", sortBy?: string) {
  const data = useQuery(api.ipo_functions.getGMPAggregatorData, {
    filter_type: filterType,
    sort_by: sortBy,
  });
  
  return {
    data: data ? transformIPOsToFrontend(data) : undefined,
    isLoading: data === undefined,
  };
}

// Get subscription aggregator data
export function useSubscriptionAggregatorData() {
  const data = useQuery(api.ipo_functions.getSubscriptionAggregatorData);
  
  return {
    data: data ? transformIPOsToFrontend(data) : undefined,
    isLoading: data === undefined,
  };
}

// Get dashboard statistics
export function useDashboardStats() {
  const data = useQuery(api.ipo_functions.getDashboardStats);
  
  return {
    data,
    isLoading: data === undefined,
  };
}

// Get IPO by ID with history
export function useIPOById(ipoId: Id<"ipos">) {
  const data = useQuery(api.ipo_functions.getIPOById, { ipo_id: ipoId });
  
  return {
    data: data ? transformIPOsToFrontend([data])[0] : undefined,
    isLoading: data === undefined,
  };
}

// Get GMP history for charts
export function useGMPHistory(ipoId: Id<"ipos">, days?: number, source?: string) {
  const data = useQuery(api.ipo_functions.getGMPHistory, {
    ipo_id: ipoId,
    days,
    source,
  });
  
  return {
    data,
    isLoading: data === undefined,
  };
}

// Get subscription trends
export function useSubscriptionTrends(ipoId: Id<"ipos">, hours?: number) {
  const data = useQuery(api.ipo_functions.getSubscriptionTrends, {
    ipo_id: ipoId,
    hours,
  });
  
  return {
    data,
    isLoading: data === undefined,
  };
}

// ============================================
// MUTATION HOOKS
// ============================================

// Create or update IPO
export function useCreateOrUpdateIPO() {
  const createOrUpdateIPO = useMutation(api.ipo_functions.createOrUpdateIPO);
  
  return {
    createOrUpdateIPO,
    isLoading: false, // Convex mutations don't have loading state
  };
}

// Insert GMP batch data
export function useInsertGMPBatch() {
  const insertGMPBatch = useMutation(api.ipo_functions.insertGMPBatch);
  
  return {
    insertGMPBatch,
  };
}

// Insert subscription batch data
export function useInsertSubscriptionBatch() {
  const insertSubscriptionBatch = useMutation(api.ipo_functions.insertSubscriptionBatch);
  
  return {
    insertSubscriptionBatch,
  };
}

// Update IPO listing details
export function useUpdateIPOListingDetails() {
  const updateIPOListingDetails = useMutation(api.ipo_functions.updateIPOListingDetails);
  
  return {
    updateIPOListingDetails,
  };
}

// ============================================
// SEEDING HOOKS
// ============================================

// Seed IPOs
export function useSeedIPOs() {
  const seedIPOs = useMutation(api["seed-data"].seedIPOs);
  
  return {
    seedIPOs,
  };
}

// Seed GMP history
export function useSeedGMPHistory() {
  const seedGMPHistory = useMutation(api["seed-data"].seedGMPHistory);
  
  return {
    seedGMPHistory,
  };
}

// Seed subscription history
export function useSeedSubscriptionHistory() {
  const seedSubscriptionHistory = useMutation(api["seed-data"].seedSubscriptionHistory);
  
  return {
    seedSubscriptionHistory,
  };
}

// Clear all data
export function useClearAllData() {
  const clearAllData = useMutation(api["seed-data"].clearAllData);
  
  return {
    clearAllData,
  };
}

// ============================================
// UTILITY HOOKS
// ============================================

// Hook to handle data refreshing and real-time updates
export function useIPODataRefresh() {
  const { seedIPOs } = useSeedIPOs();
  const { seedGMPHistory } = useSeedGMPHistory();
  const { seedSubscriptionHistory } = useSeedSubscriptionHistory();
  const { clearAllData } = useClearAllData();
  
  const seedAllData = async () => {
    try {
      console.log("Starting database seeding...");
      
      // Clear existing data
      await clearAllData({});
      console.log("Cleared existing data");
      
      // Seed IPOs
      const ipoResult = await seedIPOs({});
      console.log("Seeded IPOs:", ipoResult);
      
      // Seed historical data
      const gmpResult = await seedGMPHistory({});
      console.log("Seeded GMP history:", gmpResult);
      
      const subResult = await seedSubscriptionHistory({});
      console.log("Seeded subscription history:", subResult);
      
      return {
        success: true,
        message: "All data seeded successfully",
        results: {
          ipos: ipoResult,
          gmp_history: gmpResult,
          subscription_history: subResult,
        }
      };
    } catch (error) {
      console.error("Error seeding data:", error);
      return {
        success: false,
        message: "Failed to seed data",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  };
  
  return {
    seedAllData,
    clearAllData,
  };
}

// ============================================
// TYPE HELPERS
// ============================================

// Helper to check if data is loading across multiple queries
export function useIsAnyLoading(...loadingStates: boolean[]) {
  return loadingStates.some(isLoading => isLoading);
}

// Helper to filter IPOs by status
export function useFilteredIPOs(ipos: FrontendIPO[] | undefined, status?: string) {
  if (!ipos) return undefined;
  
  if (!status) return ipos;
  
  return ipos.filter(ipo => ipo.status === status);
}

// Helper to get IPO counts by status
export function useIPOCounts(ipos: FrontendIPO[] | undefined) {
  if (!ipos) return undefined;
  
  return {
    total: ipos.length,
    upcoming: ipos.filter(ipo => ipo.status === "upcoming").length,
    active: ipos.filter(ipo => ipo.status === "open").length,
    closed: ipos.filter(ipo => ipo.status === "closed").length,
    listed: ipos.filter(ipo => ipo.status === "listed").length,
  };
}