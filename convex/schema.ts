import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// IPO Dalal Database Schema - Following PRD Architecture
export default defineSchema({
  // Legacy table (keeping for backwards compatibility)
  numbers: defineTable({
    value: v.number(),
  }),

  // ============================================
  // MASTER IPO TABLE (ipos) - Static IPO Information
  // ============================================
  ipos: defineTable({
    // Basic Information
    company_name: v.string(),                    // "ABC Technologies Ltd"
    type: v.union(
      v.literal("BSE SME"), 
      v.literal("NSE SME"), 
      v.literal("Mainline")
    ),
    ipo_size_cr: v.number(),                     // Size in crores
    
    // Pricing Information
    price_per_share: v.number(),                 // Upper band/cutoff price
    price_min: v.number(),                       // Lower band price (for frontend)
    price_max: v.number(),                       // Upper band price (for frontend)
    lot_size: v.number(),                        // General lot size
    retail_min_lot_size: v.number(),             // Minimum retail lot size
    shni_min_lot_size: v.number(),               // Minimum SHNI lot size
    bhni_min_lot_size: v.number(),               // Minimum BHNI lot size
    
    // Investment amounts (calculated fields for frontend)
    retail_amount: v.number(),                   // price_per_share * retail_min_lot_size
    shni_amount: v.number(),                     // price_per_share * shni_min_lot_size
    
    // Important Dates (ISO date strings as per PRD)
    opening_date: v.string(),                    // ISO date format
    closing_date: v.string(),                    // ISO date format
    allotment_date: v.string(),                  // ISO date format
    refund_date: v.string(),                     // ISO date format
    listing_date: v.string(),                    // ISO date format
    
    // Status Management
    status: v.union(
      v.literal("upcoming"), 
      v.literal("open"), 
      v.literal("closed"), 
      v.literal("listed")
    ),
    
    // Additional frontend fields
    exchange: v.union(v.literal("NSE"), v.literal("BSE"), v.literal("Both")),
    sector: v.string(),                          // Industry/sector
    industry: v.string(),                        // More specific industry classification
    lead_managers: v.array(v.string()),          // Lead managers array
    symbol: v.optional(v.string()),              // Stock symbol for listed IPOs
    
    // For listed IPOs
    listing_price: v.optional(v.number()),       // Actual listing price
    actual_profit_retail: v.optional(v.number()), // Actual profit for retail
    actual_profit_shni: v.optional(v.number()),  // Actual profit for SHNI
    listing_gains: v.optional(v.number()),       // Percentage gain/loss on listing
    
    // Metadata
    created_by: v.string(),                      // System/manual entry tracking
    last_modified: v.number(),                   // Last update timestamp
  })
    .index("by_company", ["company_name"])
    .index("by_type_status", ["type", "status"])
    .index("by_closing_date", ["closing_date"])
    .index("by_status", ["status"])
    .index("by_listing_date", ["listing_date"])
    .index("by_last_modified", ["last_modified"]),

  // ============================================
  // GMP HISTORICAL DATA (gmp_history) - Time-series data
  // ============================================
  gmp_history: defineTable({
    // Reference
    ipo_id: v.id("ipos"),                        // Foreign key reference
    
    // Temporal Information
    timestamp: v.number(),                       // Unix timestamp (exact time)
    date: v.string(),                           // ISO date (YYYY-MM-DD) for grouping
    
    // GMP Data
    gmp_percent: v.number(),                    // Grey Market Premium percentage
    gmp_price: v.number(),                      // GMP in rupees (calculated)
    
    // Trading Rates
    kostak_rates: v.number(),                   // Kostak rates
    retail_sauda_rates: v.number(),             // Subject to sauda (retail)
    shni_sauda_rates: v.optional(v.number()),   // Subject to sauda (SHNI), null for SME
    
    // Data Source Tracking
    source: v.string(),                         // "InvestorGain", "Chittorgarh", etc.
    scrape_batch_id: v.string(),               // Batch identifier for grouping
    
    // Data Quality
    confidence_score: v.optional(v.number()),   // Future: data reliability score
    is_verified: v.optional(v.boolean()),      // Future: manual verification flag
  })
    .index("by_ipo_and_date", ["ipo_id", "date"])
    .index("by_timestamp", ["timestamp"])
    .index("by_batch", ["scrape_batch_id"])
    .index("by_source", ["source", "timestamp"])
    .index("by_ipo_and_timestamp", ["ipo_id", "timestamp"]),

  // ============================================
  // SUBSCRIPTION HISTORICAL DATA (subscription_history) - Time-series data
  // ============================================
  subscription_history: defineTable({
    // Reference
    ipo_id: v.id("ipos"),
    
    // Temporal Information
    timestamp: v.number(),
    date: v.string(),
    
    // Subscription Data by Category
    qib_sub: v.number(),                        // QIB subscription multiple
    bhni_sub: v.number(),                       // BHNI subscription multiple
    shni_sub: v.number(),                       // SHNI subscription multiple
    retail_sub: v.number(),                     // Retail subscription multiple
    emp_sub: v.number(),                        // Employee subscription multiple
    sh_sub: v.number(),                         // Shareholder subscription multiple
    
    // Aggregate Data
    total_sub: v.number(),                      // Total subscription multiple
    total_amount_applied: v.number(),           // Total amount applied (crores)
    
    // Additional frontend fields
    total_bid_amount: v.optional(v.number()),   // Total bid amount (crores)
    total_applications: v.optional(v.number()), // Number of applications
    
    // Data Source Tracking
    source: v.string(),
    scrape_batch_id: v.string(),
  })
    .index("by_ipo_and_date", ["ipo_id", "date"])
    .index("by_timestamp", ["timestamp"])
    .index("by_batch", ["scrape_batch_id"])
    .index("by_ipo_and_timestamp", ["ipo_id", "timestamp"]),

  // ============================================
  // CURRENT GMP DATA (current_gmp) - Cache for latest GMP data
  // ============================================
  current_gmp: defineTable({
    // Reference
    ipo_id: v.id("ipos"),                       // One-to-one relationship
    
    // Latest Data (mirrors gmp_history structure)
    gmp_percent: v.number(),
    gmp_price: v.number(),
    kostak_rates: v.number(),
    retail_sauda_rates: v.number(),
    shni_sauda_rates: v.optional(v.number()),
    
    // Metadata
    source: v.string(),                         // Source of latest data
    last_updated: v.number(),                   // When this was last updated
    data_freshness: v.number(),                 // Age of data in minutes
    
    // Calculated Fields (computed at update time)
    est_listing_price: v.number(),              // price_per_share + gmp_price
    est_retail_profit: v.number(),              // Estimated profit for retail investors
    est_shni_profit: v.optional(v.number()),    // Estimated profit for SHNI (null for SME)
  })
    .index("by_ipo", ["ipo_id"])                // Unique constraint enforced in mutations
    .index("by_last_updated", ["last_updated"]),

  // ============================================
  // CURRENT SUBSCRIPTION DATA (current_subscription) - Cache for latest subscription data
  // ============================================
  current_subscription: defineTable({
    // Reference
    ipo_id: v.id("ipos"),
    
    // Latest Subscription Data
    qib_sub: v.number(),
    bhni_sub: v.number(),
    shni_sub: v.number(),
    retail_sub: v.number(),
    emp_sub: v.number(),
    sh_sub: v.number(),
    total_sub: v.number(),
    total_amount_applied: v.number(),
    
    // Additional frontend fields
    total_bid_amount: v.optional(v.number()),
    total_applications: v.optional(v.number()),
    
    // Metadata
    source: v.string(),
    last_updated: v.number(),
    data_freshness: v.number(),
  })
    .index("by_ipo", ["ipo_id"])                // Unique constraint enforced in mutations
    .index("by_total_sub", ["total_sub"])
    .index("by_last_updated", ["last_updated"]),

  // ============================================
  // SYSTEM LOGS - For tracking updates and changes
  // ============================================
  system_logs: defineTable({
    action: v.string(),                         // "insert_gmp_batch", "update_ipo", etc.
    entity_type: v.string(),                    // "ipo", "gmp", "subscription"
    entity_id: v.optional(v.string()),
    details: v.object({
      changes: v.optional(v.any()),
      source: v.optional(v.string()),
      batch_id: v.optional(v.string()),
      metadata: v.optional(v.any()),
    }),
    timestamp: v.number(),
  })
    .index("by_timestamp", ["timestamp"])
    .index("by_action", ["action"])
    .index("by_entity", ["entity_type", "entity_id"]),

  // ============================================
  // USER SETTINGS - For future use
  // ============================================
  user_settings: defineTable({
    user_id: v.string(),
    preferences: v.object({
      default_view: v.optional(v.string()),
      notifications: v.optional(v.boolean()),
      favorite_ipos: v.optional(v.array(v.id("ipos"))),
      filter_presets: v.optional(v.array(v.any())),
    }),
    created_at: v.number(),
    updated_at: v.number(),
  })
    .index("by_user", ["user_id"]),
});
