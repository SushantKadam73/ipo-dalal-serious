import { mutation } from "./_generated/server";
import { Id } from "./_generated/dataModel";

// ============================================
// DATABASE SEEDING FUNCTIONS
// ============================================

// Seed IPO master data
export const seedIPOs = mutation({
  handler: async (ctx) => {
    // Clear existing data (for development/testing only)
    const existingIPOs = await ctx.db.query("ipos").collect();
    for (const ipo of existingIPOs) {
      await ctx.db.delete(ipo._id);
    }
    
    // Clear related data
    const existingGMP = await ctx.db.query("current_gmp").collect();
    for (const gmp of existingGMP) {
      await ctx.db.delete(gmp._id);
    }
    
    const existingSub = await ctx.db.query("current_subscription").collect();
    for (const sub of existingSub) {
      await ctx.db.delete(sub._id);
    }
    
    const timestamp = Date.now();
    
    // Live IPOs Data (mapping from mock data)
    const liveIPOsData = [
      {
        company_name: "Swiggy Limited",
        type: "Mainline" as const,
        ipo_size_cr: 11327,
        price_per_share: 390,
        price_min: 371,
        price_max: 390,
        lot_size: 13,
        retail_min_lot_size: 13,
        shni_min_lot_size: 26,
        bhni_min_lot_size: 65,
        retail_amount: 5070,
        shni_amount: 10140,
        opening_date: "2024-11-06",
        closing_date: "2024-11-08",
        allotment_date: "2024-11-12",
        refund_date: "2024-11-13",
        listing_date: "2024-11-15",
        status: "open" as const,
        exchange: "Both" as const,
        sector: "Consumer Services",
        industry: "Food Delivery",
        lead_managers: ["Kotak Mahindra", "Citigroup", "ICICI Securities"],
        created_by: "seed",
        last_modified: timestamp,
        // GMP Data
        gmp_percent: 8.5,
        gmp_price: 33,
        kostak_rates: 25,
        retail_sauda_rates: 15,
        shni_sauda_rates: 25,
        // Subscription Data
        qib_sub: 3.12,
        bhni_sub: 1.87,
        shni_sub: 2.54,
        retail_sub: 1.23,
        emp_sub: 4.67,
        sh_sub: 2.11,
        total_sub: 2.15,
        total_amount_applied: 24352,
        total_bid_amount: 35000,
        total_applications: 1250000,
      },
      {
        company_name: "Godavari Biorefineries",
        type: "NSE SME" as const,
        ipo_size_cr: 343,
        price_per_share: 352,
        price_min: 334,
        price_max: 352,
        lot_size: 150,
        retail_min_lot_size: 150,
        shni_min_lot_size: 300,
        bhni_min_lot_size: 750,
        retail_amount: 52800,
        shni_amount: 105600,
        opening_date: "2024-11-04",
        closing_date: "2024-11-06",
        allotment_date: "2024-11-11",
        refund_date: "2024-11-12",
        listing_date: "2024-11-14",
        status: "open" as const,
        exchange: "NSE" as const,
        sector: "Chemicals",
        industry: "Bio-refineries",
        lead_managers: ["Aryaman Financial", "Hem Securities"],
        created_by: "seed",
        last_modified: timestamp,
        // GMP Data
        gmp_percent: 22.7,
        gmp_price: 80,
        kostak_rates: 60,
        retail_sauda_rates: 45,
        shni_sauda_rates: 70,
        // Subscription Data
        qib_sub: 12.45,
        bhni_sub: 8.92,
        shni_sub: 15.67,
        retail_sub: 18.34,
        emp_sub: 5.23,
        sh_sub: 3.45,
        total_sub: 14.23,
        total_amount_applied: 4881,
        total_bid_amount: 6200,
        total_applications: 85000,
      },
      {
        company_name: "NTPC Green Energy",
        type: "Mainline" as const,
        ipo_size_cr: 10000,
        price_per_share: 108,
        price_min: 102,
        price_max: 108,
        lot_size: 14,
        retail_min_lot_size: 14,
        shni_min_lot_size: 28,
        bhni_min_lot_size: 70,
        retail_amount: 1512,
        shni_amount: 3024,
        opening_date: "2024-11-19",
        closing_date: "2024-11-22",
        allotment_date: "2024-11-26",
        refund_date: "2024-11-27",
        listing_date: "2024-11-29",
        status: "upcoming" as const,
        exchange: "Both" as const,
        sector: "Utilities",
        industry: "Renewable Energy",
        lead_managers: ["ICICI Securities", "SBI Capital Markets", "HDFC Bank"],
        created_by: "seed",
        last_modified: timestamp,
        // GMP Data
        gmp_percent: 5.6,
        gmp_price: 6,
        kostak_rates: 4,
        retail_sauda_rates: 2,
        shni_sauda_rates: 5,
        // Subscription Data
        qib_sub: 2.87,
        bhni_sub: 1.45,
        shni_sub: 1.98,
        retail_sub: 0.89,
        emp_sub: 3.45,
        sh_sub: 1.67,
        total_sub: 1.92,
        total_amount_applied: 19200,
        total_bid_amount: 28000,
        total_applications: 2800000,
      },
      {
        company_name: "Kross Limited",
        type: "BSE SME" as const,
        ipo_size_cr: 55,
        price_per_share: 28,
        price_min: 25,
        price_max: 28,
        lot_size: 2000,
        retail_min_lot_size: 2000,
        shni_min_lot_size: 4000,
        bhni_min_lot_size: 10000,
        retail_amount: 56000,
        shni_amount: 112000,
        opening_date: "2024-11-01",
        closing_date: "2024-11-05",
        allotment_date: "2024-11-08",
        refund_date: "2024-11-09",
        listing_date: "2024-11-12",
        status: "open" as const,
        exchange: "BSE" as const,
        sector: "Consumer Discretionary",
        industry: "Textiles",
        lead_managers: ["Vivro Financial Services"],
        created_by: "seed",
        last_modified: timestamp,
        // GMP Data
        gmp_percent: 35.7,
        gmp_price: 10,
        kostak_rates: 8,
        retail_sauda_rates: 6,
        shni_sauda_rates: 10,
        // Subscription Data
        qib_sub: 45.67,
        bhni_sub: 32.45,
        shni_sub: 67.89,
        retail_sub: 89.23,
        emp_sub: 12.34,
        sh_sub: 8.76,
        total_sub: 52.45,
        total_amount_applied: 2885,
        total_bid_amount: 3200,
        total_applications: 45000,
      }
    ];
    
    // Listed IPOs Data
    const listedIPOsData = [
      {
        company_name: "Hyundai Motor India",
        type: "Mainline" as const,
        symbol: "HYUNDAIMOTOR",
        ipo_size_cr: 27870,
        price_per_share: 1960,
        price_min: 1865,
        price_max: 1960,
        lot_size: 7,
        retail_min_lot_size: 7,
        shni_min_lot_size: 14,
        bhni_min_lot_size: 35,
        retail_amount: 13720,
        shni_amount: 27440,
        opening_date: "2024-10-15",
        closing_date: "2024-10-17",
        allotment_date: "2024-10-21",
        refund_date: "2024-10-22",
        listing_date: "2024-10-24",
        status: "listed" as const,
        exchange: "Both" as const,
        sector: "Automotive",
        industry: "Automobile Manufacturing",
        lead_managers: ["Kotak Mahindra", "Citigroup", "HSBC Securities", "ICICI Securities", "J.P. Morgan"],
        listing_price: 1934,
        actual_profit_retail: -182,
        actual_profit_shni: -364,
        listing_gains: -1.33,
        created_by: "seed",
        last_modified: timestamp,
        // GMP Data
        gmp_percent: -1.5,
        gmp_price: -30,
        kostak_rates: 0,
        retail_sauda_rates: 0,
        shni_sauda_rates: 0,
        // Subscription Data
        qib_sub: 7.48,
        bhni_sub: 0.24,
        shni_sub: 0.60,
        retail_sub: 0.50,
        emp_sub: 1.84,
        sh_sub: 2.87,
        total_sub: 2.37,
        total_amount_applied: 66079,
        total_bid_amount: 85000,
        total_applications: 920000,
      },
      {
        company_name: "Paramount Communications",
        type: "NSE SME" as const,
        symbol: "PARAMOUNT",
        ipo_size_cr: 33,
        price_per_share: 42,
        price_min: 40,
        price_max: 42,
        lot_size: 800,
        retail_min_lot_size: 800,
        shni_min_lot_size: 1600,
        bhni_min_lot_size: 4000,
        retail_amount: 33600,
        shni_amount: 67200,
        opening_date: "2024-10-21",
        closing_date: "2024-10-24",
        allotment_date: "2024-10-28",
        refund_date: "2024-10-29",
        listing_date: "2024-10-31",
        status: "listed" as const,
        exchange: "NSE" as const,
        sector: "Communication Services",
        industry: "Media & Entertainment",
        lead_managers: ["Beeline Capital Advisors"],
        listing_price: 52,
        actual_profit_retail: 8000,
        actual_profit_shni: 16000,
        listing_gains: 23.81,
        created_by: "seed",
        last_modified: timestamp,
        // GMP Data
        gmp_percent: 19.0,
        gmp_price: 8,
        kostak_rates: 6,
        retail_sauda_rates: 4,
        shni_sauda_rates: 8,
        // Subscription Data
        qib_sub: 156.78,
        bhni_sub: 89.45,
        shni_sub: 234.67,
        retail_sub: 289.34,
        emp_sub: 45.23,
        sh_sub: 67.89,
        total_sub: 178.45,
        total_amount_applied: 5889,
        total_bid_amount: 7200,
        total_applications: 125000,
      },
      {
        company_name: "Bajaj Housing Finance",
        type: "Mainline" as const,
        symbol: "BAJAJHFL",
        ipo_size_cr: 6560,
        price_per_share: 70,
        price_min: 66,
        price_max: 70,
        lot_size: 12,
        retail_min_lot_size: 12,
        shni_min_lot_size: 24,
        bhni_min_lot_size: 60,
        retail_amount: 840,
        shni_amount: 1680,
        opening_date: "2024-09-09",
        closing_date: "2024-09-11",
        allotment_date: "2024-09-16",
        refund_date: "2024-09-17",
        listing_date: "2024-09-19",
        status: "listed" as const,
        exchange: "Both" as const,
        sector: "Financial Services",
        industry: "Housing Finance",
        lead_managers: ["Kotak Mahindra", "SBI Capital Markets", "HDFC Bank", "ICICI Securities"],
        listing_price: 150,
        actual_profit_retail: 960,
        actual_profit_shni: 1920,
        listing_gains: 114.29,
        created_by: "seed",
        last_modified: timestamp,
        // GMP Data
        gmp_percent: 57.1,
        gmp_price: 40,
        kostak_rates: 30,
        retail_sauda_rates: 25,
        shni_sauda_rates: 40,
        // Subscription Data
        qib_sub: 6.78,
        bhni_sub: 12.45,
        shni_sub: 18.67,
        retail_sub: 67.89,
        emp_sub: 234.56,
        sh_sub: 45.23,
        total_sub: 63.45,
        total_amount_applied: 41632,
        total_bid_amount: 58000,
        total_applications: 4200000,
      }
    ];
    
    const allIPOsData = [...liveIPOsData, ...listedIPOsData];
    const insertedIPOs: { ipoId: Id<"ipos">, data: any }[] = [];
    
    // Insert IPO master data
    for (const ipoData of allIPOsData) {
      const { gmp_percent, gmp_price, kostak_rates, retail_sauda_rates, shni_sauda_rates,
              qib_sub, bhni_sub, shni_sub, retail_sub, emp_sub, sh_sub, total_sub,
              total_amount_applied, total_bid_amount, total_applications, ...ipoMasterData } = ipoData;
      
      const ipoId = await ctx.db.insert("ipos", ipoMasterData);
      insertedIPOs.push({ ipoId, data: ipoData });
    }
    
    // Insert current GMP and subscription data
    for (const { ipoId, data } of insertedIPOs) {
      // Insert current GMP data
      await ctx.db.insert("current_gmp", {
        ipo_id: ipoId,
        gmp_percent: data.gmp_percent,
        gmp_price: data.gmp_price,
        kostak_rates: data.kostak_rates,
        retail_sauda_rates: data.retail_sauda_rates,
        shni_sauda_rates: data.shni_sauda_rates,
        source: "seed_data",
        last_updated: timestamp,
        data_freshness: 0,
        est_listing_price: data.price_per_share + data.gmp_price,
        est_retail_profit: data.gmp_price * data.retail_min_lot_size,
        est_shni_profit: data.shni_sauda_rates ? data.gmp_price * data.shni_min_lot_size : undefined,
      });
      
      // Insert current subscription data
      await ctx.db.insert("current_subscription", {
        ipo_id: ipoId,
        qib_sub: data.qib_sub,
        bhni_sub: data.bhni_sub,
        shni_sub: data.shni_sub,
        retail_sub: data.retail_sub,
        emp_sub: data.emp_sub,
        sh_sub: data.sh_sub,
        total_sub: data.total_sub,
        total_amount_applied: data.total_amount_applied,
        total_bid_amount: data.total_bid_amount,
        total_applications: data.total_applications,
        source: "seed_data",
        last_updated: timestamp,
        data_freshness: 0,
      });
    }
    
    // Log the seeding operation
    await ctx.db.insert("system_logs", {
      action: "seed_database",
      entity_type: "all",
      details: {
        source: "seed_data",
        metadata: {
          ipos_inserted: insertedIPOs.length,
          timestamp: timestamp,
        },
      },
      timestamp,
    });
    
    return {
      success: true,
      ipos_inserted: insertedIPOs.length,
      message: "Database seeded successfully with mock IPO data",
    };
  }
});

