/**
 * Mock data for IPO Dalal development and testing
 */

import { IPO, LiveIPO, ListedIPO } from "@/types/ipo";

// Mock Live IPOs (Upcoming and Active)
export const mockLiveIPOs: LiveIPO[] = [
  {
    id: "ipo_1",
    type: "Mainboard",
    company: "Swiggy Limited",
    ipoSize: 11327,
    lot: 13,
    price: { min: 371, max: 390 },
    amount: {
      retail: 5070, // 13 * 390
      shni: 10140  // 2 lots
    },
    gmp: {
      percentage: 8.5,
      price: 33,
      estListingPrice: 423,
      estProfit: {
        retail: 429, // (423-390) * 13
        shni: 858
      }
    },
    subscription: {
      qib: 3.12,
      bhni: 1.87,
      shni: 2.54,
      retail: 1.23,
      employee: 4.67,
      shareholder: 2.11,
      total: 2.15,
      totalAmount: 24352,
      totalBidAmount: 35000,
      totalApplications: 1250000
    },
    dates: {
      opening: new Date('2024-11-06'),
      closing: new Date('2024-11-08'),
      allotment: new Date('2024-11-12'),
      refund: new Date('2024-11-13'),
      listing: new Date('2024-11-15')
    },
    status: "active",
    kostakRates: { retail: 25, shni: 40 },
    subjectToSauda: { retail: 15, shni: 25 },
    exchange: "Both",
    sector: "Consumer Services",
    industry: "Food Delivery",
    leadManagers: ["Kotak Mahindra", "Citigroup", "ICICI Securities"],
    lastUpdated: new Date(),
    createdAt: new Date('2024-10-25')
  },
  {
    id: "ipo_2",
    type: "NSE SME",
    company: "Godavari Biorefineries",
    ipoSize: 343,
    lot: 150,
    price: { min: 334, max: 352 },
    amount: {
      retail: 52800, // 150 * 352
      shni: 105600   // 2 lots
    },
    gmp: {
      percentage: 22.7,
      price: 80,
      estListingPrice: 432,
      estProfit: {
        retail: 12000, // (432-352) * 150
        shni: 24000
      }
    },
    subscription: {
      qib: 12.45,
      bhni: 8.92,
      shni: 15.67,
      retail: 18.34,
      employee: 5.23,
      shareholder: 3.45,
      total: 14.23,
      totalAmount: 4881,
      totalBidAmount: 6200,
      totalApplications: 85000
    },
    dates: {
      opening: new Date('2024-11-04'),
      closing: new Date('2024-11-06'),
      allotment: new Date('2024-11-11'),
      refund: new Date('2024-11-12'),
      listing: new Date('2024-11-14')
    },
    status: "active",
    kostakRates: { retail: 60, shni: 85 },
    subjectToSauda: { retail: 45, shni: 70 },
    exchange: "NSE",
    sector: "Chemicals",
    industry: "Bio-refineries",
    leadManagers: ["Aryaman Financial", "Hem Securities"],
    lastUpdated: new Date(),
    createdAt: new Date('2024-10-20')
  },
  {
    id: "ipo_3",
    type: "Mainboard",
    company: "NTPC Green Energy",
    ipoSize: 10000,
    lot: 14,
    price: { min: 102, max: 108 },
    amount: {
      retail: 1512, // 14 * 108
      shni: 3024    // 2 lots
    },
    gmp: {
      percentage: 5.6,
      price: 6,
      estListingPrice: 114,
      estProfit: {
        retail: 84, // (114-108) * 14
        shni: 168
      }
    },
    subscription: {
      qib: 2.87,
      bhni: 1.45,
      shni: 1.98,
      retail: 0.89,
      employee: 3.45,
      shareholder: 1.67,
      total: 1.92,
      totalAmount: 19200,
      totalBidAmount: 28000,
      totalApplications: 2800000
    },
    dates: {
      opening: new Date('2024-11-19'),
      closing: new Date('2024-11-22'),
      allotment: new Date('2024-11-26'),
      refund: new Date('2024-11-27'),
      listing: new Date('2024-11-29')
    },
    status: "upcoming",
    kostakRates: { retail: 4, shni: 8 },
    subjectToSauda: { retail: 2, shni: 5 },
    exchange: "Both",
    sector: "Utilities",
    industry: "Renewable Energy",
    leadManagers: ["ICICI Securities", "SBI Capital Markets", "HDFC Bank"],
    lastUpdated: new Date(),
    createdAt: new Date('2024-10-15')
  },
  {
    id: "ipo_4",
    type: "BSE SME",
    company: "Kross Limited",
    ipoSize: 55,
    lot: 2000,
    price: { min: 25, max: 28 },
    amount: {
      retail: 56000,  // 2000 * 28
      shni: 112000    // 2 lots
    },
    gmp: {
      percentage: 35.7,
      price: 10,
      estListingPrice: 38,
      estProfit: {
        retail: 20000, // (38-28) * 2000
        shni: 40000
      }
    },
    subscription: {
      qib: 45.67,
      bhni: 32.45,
      shni: 67.89,
      retail: 89.23,
      employee: 12.34,
      shareholder: 8.76,
      total: 52.45,
      totalAmount: 2885,
      totalBidAmount: 3200,
      totalApplications: 45000
    },
    dates: {
      opening: new Date('2024-11-01'),
      closing: new Date('2024-11-05'),
      allotment: new Date('2024-11-08'),
      refund: new Date('2024-11-09'),
      listing: new Date('2024-11-12')
    },
    status: "active",
    kostakRates: { retail: 8, shni: 12 },
    subjectToSauda: { retail: 6, shni: 10 },
    exchange: "BSE",
    sector: "Consumer Discretionary",
    industry: "Textiles",
    leadManagers: ["Vivro Financial Services"],
    lastUpdated: new Date(),
    createdAt: new Date('2024-10-10')
  }
];

