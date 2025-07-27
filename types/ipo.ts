/**
 * TypeScript definitions for IPO Dalal data structures
 */

export interface IPOPrice {
  min: number;
  max: number;
}

export interface GMPData {
  percentage: number;
  price: number;
  estListingPrice: number;
  estProfit: {
    retail: number;
    shni: number;
  };
}

export interface SubscriptionData {
  qib: number;           // Qualified Institutional Buyers
  bhni: number;          // Big HNI (> 10L)
  shni: number;          // Small HNI (2L - 10L)
  retail: number;        // Retail Individual Investors
  employee: number;      // Employee quota
  shareholder: number;   // Shareholder quota
  total: number;         // Total subscription
  totalAmount: number;   // Total amount applied (in crores)
}

export interface IPODates {
  opening: Date;
  closing: Date;
  allotment: Date;
  refund: Date;
  listing: Date;
}

export interface KostakRates {
  retail: number;
  shni: number;
}

export interface SubjectToSauda {
  retail: number;
  shni: number;
}

export type IPOType = "BSE SME" | "NSE SME" | "Mainboard";
export type IPOStatus = "upcoming" | "active" | "closed" | "listed" | "cancelled";
export type ExchangeType = "NSE" | "BSE" | "Both";

export interface IPO {
  id: string;
  type: IPOType;
  company: string;
  symbol?: string;              // Stock symbol for listed IPOs
  ipoSize: number;              // in crores
  lot: number;                  // shares per lot
  price: IPOPrice;              // price range
  amount: {                     // investment amount per lot
    retail: number;
    shni: number;
  };
  gmp: GMPData;
  subscription: SubscriptionData & {
    totalBidAmount: number;     // in crores
    totalApplications: number;  // number of applications
  };
  dates: IPODates;
  status: IPOStatus;
  kostakRates: KostakRates;
  subjectToSauda: SubjectToSauda;
  
  // Optional fields for listed IPOs
  listingPrice?: number;
  actualProfit?: {
    retail: number;
    shni: number;
  };
  listingGains?: number;        // percentage gain/loss
  
  // Additional metadata
  exchange: ExchangeType;       // Which exchange IPO is listed on
  sector: string;               // Industry/sector
  industry: string;             // More specific industry classification
  leadManagers: string[];
  
  // Real-time tracking
  lastUpdated: Date;
  createdAt: Date;
}

export interface LiveIPO extends IPO {
  status: "upcoming" | "active";
  countdown?: string;           // Formatted countdown string
}

export interface ListedIPO extends IPO {
  status: "listed";
  listingPrice: number;
  actualProfit: {
    retail: number;
    shni: number;
  };
  listingGains: number;
  listingDate: Date;
}

// Table column definitions
export interface TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  width?: string;
  align?: "left" | "center" | "right";
  priority?: "high" | "medium" | "low"; // For responsive design
}

// Filter and sort options
export interface FilterOptions {
  type?: IPOType[];
  status?: IPOStatus[];
  gmpRange?: {
    min: number;
    max: number;
  };
  subscriptionRange?: {
    min: number;
    max: number;
  };
  sizeRange?: {
    min: number;
    max: number;
  };
  dateRange?: {
    start: Date;
    end: Date;
  };
}

export interface SortOptions {
  field: keyof IPO | "gmp.percentage" | "subscription.total" | "dates.closing";
  direction: "asc" | "desc";
}

// Dashboard summary data
export interface DashboardStats {
  totalActiveIPOs: number;
  totalUpcomingIPOs: number;
  avgGMP: number;
  totalSubscribed: number;
  marketValue: number;          // Total market value in crores
}

// Export/sharing interfaces
export interface ExportOptions {
  format: "csv" | "image";
  columns: string[];
  filters?: FilterOptions;
  watermark?: boolean;
}

// Real-time update events
export interface IPOUpdateEvent {
  ipoId: string;
  type: "gmp" | "subscription" | "status" | "general";
  data: Partial<IPO>;
  timestamp: Date;
}

// API response interfaces
export interface APIResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  timestamp: Date;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  timestamp: Date;
}

// Form interfaces for data input
export interface CreateIPOInput {
  type: IPOType;
  company: string;
  ipoSize: number;
  lot: number;
  price: IPOPrice;
  dates: Omit<IPODates, 'allotment' | 'refund' | 'listing'> & {
    allotment?: Date;
    refund?: Date;
    listing?: Date;
  };
  exchange: "NSE" | "BSE" | "Both";
  sector: string;
  leadManagers: string[];
}

export interface UpdateGMPInput {
  ipoId: string;
  gmpPercentage: number;
  gmpPrice: number;
  kostakRates?: KostakRates;
  subjectToSauda?: SubjectToSauda;
}

export interface UpdateSubscriptionInput {
  ipoId: string;
  subscription: Partial<SubscriptionData>;
}

// UI component props interfaces
export interface TableProps {
  data: IPO[];
  columns: TableColumn[];
  loading?: boolean;
  sortOptions?: SortOptions;
  onSort?: (options: SortOptions) => void;
  onRowClick?: (ipo: IPO) => void;
  className?: string;
}

export interface FilterPanelProps {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  onReset: () => void;
  className?: string;
}

export interface IPOCardProps {
  ipo: IPO;
  variant?: "compact" | "detailed";
  onClick?: () => void;
  className?: string;
}

// Chart data interfaces
export interface ChartDataPoint {
  date: string;
  value: number;
  label?: string;
}

export interface GMPHistoryData {
  ipoId: string;
  data: ChartDataPoint[];
}

export interface SubscriptionProgressData {
  category: keyof SubscriptionData;
  current: number;
  target?: number;
  percentage: number;
}