// Seed historical GMP data for charts
export const seedGMPHistory = mutation({
  handler: async (ctx) => {
    const ipos = await ctx.db.query("ipos").collect();
    
    if (ipos.length === 0) {
      throw new Error("No IPOs found. Please seed IPOs first.");
    }
    
    const timestamp = Date.now();
    const batchId = `seed_gmp_history_${timestamp}`;
    
    // Generate 7 days of historical data for each IPO
    const historicalDataCount = 7;
    let totalInserted = 0;
    
    for (const ipo of ipos) {
      // Get current GMP data for this IPO
      const currentGMP = await ctx.db
        .query("current_gmp")
        .withIndex("by_ipo", (q) => q.eq("ipo_id", ipo._id))
        .first();
      
      if (!currentGMP) continue;
      
      // Generate historical data points
      for (let i = historicalDataCount; i >= 0; i--) {
        const dayTimestamp = timestamp - (i * 24 * 60 * 60 * 1000);
        const date = new Date(dayTimestamp).toISOString().split('T')[0];
        
        // Add some variance to the GMP data for realistic history
        const variance = (Math.random() - 0.5) * 5; // ±2.5% variance
        const historicalGMPPercent = Math.max(-50, Math.min(200, currentGMP.gmp_percent + variance));
        const historicalGMPPrice = (historicalGMPPercent / 100) * ipo.price_per_share;
        
        await ctx.db.insert("gmp_history", {
          ipo_id: ipo._id,
          timestamp: dayTimestamp,
          date,
          gmp_percent: historicalGMPPercent,
          gmp_price: historicalGMPPrice,
          kostak_rates: currentGMP.kostak_rates + (Math.random() - 0.5) * 10,
          retail_sauda_rates: currentGMP.retail_sauda_rates + (Math.random() - 0.5) * 5,
          shni_sauda_rates: currentGMP.shni_sauda_rates ? 
            currentGMP.shni_sauda_rates + (Math.random() - 0.5) * 5 : undefined,
          source: "seed_data",
          scrape_batch_id: batchId,
        });
        
        totalInserted++;
      }
    }
    
    // Log the seeding operation
    await ctx.db.insert("system_logs", {
      action: "seed_gmp_history",
      entity_type: "gmp",
      details: {
        source: "seed_data",
        batch_id: batchId,
        metadata: {
          records_inserted: totalInserted,
          days_of_history: historicalDataCount,
        },
      },
      timestamp,
    });
    
    return {
      success: true,
      records_inserted: totalInserted,
      message: `Seeded ${totalInserted} GMP history records`,
    };
  }
});

