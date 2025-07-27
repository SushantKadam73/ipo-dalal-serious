import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";

// ============================================
// UTILITY FUNCTIONS
// ============================================

// Generate batch ID as specified in PRD
const generateBatchId = (source: string): string => {
  return `${source.toLowerCase()}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Data validation helper
const validateGMPData = (gmpPercent: number, subscriptionNumbers: number[]): boolean => {
  // GMP Percentage: Must be between -50% and +200%
  if (gmpPercent < -50 || gmpPercent > 200) return false;
  
  // Subscription Numbers: Must be >= 0
  if (subscriptionNumbers.some(num => num < 0)) return false;
  
  return true;
};

// Calculate GMP price from percentage and share price
const calculateGMPPrice = (gmpPercent: number, pricePerShare: number): number => {
  return (gmpPercent / 100) * pricePerShare;
};

// ============================================
// MUTATION FUNCTIONS - Data Insertion
// ============================================

// Insert GMP batch data as specified in PRD Section 4.1.1
export const insertGMPBatch = mutation({
  args: {
    gmp_data_array: v.array(v.object({
      ipo_id: v.id("ipos"),
      gmp_percent: v.number(),
      price_per_share: v.number(),
      kostak_rates: v.number(),
      retail_sauda_rates: v.number(),
      shni_sauda_rates: v.optional(v.number()),
    })),
    source: v.string(),
    batch_metadata: v.optional(v.object({
      scraper_version: v.string(),
      scrape_duration_ms: v.number(),
    }))
  },
  handler: async (ctx, args) => {
    const batchId = generateBatchId(args.source);
    const timestamp = Date.now();
    const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    
    const insertedIds: Id<"gmp_history">[] = [];
    
    try {
      // Insert historical records (append-only)
      for (const gmpData of args.gmp_data_array) {
        // Validate data
        if (!validateGMPData(gmpData.gmp_percent, [])) {
          throw new Error(`Invalid GMP data for IPO ${gmpData.ipo_id}`);
        }
        
        const gmpPrice = calculateGMPPrice(gmpData.gmp_percent, gmpData.price_per_share);
        
        // Insert into gmp_history
        const historyId = await ctx.db.insert("gmp_history", {
          ipo_id: gmpData.ipo_id,
          timestamp,
          date,
          gmp_percent: gmpData.gmp_percent,
          gmp_price: gmpPrice,
          kostak_rates: gmpData.kostak_rates,
          retail_sauda_rates: gmpData.retail_sauda_rates,
          shni_sauda_rates: gmpData.shni_sauda_rates,
          source: args.source,
          scrape_batch_id: batchId,
        });
        
        insertedIds.push(historyId);
        
        // Update/Insert current GMP data (upsert)
        const existingCurrent = await ctx.db
          .query("current_gmp")
          .withIndex("by_ipo", (q) => q.eq("ipo_id", gmpData.ipo_id))
          .first();
        
        const estListingPrice = gmpData.price_per_share + gmpPrice;
        const estRetailProfit = gmpPrice; // Simplified calculation
        const estShniProfit = gmpData.shni_sauda_rates ? gmpPrice : undefined;
        
        const currentData = {
          ipo_id: gmpData.ipo_id,
          gmp_percent: gmpData.gmp_percent,
          gmp_price: gmpPrice,
          kostak_rates: gmpData.kostak_rates,
          retail_sauda_rates: gmpData.retail_sauda_rates,
          shni_sauda_rates: gmpData.shni_sauda_rates,
          source: args.source,
          last_updated: timestamp,
          data_freshness: 0, // Fresh data
          est_listing_price: estListingPrice,
          est_retail_profit: estRetailProfit,
          est_shni_profit: estShniProfit,
        };
        
        if (existingCurrent) {
          await ctx.db.patch(existingCurrent._id, currentData);
        } else {
          await ctx.db.insert("current_gmp", currentData);
        }
      }
      
      // Log the batch operation
      await ctx.db.insert("system_logs", {
        action: "insert_gmp_batch",
        entity_type: "gmp",
        details: {
          source: args.source,
          batch_id: batchId,
          metadata: {
            records_count: args.gmp_data_array.length,
            ...args.batch_metadata,
          },
        },
        timestamp,
      });
      
      return {
        success: true,
        batch_id: batchId,
        inserted_count: insertedIds.length,
        inserted_ids: insertedIds,
      };
      
    } catch (error) {
      // Log error
      await ctx.db.insert("system_logs", {
        action: "insert_gmp_batch_error",
        entity_type: "gmp",
        details: {
          source: args.source,
          batch_id: batchId,
          metadata: {
            error: error instanceof Error ? error.message : "Unknown error",
          },
        },
        timestamp,
      });
      
      throw error;
    }
  }
});

// Insert subscription batch data as specified in PRD Section 4.1.2
export const insertSubscriptionBatch = mutation({
  args: {
    subscription_data_array: v.array(v.object({
      ipo_id: v.id("ipos"),
      qib_sub: v.number(),
      bhni_sub: v.number(),
      shni_sub: v.number(),
      retail_sub: v.number(),
      emp_sub: v.number(),
      sh_sub: v.number(),
      total_amount_applied: v.number(),
      total_bid_amount: v.optional(v.number()),
      total_applications: v.optional(v.number()),
    })),
    source: v.string(),
  },
  handler: async (ctx, args) => {
    const batchId = generateBatchId(args.source);
    const timestamp = Date.now();
    const date = new Date().toISOString().split('T')[0];
    
    const insertedIds: Id<"subscription_history">[] = [];
    
    try {
      for (const subData of args.subscription_data_array) {
        // Calculate total subscription
        const totalSub = (subData.qib_sub + subData.bhni_sub + subData.shni_sub + 
                         subData.retail_sub + subData.emp_sub + subData.sh_sub) / 6;
        
        // Validate data
        const subscriptionValues = [
          subData.qib_sub, subData.bhni_sub, subData.shni_sub,
          subData.retail_sub, subData.emp_sub, subData.sh_sub
        ];
        if (!validateGMPData(0, subscriptionValues)) {
          throw new Error(`Invalid subscription data for IPO ${subData.ipo_id}`);
        }
        
        // Insert into subscription_history
        const historyId = await ctx.db.insert("subscription_history", {
          ipo_id: subData.ipo_id,
          timestamp,
          date,
          qib_sub: subData.qib_sub,
          bhni_sub: subData.bhni_sub,
          shni_sub: subData.shni_sub,
          retail_sub: subData.retail_sub,
          emp_sub: subData.emp_sub,
          sh_sub: subData.sh_sub,
          total_sub: totalSub,
          total_amount_applied: subData.total_amount_applied,
          total_bid_amount: subData.total_bid_amount,
          total_applications: subData.total_applications,
          source: args.source,
          scrape_batch_id: batchId,
        });
        
        insertedIds.push(historyId);
        
        // Update/Insert current subscription data (upsert)
        const existingCurrent = await ctx.db
          .query("current_subscription")
          .withIndex("by_ipo", (q) => q.eq("ipo_id", subData.ipo_id))
          .first();
        
        const currentData = {
          ipo_id: subData.ipo_id,
          qib_sub: subData.qib_sub,
          bhni_sub: subData.bhni_sub,
          shni_sub: subData.shni_sub,
          retail_sub: subData.retail_sub,
          emp_sub: subData.emp_sub,
          sh_sub: subData.sh_sub,
          total_sub: totalSub,
          total_amount_applied: subData.total_amount_applied,
          total_bid_amount: subData.total_bid_amount,
          total_applications: subData.total_applications,
          source: args.source,
          last_updated: timestamp,
          data_freshness: 0,
        };
        
        if (existingCurrent) {
          await ctx.db.patch(existingCurrent._id, currentData);
        } else {
          await ctx.db.insert("current_subscription", currentData);
        }
      }
      
      // Log the batch operation
      await ctx.db.insert("system_logs", {
        action: "insert_subscription_batch",
        entity_type: "subscription",
        details: {
          source: args.source,
          batch_id: batchId,
          metadata: {
            records_count: args.subscription_data_array.length,
          },
        },
        timestamp,
      });
      
      return {
        success: true,
        batch_id: batchId,
        inserted_count: insertedIds.length,
        inserted_ids: insertedIds,
      };
      
    } catch (error) {
      // Log error
      await ctx.db.insert("system_logs", {
        action: "insert_subscription_batch_error",
        entity_type: "subscription",
        details: {
          source: args.source,
          batch_id: batchId,
          metadata: {
            error: error instanceof Error ? error.message : "Unknown error",
          },
        },
        timestamp,
      });
      
      throw error;
    }
  }
});

// Create or update IPO master data
export const createOrUpdateIPO = mutation({
  args: {
    company_name: v.string(),
    type: v.union(v.literal("BSE SME"), v.literal("NSE SME"), v.literal("Mainline")),
    ipo_size_cr: v.number(),
    price_per_share: v.number(),
    price_min: v.number(),
    price_max: v.number(),
    lot_size: v.number(),
    retail_min_lot_size: v.number(),
    shni_min_lot_size: v.number(),
    bhni_min_lot_size: v.number(),
    opening_date: v.string(),
    closing_date: v.string(),
    allotment_date: v.string(),
    refund_date: v.string(),
    listing_date: v.string(),
    exchange: v.union(v.literal("NSE"), v.literal("BSE"), v.literal("Both")),
    sector: v.string(),
    industry: v.string(),
    lead_managers: v.array(v.string()),
    symbol: v.optional(v.string()),
    status: v.optional(v.union(v.literal("upcoming"), v.literal("open"), v.literal("closed"), v.literal("listed"))),
  },
  handler: async (ctx, args) => {
    const timestamp = Date.now();
    
    // Calculate investment amounts
    const retailAmount = args.price_per_share * args.retail_min_lot_size;
    const shniAmount = args.price_per_share * args.shni_min_lot_size;
    
    // Determine status based on dates if not provided
    const currentDate = new Date().toISOString().split('T')[0];
    let status = args.status || "upcoming";
    
    if (!args.status) {
      if (currentDate >= args.listing_date) status = "listed";
      else if (currentDate > args.closing_date) status = "closed";
      else if (currentDate >= args.opening_date) status = "open";
    }
    
    const ipoData = {
      company_name: args.company_name,
      type: args.type,
      ipo_size_cr: args.ipo_size_cr,
      price_per_share: args.price_per_share,
      price_min: args.price_min,
      price_max: args.price_max,
      lot_size: args.lot_size,
      retail_min_lot_size: args.retail_min_lot_size,
      shni_min_lot_size: args.shni_min_lot_size,
      bhni_min_lot_size: args.bhni_min_lot_size,
      retail_amount: retailAmount,
      shni_amount: shniAmount,
      opening_date: args.opening_date,
      closing_date: args.closing_date,
      allotment_date: args.allotment_date,
      refund_date: args.refund_date,
      listing_date: args.listing_date,
      status,
      exchange: args.exchange,
      sector: args.sector,
      industry: args.industry,
      lead_managers: args.lead_managers,
      symbol: args.symbol,
      created_by: "system",
      last_modified: timestamp,
    };
    
    // Check if IPO already exists
    const existingIPO = await ctx.db
      .query("ipos")
      .withIndex("by_company", (q) => q.eq("company_name", args.company_name))
      .first();
    
    let ipoId: Id<"ipos">;
    
    if (existingIPO) {
      await ctx.db.patch(existingIPO._id, ipoData);
      ipoId = existingIPO._id;
    } else {
      ipoId = await ctx.db.insert("ipos", ipoData);
    }
    
    // Log the operation
    await ctx.db.insert("system_logs", {
      action: existingIPO ? "update_ipo" : "create_ipo",
      entity_type: "ipo",
      entity_id: ipoId,
      details: {
        changes: ipoData,
        source: "manual",
      },
      timestamp,
    });
    
    return {
      success: true,
      ipo_id: ipoId,
      action: existingIPO ? "updated" : "created",
    };
  }
});

// ============================================
// QUERY FUNCTIONS - Data Retrieval
// ============================================

// Dashboard data query as specified in PRD Section 4.2.1
export const getDashboardData = query({
  handler: async (ctx) => {
    // Get all IPOs with their current GMP and subscription data
    const ipos = await ctx.db.query("ipos").collect();
    
    const enrichedIPOs = await Promise.all(
      ipos.map(async (ipo) => {
        // Get current GMP data
        const currentGMP = await ctx.db
          .query("current_gmp")
          .withIndex("by_ipo", (q) => q.eq("ipo_id", ipo._id))
          .first();
        
        // Get current subscription data
        const currentSub = await ctx.db
          .query("current_subscription")
          .withIndex("by_ipo", (q) => q.eq("ipo_id", ipo._id))
          .first();
        
        return {
          ...ipo,
          current_gmp: currentGMP,
          current_subscription: currentSub,
        };
      })
    );
    
    return enrichedIPOs;
  }
});

// Get active and upcoming IPOs for live table
export const getLiveIPOs = query({
  handler: async (ctx) => {
    const liveIPOs = await ctx.db
      .query("ipos")
      .withIndex("by_status", (q) => q.eq("status", "upcoming"))
      .collect();
    
    const activeIPOs = await ctx.db
      .query("ipos")
      .withIndex("by_status", (q) => q.eq("status", "open"))
      .collect();
    
    const allLiveIPOs = [...liveIPOs, ...activeIPOs];
    
    // Enrich with current data
    const enrichedIPOs = await Promise.all(
      allLiveIPOs.map(async (ipo) => {
        const currentGMP = await ctx.db
          .query("current_gmp")
          .withIndex("by_ipo", (q) => q.eq("ipo_id", ipo._id))
          .first();
        
        const currentSub = await ctx.db
          .query("current_subscription")
          .withIndex("by_ipo", (q) => q.eq("ipo_id", ipo._id))
          .first();
        
        return {
          ...ipo,
          current_gmp: currentGMP,
          current_subscription: currentSub,
        };
      })
    );
    
    return enrichedIPOs;
  }
});

// Get listed IPOs for listed table
export const getListedIPOs = query({
  handler: async (ctx) => {
    const listedIPOs = await ctx.db
      .query("ipos")
      .withIndex("by_status", (q) => q.eq("status", "listed"))
      .collect();
    
    // Enrich with historical GMP data for comparison
    const enrichedIPOs = await Promise.all(
      listedIPOs.map(async (ipo) => {
        const currentGMP = await ctx.db
          .query("current_gmp")
          .withIndex("by_ipo", (q) => q.eq("ipo_id", ipo._id))
          .first();
        
        return {
          ...ipo,
          current_gmp: currentGMP,
        };
      })
    );
    
    return enrichedIPOs;
  }
});

// GMP Aggregator data as specified in PRD Section 4.2.1
export const getGMPAggregatorData = query({
  args: { 
    filter_type: v.optional(v.union(v.literal("SME"), v.literal("Mainline"))),
    sort_by: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    let ipos;
    
    // Apply type filter
    if (args.filter_type === "SME") {
      // Filter for both BSE SME and NSE SME
      ipos = await ctx.db.query("ipos")
        .filter((q) => 
          q.or(q.eq(q.field("type"), "BSE SME"), q.eq(q.field("type"), "NSE SME"))
        )
        .collect();
    } else if (args.filter_type === "Mainline") {
      ipos = await ctx.db.query("ipos")
        .filter((q) => q.eq(q.field("type"), "Mainline"))
        .collect();
    } else {
      ipos = await ctx.db.query("ipos").collect();
    }
    
    // Enrich with current GMP data
    const enrichedIPOs = await Promise.all(
      ipos.map(async (ipo) => {
        const currentGMP = await ctx.db
          .query("current_gmp")
          .withIndex("by_ipo", (q) => q.eq("ipo_id", ipo._id))
          .first();
        
        return {
          ...ipo,
          current_gmp: currentGMP,
        };
      })
    );
    
    return enrichedIPOs;
  }
});

// Subscription Aggregator data as specified in PRD Section 4.2.1
export const getSubscriptionAggregatorData = query({
  handler: async (ctx) => {
    const ipos = await ctx.db.query("ipos").collect();
    
    // Enrich with current subscription data
    const enrichedIPOs = await Promise.all(
      ipos.map(async (ipo) => {
        const currentSub = await ctx.db
          .query("current_subscription")
          .withIndex("by_ipo", (q) => q.eq("ipo_id", ipo._id))
          .first();
        
        return {
          ...ipo,
          current_subscription: currentSub,
        };
      })
    );
    
    return enrichedIPOs;
  }
});

// ============================================
// HISTORICAL DATA QUERIES - Charts and Trends
// ============================================

// GMP History for Charts as specified in PRD Section 4.2.2
export const getGMPHistory = query({
  args: { 
    ipo_id: v.id("ipos"), 
    days: v.optional(v.number()),
    source: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    let query = ctx.db
      .query("gmp_history")
      .withIndex("by_ipo_and_timestamp", (q) => q.eq("ipo_id", args.ipo_id));
    
    // Apply source filter if provided
    if (args.source) {
      query = query.filter((q) => q.eq(q.field("source"), args.source));
    }
    
    let gmpHistory = await query.collect();
    
    // Apply days filter if provided
    if (args.days) {
      const cutoffTime = Date.now() - (args.days * 24 * 60 * 60 * 1000);
      gmpHistory = gmpHistory.filter(record => record.timestamp >= cutoffTime);
    }
    
    // Sort by timestamp (ascending for charts)
    gmpHistory.sort((a, b) => a.timestamp - b.timestamp);
    
    return gmpHistory;
  }
});

// Subscription Trends as specified in PRD Section 4.2.2
export const getSubscriptionTrends = query({
  args: { 
    ipo_id: v.id("ipos"), 
    hours: v.optional(v.number())
  },
  handler: async (ctx, args) => {
    let query = ctx.db
      .query("subscription_history")
      .withIndex("by_ipo_and_timestamp", (q) => q.eq("ipo_id", args.ipo_id));
    
    let subscriptionHistory = await query.collect();
    
    // Apply hours filter if provided
    if (args.hours) {
      const cutoffTime = Date.now() - (args.hours * 60 * 60 * 1000);
      subscriptionHistory = subscriptionHistory.filter(record => record.timestamp >= cutoffTime);
    }
    
    // Sort by timestamp (ascending for trends)
    subscriptionHistory.sort((a, b) => a.timestamp - b.timestamp);
    
    return subscriptionHistory;
  }
});

// Get IPO by ID with all related data
export const getIPOById = query({
  args: { ipo_id: v.id("ipos") },
  handler: async (ctx, args) => {
    const ipo = await ctx.db.get(args.ipo_id);
    if (!ipo) return null;
    
    // Get current GMP and subscription data
    const currentGMP = await ctx.db
      .query("current_gmp")
      .withIndex("by_ipo", (q) => q.eq("ipo_id", args.ipo_id))
      .first();
    
    const currentSub = await ctx.db
      .query("current_subscription")
      .withIndex("by_ipo", (q) => q.eq("ipo_id", args.ipo_id))
      .first();
    
    // Get recent history (last 7 days)
    const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    
    const recentGMPHistory = await ctx.db
      .query("gmp_history")
      .withIndex("by_ipo_and_timestamp", (q) => q.eq("ipo_id", args.ipo_id))
      .filter((q) => q.gte(q.field("timestamp"), sevenDaysAgo))
      .collect();
    
    const recentSubHistory = await ctx.db
      .query("subscription_history")
      .withIndex("by_ipo_and_timestamp", (q) => q.eq("ipo_id", args.ipo_id))
      .filter((q) => q.gte(q.field("timestamp"), sevenDaysAgo))
      .collect();
    
    return {
      ...ipo,
      current_gmp: currentGMP,
      current_subscription: currentSub,
      recent_gmp_history: recentGMPHistory.sort((a, b) => a.timestamp - b.timestamp),
      recent_subscription_history: recentSubHistory.sort((a, b) => a.timestamp - b.timestamp),
    };
  }
});

// ============================================
// ADMIN FUNCTIONS
// ============================================

// Update IPO listing details (for when IPO gets listed)
export const updateIPOListingDetails = mutation({
  args: {
    ipo_id: v.id("ipos"),
    listing_price: v.number(),
    listing_gains: v.number(),
    actual_profit_retail: v.number(),
    actual_profit_shni: v.number(),
  },
  handler: async (ctx, args) => {
    const timestamp = Date.now();
    
    await ctx.db.patch(args.ipo_id, {
      listing_price: args.listing_price,
      listing_gains: args.listing_gains,
      actual_profit_retail: args.actual_profit_retail,
      actual_profit_shni: args.actual_profit_shni,
      status: "listed",
      last_modified: timestamp,
    });
    
    // Log the operation
    await ctx.db.insert("system_logs", {
      action: "update_ipo_listing",
      entity_type: "ipo",
      entity_id: args.ipo_id,
      details: {
        changes: {
          listing_price: args.listing_price,
          listing_gains: args.listing_gains,
          actual_profit_retail: args.actual_profit_retail,
          actual_profit_shni: args.actual_profit_shni,
          status: "listed",
        },
        source: "manual",
      },
      timestamp,
    });
    
    return { success: true };
  }
});

// Get system logs for monitoring
export const getSystemLogs = query({
  args: {
    limit: v.optional(v.number()),
    action_filter: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let query = ctx.db.query("system_logs").withIndex("by_timestamp");
    
    if (args.action_filter) {
      query = query.filter((q) => q.eq(q.field("action"), args.action_filter));
    }
    
    const logs = await query
      .order("desc")
      .take(args.limit || 100);
    
    return logs;
  }
});

// Get dashboard statistics
export const getDashboardStats = query({
  handler: async (ctx) => {
    const ipos = await ctx.db.query("ipos").collect();
    
    const stats = {
      total_ipos: ipos.length,
      upcoming_ipos: ipos.filter(ipo => ipo.status === "upcoming").length,
      active_ipos: ipos.filter(ipo => ipo.status === "open").length,
      listed_ipos: ipos.filter(ipo => ipo.status === "listed").length,
      closed_ipos: ipos.filter(ipo => ipo.status === "closed").length,
      total_market_value: ipos.reduce((sum, ipo) => sum + ipo.ipo_size_cr, 0),
    };
    
    // Get average GMP for active IPOs
    const activeIPOs = ipos.filter(ipo => ipo.status === "open");
    let avgGMP = 0;
    
    if (activeIPOs.length > 0) {
      const gmpData = await Promise.all(
        activeIPOs.map(async (ipo) => {
          const currentGMP = await ctx.db
            .query("current_gmp")
            .withIndex("by_ipo", (q) => q.eq("ipo_id", ipo._id))
            .first();
          return currentGMP?.gmp_percent || 0;
        })
      );
      
      avgGMP = gmpData.reduce((sum, gmp) => sum + gmp, 0) / gmpData.length;
    }
    
    return {
      ...stats,
      avg_gmp: avgGMP,
    };
  }
});