// Mock Listed IPOs (Historical data)
export const mockListedIPOs: ListedIPO[] = [
  {
    id: "ipo_listed_1",
    type: "Mainboard",
    company: "Hyundai Motor India",
    symbol: "HYUNDAIMOTOR",
    ipoSize: 27870,
    lot: 7,
    price: { min: 1865, max: 1960 },
    amount: {
      retail: 13720, // 7 * 1960
      shni: 27440    // 2 lots
    },
    gmp: {
      percentage: -1.5,
      price: -30,
      estListingPrice: 1930,
      estProfit: {
        retail: -210, // (1930-1960) * 7
        shni: -420
      }
    },
    subscription: {
      qib: 7.48,
      bhni: 0.24,
      shni: 0.60,
      retail: 0.50,
      employee: 1.84,
      shareholder: 2.87,
      total: 2.37,
      totalAmount: 66079,
      totalBidAmount: 85000,
      totalApplications: 920000
    },
    dates: {
      opening: new Date('2024-10-15'),
      closing: new Date('2024-10-17'),
      allotment: new Date('2024-10-21'),
      refund: new Date('2024-10-22'),
      listing: new Date('2024-10-24')
    },
    status: "listed",
    kostakRates: { retail: 0, shni: 0 },
    subjectToSauda: { retail: 0, shni: 0 },
    exchange: "Both",
    sector: "Automotive",
    industry: "Automobile Manufacturing",
    leadManagers: ["Kotak Mahindra", "Citigroup", "HSBC Securities", "ICICI Securities", "J.P. Morgan"],
    listingPrice: 1934,
    actualProfit: {
      retail: -182, // (1934-1960) * 7
      shni: -364
    },
    listingGains: -1.33, // (1934-1960)/1960 * 100
    listingDate: new Date('2024-10-24'),
    lastUpdated: new Date(),
    createdAt: new Date('2024-09-20')
  },
  {
    id: "ipo_listed_2",
    type: "NSE SME",
    company: "Paramount Communications",
    symbol: "PARAMOUNT",
    ipoSize: 33,
    lot: 800,
    price: { min: 40, max: 42 },
    amount: {
      retail: 33600, // 800 * 42
      shni: 67200    // 2 lots
    },
    gmp: {
      percentage: 19.0,
      price: 8,
      estListingPrice: 50,
      estProfit: {
        retail: 6400, // (50-42) * 800
        shni: 12800
      }
    },
    subscription: {
      qib: 156.78,
      bhni: 89.45,
      shni: 234.67,
      retail: 289.34,
      employee: 45.23,
      shareholder: 67.89,
      total: 178.45,
      totalAmount: 5889,
      totalBidAmount: 7200,
      totalApplications: 125000
    },
    dates: {
      opening: new Date('2024-10-21'),
      closing: new Date('2024-10-24'),
      allotment: new Date('2024-10-28'),
      refund: new Date('2024-10-29'),
      listing: new Date('2024-10-31')
    },
    status: "listed",
    kostakRates: { retail: 6, shni: 10 },
    subjectToSauda: { retail: 4, shni: 8 },
    exchange: "NSE",
    sector: "Communication Services",
    industry: "Media & Entertainment",
    leadManagers: ["Beeline Capital Advisors"],
    listingPrice: 52,
    actualProfit: {
      retail: 8000, // (52-42) * 800
      shni: 16000
    },
    listingGains: 23.81, // (52-42)/42 * 100
    listingDate: new Date('2024-10-31'),
    lastUpdated: new Date(),
    createdAt: new Date('2024-10-05')
  },
  {
    id: "ipo_listed_3",
    type: "Mainboard",
    company: "Bajaj Housing Finance",
    symbol: "BAJAJHFL",
    ipoSize: 6560,
    lot: 12,
    price: { min: 66, max: 70 },
    amount: {
      retail: 840,  // 12 * 70
      shni: 1680    // 2 lots
    },
    gmp: {
      percentage: 57.1,
      price: 40,
      estListingPrice: 110,
      estProfit: {
        retail: 480, // (110-70) * 12
        shni: 960
      }
    },
    subscription: {
      qib: 6.78,
      bhni: 12.45,
      shni: 18.67,
      retail: 67.89,
      employee: 234.56,
      shareholder: 45.23,
      total: 63.45,
      totalAmount: 41632,
      totalBidAmount: 58000,
      totalApplications: 4200000
    },
    dates: {
      opening: new Date('2024-09-09'),
      closing: new Date('2024-09-11'),
      allotment: new Date('2024-09-16'),
      refund: new Date('2024-09-17'),
      listing: new Date('2024-09-19')
    },
    status: "listed",
    kostakRates: { retail: 30, shni: 45 },
    subjectToSauda: { retail: 25, shni: 40 },
    exchange: "Both",
    sector: "Financial Services",
    industry: "Housing Finance",
    leadManagers: ["Kotak Mahindra", "SBI Capital Markets", "HDFC Bank", "ICICI Securities"],
    listingPrice: 150,
    actualProfit: {
      retail: 960, // (150-70) * 12
      shni: 1920
    },
    listingGains: 114.29, // (150-70)/70 * 100
    listingDate: new Date('2024-09-19'),
    lastUpdated: new Date(),
    createdAt: new Date('2024-08-15')
  }
];