// Seed historical subscription data
export const seedSubscriptionHistory = mutation({
  handler: async (ctx) => {
    const ipos = await ctx.db.query("ipos").collect();
    
    if (ipos.length === 0) {
      throw new Error("No IPOs found. Please seed IPOs first.");
    }
    
    const timestamp = Date.now();
    const batchId = `seed_subscription_history_${timestamp}`;
    
    // Generate 3 days of historical subscription data (subscription builds up over time)
    const historicalDataCount = 3;
    let totalInserted = 0;
    
    for (const ipo of ipos) {
      // Get current subscription data for this IPO
      const currentSub = await ctx.db
        .query("current_subscription")
        .withIndex("by_ipo", (q) => q.eq("ipo_id", ipo._id))
        .first();
      
      if (!currentSub) continue;
      
      // Generate progressive subscription data (starts low, builds up)
      for (let i = historicalDataCount; i >= 0; i--) {
        const dayTimestamp = timestamp - (i * 24 * 60 * 60 * 1000);
        const date = new Date(dayTimestamp).toISOString().split('T')[0];
        
        // Calculate subscription progression (starts at 20% of current, builds to 100%)
        const progressionFactor = 0.2 + (0.8 * (historicalDataCount - i) / historicalDataCount);
        
        await ctx.db.insert("subscription_history", {
          ipo_id: ipo._id,
          timestamp: dayTimestamp,
          date,
          qib_sub: currentSub.qib_sub * progressionFactor,
          bhni_sub: currentSub.bhni_sub * progressionFactor,
          shni_sub: currentSub.shni_sub * progressionFactor,
          retail_sub: currentSub.retail_sub * progressionFactor,
          emp_sub: currentSub.emp_sub * progressionFactor,
          sh_sub: currentSub.sh_sub * progressionFactor,
          total_sub: currentSub.total_sub * progressionFactor,
          total_amount_applied: currentSub.total_amount_applied * progressionFactor,
          total_bid_amount: currentSub.total_bid_amount ? 
            currentSub.total_bid_amount * progressionFactor : undefined,
          total_applications: currentSub.total_applications ? 
            Math.floor(currentSub.total_applications * progressionFactor) : undefined,
          source: "seed_data",
          scrape_batch_id: batchId,
        });
        
        totalInserted++;
      }
    }
    
    // Log the seeding operation
    await ctx.db.insert("system_logs", {
      action: "seed_subscription_history",
      entity_type: "subscription",
      details: {
        source: "seed_data",
        batch_id: batchId,
        metadata: {
          records_inserted: totalInserted,
          days_of_history: historicalDataCount,
        },
      },
      timestamp,
    });
    
    return {
      success: true,
      records_inserted: totalInserted,
      message: `Seeded ${totalInserted} subscription history records`,
    };
  }
});

// Simple function to clear database
export const clearAllData = mutation({
  handler: async (ctx) => {
    // Clear all IPO-related data
    const existingIPOs = await ctx.db.query("ipos").collect();
    for (const ipo of existingIPOs) {
      await ctx.db.delete(ipo._id);
    }
    
    const existingGMP = await ctx.db.query("current_gmp").collect();
    for (const gmp of existingGMP) {
      await ctx.db.delete(gmp._id);
    }
    
    const existingSub = await ctx.db.query("current_subscription").collect();
    for (const sub of existingSub) {
      await ctx.db.delete(sub._id);
    }
    
    const existingGMPHistory = await ctx.db.query("gmp_history").collect();
    for (const gmp of existingGMPHistory) {
      await ctx.db.delete(gmp._id);
    }
    
    const existingSubHistory = await ctx.db.query("subscription_history").collect();
    for (const sub of existingSubHistory) {
      await ctx.db.delete(sub._id);
    }
    
    return { success: true, message: "All data cleared successfully" };
  }
});