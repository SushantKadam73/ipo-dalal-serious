import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// IPO Dalal Database Schema
export default defineSchema({
  // Legacy table (keeping for now)
  numbers: defineTable({
    value: v.number(),
  }),

  // Main IPO data table
  ipos: defineTable({
    type: v.union(v.literal("SME"), v.literal("Mainline")),
    company: v.string(),
    ipoSize: v.number(), // in crores
    lot: v.number(), // shares per lot
    
    // Price range
    priceMin: v.number(),
    priceMax: v.number(),
    amount: v.number(), // investment amount per lot
    
    // GMP data
    gmpPercentage: v.number(),
    gmpPrice: v.number(),
    estListingPrice: v.number(),
    estProfitRetail: v.number(),
    estProfitShni: v.number(),
    
    // Subscription data
    subscriptionQib: v.number(),
    subscriptionBhni: v.number(),
    subscriptionShni: v.number(),
    subscriptionRetail: v.number(),
    subscriptionEmployee: v.number(),
    subscriptionShareholder: v.number(),
    subscriptionTotal: v.number(),
    subscriptionTotalAmount: v.number(), // in crores
    
    // Important dates
    openingDate: v.number(), // timestamp
    closingDate: v.number(), // timestamp
    allotmentDate: v.number(), // timestamp
    refundDate: v.number(), // timestamp
    listingDate: v.number(), // timestamp
    
    // Status and metadata
    status: v.union(
      v.literal("upcoming"),
      v.literal("active"),
      v.literal("listed"),
      v.literal("closed")
    ),
    
    // Kostak rates
    kostakRatesRetail: v.number(),
    kostakRatesShni: v.number(),
    
    // Subject to Sauda
    saudaRetail: v.number(),
    saudaShni: v.number(),
    
    // Additional metadata
    exchange: v.union(v.literal("NSE"), v.literal("BSE"), v.literal("Both")),
    sector: v.string(),
    leadManagers: v.array(v.string()),
    
    // For listed IPOs
    listingPrice: v.optional(v.number()),
    actualProfitRetail: v.optional(v.number()),
    actualProfitShni: v.optional(v.number()),
    listingGains: v.optional(v.number()),
    
    // Timestamps
    lastUpdated: v.number(),
    createdAt: v.number(),
  })
    .index("by_status", ["status"])
    .index("by_type", ["type"])
    .index("by_closing_date", ["closingDate"])
    .index("by_listing_date", ["listingDate"])
    .index("by_company", ["company"])
    .index("by_created_at", ["createdAt"]),

  // GMP history tracking
  gmpHistory: defineTable({
    ipoId: v.id("ipos"),
    gmpPercentage: v.number(),
    gmpPrice: v.number(),
    kostakRatesRetail: v.optional(v.number()),
    kostakRatesShni: v.optional(v.number()),
    saudaRetail: v.optional(v.number()),
    saudaShni: v.optional(v.number()),
    timestamp: v.number(),
    source: v.optional(v.string()), // data source
  })
    .index("by_ipo", ["ipoId"])
    .index("by_timestamp", ["timestamp"])
    .index("by_ipo_and_timestamp", ["ipoId", "timestamp"]),

  // Subscription tracking over time
  subscriptionHistory: defineTable({
    ipoId: v.id("ipos"),
    qib: v.number(),
    bhni: v.number(),
    shni: v.number(),
    retail: v.number(),
    employee: v.number(),
    shareholder: v.number(),
    total: v.number(),
    totalAmount: v.number(),
    timestamp: v.number(),
  })
    .index("by_ipo", ["ipoId"])
    .index("by_timestamp", ["timestamp"])
    .index("by_ipo_and_timestamp", ["ipoId", "timestamp"]),

  // User preferences and settings (for future use)
  userSettings: defineTable({
    userId: v.string(),
    preferences: v.object({
      defaultView: v.optional(v.string()),
      notifications: v.optional(v.boolean()),
      favoriteIPOs: v.optional(v.array(v.id("ipos"))),
      filterPresets: v.optional(v.array(v.any())),
    }),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"]),

  // System logs for tracking updates and changes
  systemLogs: defineTable({
    action: v.string(),
    entityType: v.string(),
    entityId: v.optional(v.string()),
    details: v.object({
      changes: v.optional(v.any()),
      source: v.optional(v.string()),
      metadata: v.optional(v.any()),
    }),
    timestamp: v.number(),
  })
    .index("by_timestamp", ["timestamp"])
    .index("by_action", ["action"])
    .index("by_entity", ["entityType", "entityId"]),
});