// Combined data for easier access
export const allMockIPOs: IPO[] = [...mockLiveIPOs, ...mockListedIPOs];

// Dashboard stats derived from mock data
export const mockDashboardStats = {
  totalActiveIPOs: mockLiveIPOs.filter(ipo => ipo.status === "active").length,
  totalUpcomingIPOs: mockLiveIPOs.filter(ipo => ipo.status === "upcoming").length,
  avgGMP: mockLiveIPOs.reduce((sum, ipo) => sum + ipo.gmp.percentage, 0) / mockLiveIPOs.length,
  totalSubscribed: mockLiveIPOs.reduce((sum, ipo) => sum + ipo.subscription.total, 0) / mockLiveIPOs.length,
  marketValue: mockLiveIPOs.reduce((sum, ipo) => sum + ipo.ipoSize, 0)
};

// Helper functions for data manipulation
export function getIPOsByStatus(status: IPO['status']): IPO[] {
  return allMockIPOs.filter(ipo => ipo.status === status);
}

export function getIPOsByType(type: IPO['type']): IPO[] {
  return allMockIPOs.filter(ipo => ipo.type === type);
}

export function getActiveIPOs(): LiveIPO[] {
  return mockLiveIPOs.filter(ipo => ipo.status === "active");
}

export function getUpcomingIPOs(): LiveIPO[] {
  return mockLiveIPOs.filter(ipo => ipo.status === "upcoming");
}

export function getListedIPOs(): ListedIPO[] {
  return mockListedIPOs;
}

// Sample GMP history data for charts
export const mockGMPHistory = {
  ipo_1: [
    { date: "2024-01-15", value: 5.2, label: "5.2%" },
    { date: "2024-01-16", value: 6.8, label: "6.8%" },
    { date: "2024-01-17", value: 7.5, label: "7.5%" },
    { date: "2024-01-18", value: 8.1, label: "8.1%" },
    { date: "2024-01-19", value: 8.5, label: "8.5%" },
  ],
  ipo_2: [
    { date: "2024-01-13", value: 18.2, label: "18.2%" },
    { date: "2024-01-14", value: 20.1, label: "20.1%" },
    { date: "2024-01-15", value: 21.8, label: "21.8%" },
    { date: "2024-01-16", value: 22.3, label: "22.3%" },
    { date: "2024-01-17", value: 22.7, label: "22.7%" },
  ]
};