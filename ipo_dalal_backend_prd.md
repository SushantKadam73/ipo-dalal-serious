# IPO Dalal Backend - Product Requirements Document

## 1. Overview

### 1.1 Product Vision
The IPO Dalal backend serves as the core data processing and API layer for the comprehensive IPO tracking platform, handling real-time data ingestion, processing, validation, and delivery to support informed investment decisions for Indian investors.

### 1.2 Core Objectives
- **Real-time Data Processing**: Continuous ingestion and processing of IPO data from multiple sources
- **High Availability**: 99.9% uptime with automatic failover and recovery
- **Scalable Architecture**: Handle growing data volume and user base
- **Data Integrity**: Ensure accurate, consistent, and validated data across all services
- **API Performance**: Sub-500ms response times for all dashboard queries
- **Multi-source Integration**: Seamless integration with multiple data providers

### 1.3 Technology Stack
- **Runtime**: Node.js 18+ with TypeScript
- **Database**: Convex (Serverless, Real-time)
- **Web Scraping**: Puppeteer, Cheerio, Playwright
- **Caching**: Redis for session and query caching
- **Message Queue**: Convex Actions for background processing
- **Monitoring**: Sentry for error tracking, DataDog for metrics
- **Deployment**: Vercel for API routes, AWS Lambda for scrapers
- **Authentication**: Clerk for user management (future phase)

## 2. System Architecture

### 2.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              IPO Dalal Backend                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────┐    ┌──────────────────┐    ┌─────────────────────────┐ │
│  │  Data Sources   │    │   Scraper Layer  │    │    Processing Layer     │ │
│  │                 │    │                  │    │                         │ │
│  │ • InvestorGain  │───►│ • Web Scrapers   │───►│ • Data Validation       │ │
│  │ • Chittorgarh   │    │ • API Clients    │    │ • Transformation        │ │
│  │ • BSE/NSE APIs  │    │ • Rate Limiting  │    │ • Deduplication         │ │
│  │ • Manual Entry  │    │ • Error Handling │    │ • Quality Scoring       │ │
│  └─────────────────┘    └──────────────────┘    └─────────────────────────┘ │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────────┐ │
│  │                         Convex Database Layer                           │ │
│  │                                                                         │ │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────────────────┐ │ │
│  │  │ Master Tables   │  │ Historical Data │  │     Current State        │ │ │
│  │  │                 │  │                 │  │                          │ │ │
│  │  │ • ipos          │  │ • gmp_history   │  │ • current_gmp            │ │ │
│  │  │ • data_sources  │  │ • sub_history   │  │ • current_subscription   │ │ │
│  │  │ • scrape_logs   │  │ • error_logs    │  │ • system_health          │ │ │
│  │  └─────────────────┘  └─────────────────┘  └──────────────────────────┘ │ │
│  └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────────┐ │
│  │                          API & Services Layer                           │ │
│  │                                                                         │ │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────────────────┐ │ │
│  │  │ GraphQL/REST    │  │ Real-time APIs  │  │    Background Jobs       │ │ │
│  │  │                 │  │                 │  │                          │ │ │
│  │  │ • Query APIs    │  │ • WebSocket     │  │ • Scheduled Scraping     │ │ │
│  │  │ • Mutation APIs │  │ • Server Events │  │ • Data Cleanup           │ │ │
│  │  │ • File Exports  │  │ • Live Updates  │  │ • Health Monitoring      │ │ │
│  │  └─────────────────┘  └─────────────────┘  └──────────────────────────┘ │ │
│  └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────────┐ │
│  │                        Monitoring & Analytics                           │ │
│  │                                                                         │ │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────────────────┐ │ │
│  │  │ Error Tracking  │  │ Performance     │  │    Business Metrics     │ │ │
│  │  │                 │  │                 │  │                          │ │ │
│  │  │ • Sentry        │  │ • Response Time │  │ • Data Freshness         │ │ │
│  │  │ • Log Aggreg.   │  │ • Uptime        │  │ • Scraping Success       │ │ │
│  │  │ • Alerting      │  │ • DB Performance│  │ • User Analytics         │ │ │
│  │  └─────────────────┘  └─────────────────┘  └──────────────────────────┘ │ │
│  └─────────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 2.2 Data Flow Architecture

```
External Sources          Scraper Layer           Processing Layer         Database Layer
┌─────────────┐          ┌─────────────┐          ┌─────────────┐          ┌─────────────┐
│InvestorGain │          │   Chrome    │          │ Data        │          │   Convex    │
│   Website   │◄────────►│  Headless   │─────────►│Validator    │─────────►│  Database   │
└─────────────┘          │  Browser    │          └─────────────┘          └─────────────┘
                         └─────────────┘                  │                        │
┌─────────────┐          ┌─────────────┐          ┌─────────────┐                  │
│Chittorgarh  │          │   Puppeteer │          │Data         │                  │
│   Website   │◄────────►│   Scraper   │─────────►│Transformer  │                  │
└─────────────┘          └─────────────┘          └─────────────┘                  │
                                 │                        │                        │
┌─────────────┐          ┌─────────────┐          ┌─────────────┐                  │
│   BSE/NSE   │          │   HTTP      │          │   Batch     │                  │
│    APIs     │◄────────►│   Client    │─────────►│ Processor   │                  │
└─────────────┘          └─────────────┘          └─────────────┘                  │
                                 │                        │                        │
                         ┌─────────────┐          ┌─────────────┐                  │
                         │   Rate      │          │  Error      │                  │
                         │  Limiter    │          │ Handler     │                  │
                         └─────────────┘          └─────────────┘                  │
                                 │                        │                        │
                         ┌─────────────┐                  │                        │
                         │ Scheduler   │                  │                        │
                         │ (Cron Jobs) │──────────────────┘                        │
                         └─────────────┘                                           │
                                                                                   │
Frontend Layer                                    API Layer                       │
┌─────────────┐          ┌─────────────┐          ┌─────────────┐                  │
│   Next.js   │          │   Convex    │          │   Convex    │                  │
│  Frontend   │◄────────►│   Queries   │◄────────►│ Mutations   │◄─────────────────┘
└─────────────┘          └─────────────┘          └─────────────┘
       │                        │                        │
       │                 ┌─────────────┐          ┌─────────────┐
       │                 │  Real-time  │          │ Background  │
       └────────────────►│ WebSocket   │          │   Actions   │
                         └─────────────┘          └─────────────┘
```

### 2.3 Component Architecture

```
convex/
├── schema.ts                     # Database schema definitions
├── functions/
│   ├── queries/                  # Read operations
│   │   ├── dashboard.ts          # Dashboard data queries
│   │   ├── gmp.ts               # GMP-specific queries
│   │   ├── subscription.ts      # Subscription queries
│   │   ├── historical.ts        # Time-series data queries
│   │   └── analytics.ts         # Business analytics queries
│   ├── mutations/               # Write operations
│   │   ├── ipo.ts              # IPO CRUD operations
│   │   ├── gmp.ts              # GMP data updates
│   │   ├── subscription.ts     # Subscription data updates
│   │   └── batch.ts            # Batch processing operations
│   └── actions/                # Background tasks
│       ├── scrapers/           # Web scraping services
│       │   ├── investorGain.ts # InvestorGain scraper
│       │   ├── chittorgarh.ts  # Chittorgarh scraper
│       │   └── bseNse.ts       # BSE/NSE API client
│       ├── scheduler.ts        # Cron job scheduler
│       ├── cleanup.ts          # Data cleanup tasks
│       └── monitoring.ts       # Health monitoring
├── lib/
│   ├── scrapers/               # Scraping utilities
│   │   ├── base.ts            # Base scraper class
│   │   ├── browser.ts         # Browser management
│   │   ├── parser.ts          # HTML/data parsing
│   │   └── rateLimiter.ts     # Rate limiting logic
│   ├── validators/            # Data validation
│   │   ├── ipo.ts            # IPO data validation
│   │   ├── gmp.ts            # GMP data validation
│   │   └── subscription.ts   # Subscription validation
│   ├── transformers/          # Data transformation
│   │   ├── normalizer.ts     # Data normalization
│   │   ├── calculator.ts     # Derived field calculation
│   │   └── formatter.ts      # Indian localization
│   ├── utils/                # Utility functions
│   │   ├── dates.ts          # Date/time utilities
│   │   ├── numbers.ts        # Number formatting
│   │   ├── constants.ts      # System constants
│   │   └── logger.ts         # Logging utilities
│   └── integrations/         # External service integrations
│       ├── sentry.ts         # Error tracking
│       ├── analytics.ts      # Business analytics
│       └── notifications.ts  # Alert system
└── types/                    # TypeScript definitions
    ├── ipo.ts               # IPO-related types
    ├── scraper.ts           # Scraper types
    ├── api.ts               # API response types
    └── system.ts            # System-level types
```

## 3. Core Services

### 3.1 Data Ingestion Service

#### 3.1.1 Web Scraping Engine
**Purpose**: Extract IPO data from various websites

**Key Components**:
- **Browser Management**: Puppeteer/Playwright browser pool
- **Anti-Detection**: Rotating user agents, proxy support, CAPTCHA handling
- **Rate Limiting**: Respectful scraping with configurable delays
- **Error Recovery**: Automatic retry with exponential backoff
- **Data Extraction**: CSS/XPath selectors with fallback strategies

**Technical Specifications**:
```typescript
interface ScrapingConfig {
  source: 'InvestorGain' | 'Chittorgarh' | 'BSE' | 'NSE';
  schedule: string; // Cron expression
  rateLimitMs: number;
  maxRetries: number;
  timeout: number;
  selectors: {
    [key: string]: string; // CSS selectors for data extraction
  };
}

interface ScrapingResult {
  success: boolean;
  data: IPOData[];
  errors: string[];
  metrics: {
    duration: number;
    recordsProcessed: number;
    recordsSkipped: number;
  };
}
```

#### 3.1.2 API Integration Service
**Purpose**: Fetch data from official APIs (BSE, NSE)

**Features**:
- **Authentication Management**: API key rotation and renewal
- **Response Caching**: Redis caching for frequently accessed data
- **Rate Limiting**: Respect API provider limits
- **Data Validation**: Schema validation for API responses
- **Fallback Mechanisms**: Graceful degradation when APIs are unavailable

### 3.2 Data Processing Service

#### 3.2.1 Validation Engine
**Purpose**: Ensure data quality and consistency

**Validation Rules**:
- **Schema Validation**: Type checking and required fields
- **Business Logic Validation**: IPO lifecycle constraints
- **Data Range Validation**: Reasonable bounds for numerical values
- **Cross-Reference Validation**: Consistency across related records
- **Duplicate Detection**: Prevent duplicate entries within batches

```typescript
interface ValidationRule {
  field: string;
  type: 'required' | 'range' | 'format' | 'cross_reference';
  constraints: {
    min?: number;
    max?: number;
    pattern?: RegExp;
    references?: string[];
  };
}

interface ValidationResult {
  isValid: boolean;
  errors: {
    field: string;
    message: string;
    severity: 'error' | 'warning';
  }[];
  warnings: string[];
}
```

#### 3.2.2 Data Transformation Service
**Purpose**: Normalize and enrich scraped data

**Transformations**:
- **Data Normalization**: Consistent formatting across sources
- **Calculated Fields**: Derived metrics (estimated profit, listing price)
- **Indian Localization**: Number formatting, currency, dates
- **Data Enrichment**: Add metadata and quality scores
- **Historical Comparison**: Track changes over time

### 3.3 API Service Layer

#### 3.3.1 Query API
**Purpose**: Serve data to frontend applications

**Endpoints**:
```typescript
// Dashboard Data
const getDashboardData = query({
  handler: async (ctx) => {
    // Return aggregated data for home dashboard
    return {
      upcomingIPOs: IPO[],
      activeIPOs: IPO[],
      recentListings: IPO[],
      marketSummary: MarketSummary
    };
  }
});

// GMP Aggregator
const getGMPData = query({
  args: {
    filters: v.optional(v.object({
      type: v.optional(v.union(v.literal("SME"), v.literal("Mainline"))),
      gmpRange: v.optional(v.object({
        min: v.number(),
        max: v.number()
      })),
      closingDateRange: v.optional(v.object({
        from: v.string(),
        to: v.string()
      }))
    })),
    sorting: v.optional(v.object({
      field: v.string(),
      direction: v.union(v.literal("asc"), v.literal("desc"))
    })),
    pagination: v.optional(v.object({
      page: v.number(),
      limit: v.number()
    }))
  },
  handler: async (ctx, args) => {
    // Return filtered and sorted GMP data
  }
});

// Historical Data
const getHistoricalData = query({
  args: {
    ipoId: v.id("ipos"),
    dataType: v.union(v.literal("gmp"), v.literal("subscription")),
    timeRange: v.object({
      from: v.string(),
      to: v.string()
    }),
    aggregation: v.optional(v.union(
      v.literal("hourly"), 
      v.literal("daily")
    ))
  },
  handler: async (ctx, args) => {
    // Return time-series data for charts
  }
});
```

#### 3.3.2 Real-time API
**Purpose**: Provide live updates to connected clients

**Features**:
- **WebSocket Connections**: Convex real-time subscriptions
- **Selective Updates**: Only send relevant changes to clients
- **Connection Management**: Handle client connects/disconnects
- **Rate Limiting**: Prevent abuse of real-time connections

### 3.4 Background Processing Service

#### 3.4.1 Scheduler Service
**Purpose**: Manage automated data collection and maintenance tasks

**Scheduled Tasks**:
```typescript
interface ScheduledTask {
  name: string;
  schedule: string; // Cron expression
  action: ConvexAction;
  config: {
    timeout: number;
    retries: number;
    priority: 'high' | 'medium' | 'low';
  };
}

const scheduledTasks: ScheduledTask[] = [
  {
    name: 'scrape_investorgain_gmp',
    schedule: '*/15 * * * *', // Every 15 minutes
    action: actions.scrapers.investorGain.scrapeGMP,
    config: { timeout: 300000, retries: 3, priority: 'high' }
  },
  {
    name: 'scrape_subscription_data',
    schedule: '*/10 * * * *', // Every 10 minutes
    action: actions.scrapers.investorGain.scrapeSubscription,
    config: { timeout: 180000, retries: 2, priority: 'high' }
  },
  {
    name: 'cleanup_old_logs',
    schedule: '0 2 * * *', // Daily at 2 AM
    action: actions.cleanup.removeOldLogs,
    config: { timeout: 600000, retries: 1, priority: 'low' }
  },
  {
    name: 'update_ipo_status',
    schedule: '0 9 * * *', // Daily at 9 AM
    action: actions.ipo.updateStatus,
    config: { timeout: 120000, retries: 2, priority: 'medium' }
  }
];
```

#### 3.4.2 Data Cleanup Service
**Purpose**: Maintain database health and optimize storage

**Cleanup Tasks**:
- **Old Log Removal**: Delete scraping logs older than 30 days
- **Data Archival**: Move old historical data to long-term storage
- **Index Optimization**: Rebuild indexes for optimal performance
- **Duplicate Removal**: Clean up any duplicate records

## 4. Data Sources Integration

### 4.1 InvestorGain Integration

#### 4.1.1 GMP Data Scraping
**Target URL**: `https://www.investorgain.com/report/live-ipo-gmp/331/`

**Data Extraction Strategy**:
```typescript
interface InvestorGainGMPScraper {
  extractGMPData(): Promise<{
    company: string;
    type: 'SME' | 'Mainline';
    ipoSize: number;
    price: number;
    gmpPercent: number;
    kostakRates: number;
    saudaRates: {
      retail: number;
      shni?: number;
    };
  }[]>;
}
```

**Scraping Schedule**: Every 15 minutes during market hours, every 30 minutes after hours

#### 4.1.2 Subscription Data Scraping
**Target URL**: `https://www.investorgain.com/report/ipo-subscription-status/333/`

**Data Points**:
- QIB, BHNI, SHNI, Retail, Employee, Shareholder subscription multiples
- Total subscription and amount applied
- Real-time updates during IPO open period

### 4.2 Future Data Sources

#### 4.2.1 Chittorgarh Integration
- **GMP Data**: Secondary source for validation
- **Historical Data**: Extended historical GMP tracking
- **IPO Calendar**: Additional IPO announcement tracking

#### 4.2.2 Official APIs
- **BSE API**: Official subscription and allotment data
- **NSE API**: Real-time IPO status updates
- **SEBI Filings**: Regulatory document tracking

## 5. Performance & Scalability

### 5.1 Performance Requirements

**Response Times**:
- Dashboard queries: < 500ms (95th percentile)
- Historical data queries: < 1s (95th percentile)
- Real-time updates: < 100ms latency
- Data ingestion: < 30s per complete scrape cycle

**Throughput**:
- Support 1000+ concurrent users
- Handle 10,000+ API requests per hour
- Process 500+ IPO records per scrape cycle
- Maintain 99.9% uptime

### 5.2 Scalability Strategy

#### 5.2.1 Horizontal Scaling
- **Convex Auto-scaling**: Automatic function scaling based on load
- **Browser Pool**: Dynamic Puppeteer instance management
- **Rate Limiting**: Distributed rate limiting across instances
- **Load Balancing**: Automatic request distribution

#### 5.2.2 Caching Strategy
```typescript
interface CacheStrategy {
  layer: 'database' | 'application' | 'cdn';
  key: string;
  ttl: number; // Time to live in seconds
  invalidation: 'time' | 'event' | 'manual';
}

const cacheStrategies: CacheStrategy[] = [
  {
    layer: 'application',
    key: 'dashboard_data',
    ttl: 300, // 5 minutes
    invalidation: 'event'
  },
  {
    layer: 'database',
    key: 'gmp_aggregator',
    ttl: 900, // 15 minutes
    invalidation: 'time'
  },
  {
    layer: 'cdn',
    key: 'static_ipo_details',
    ttl: 3600, // 1 hour
    invalidation: 'manual'
  }
];
```

## 6. Data Quality & Monitoring

### 6.1 Data Quality Metrics

**Completeness**:
- IPO Coverage: Track % of known IPOs being monitored
- Data Point Coverage: Ensure all required fields are populated
- Source Diversity: Validate data across multiple sources

**Accuracy**:
- Cross-source Validation: Compare data across different providers
- Historical Consistency: Detect unusual data changes
- Manual Verification: Spot checks against official sources

**Freshness**:
- Data Age Tracking: Monitor time since last update
- Scraping Success Rate: Track failed vs successful scrapes
- Alert Thresholds: Notify when data becomes stale

### 6.2 System Monitoring

#### 6.2.1 Health Monitoring
```typescript
interface SystemHealth {
  timestamp: number;
  services: {
    database: 'healthy' | 'degraded' | 'down';
    scrapers: 'healthy' | 'degraded' | 'down';
    api: 'healthy' | 'degraded' | 'down';
  };
  metrics: {
    responseTime: number;
    errorRate: number;
    dataFreshness: number;
    activeConnections: number;
  };
  alerts: {
    level: 'info' | 'warning' | 'error' | 'critical';
    message: string;
    service: string;
  }[];
}
```

#### 6.2.2 Business Metrics
- **Data Ingestion**: Records processed per hour/day
- **API Usage**: Request volume and response times
- **User Engagement**: Query patterns and popular features
- **Data Quality**: Error rates and validation failures

## 7. Error Handling & Recovery

### 7.1 Error Categories

**Scraping Errors**:
- Network timeouts and connection failures
- Website structure changes (selector failures)
- Rate limiting and bot detection
- Data parsing and validation errors

**Database Errors**:
- Connection failures and timeouts
- Schema validation errors
- Constraint violations
- Performance degradation

**API Errors**:
- Invalid request parameters
- Authentication failures
- Rate limit exceeded
- Downstream service failures

### 7.2 Recovery Strategies

#### 7.2.1 Automatic Recovery
```typescript
interface RetryConfig {
  maxAttempts: number;
  backoffStrategy: 'exponential' | 'linear' | 'fixed';
  baseDelay: number;
  maxDelay: number;
  retryableErrors: string[];
}

const retryConfigs: Record<string, RetryConfig> = {
  scraping: {
    maxAttempts: 3,
    backoffStrategy: 'exponential',
    baseDelay: 5000,
    maxDelay: 60000,
    retryableErrors: ['NETWORK_ERROR', 'TIMEOUT', 'RATE_LIMITED']
  },
  database: {
    maxAttempts: 5,
    backoffStrategy: 'exponential',
    baseDelay: 1000,
    maxDelay: 30000,
    retryableErrors: ['CONNECTION_ERROR', 'TIMEOUT']
  }
};
```

#### 7.2.2 Fallback Mechanisms
- **Data Source Fallback**: Switch to alternate sources when primary fails
- **Cached Data Serving**: Serve stale data when fresh data unavailable
- **Graceful Degradation**: Reduce functionality rather than complete failure
- **Manual Override**: Admin tools for manual data correction

## 8. Security & Compliance

### 8.1 Data Security

**Access Control**:
- API key authentication for scraper services
- Role-based access control for admin functions
- IP whitelisting for sensitive operations
- Audit logging for all data modifications

**Data Protection**:
- Encryption at rest and in transit
- PII data handling (future user features)
- Secure credential management
- Regular security audits

### 8.2 Compliance Requirements

**Web Scraping Ethics**:
- Respect robots.txt directives
- Implement reasonable rate limiting
- Monitor for blocking and adjust behavior
- Provide clear user agent identification

**Financial Data Regulations**:
- Disclaimers about data accuracy
- Clear data source attribution
- No financial advice provision
- Compliance with Indian financial regulations

## 9. Deployment & DevOps

### 9.1 Deployment Architecture

**Production Environment**:
- **Convex**: Database and core functions hosting
- **Vercel**: API routes and static content
- **AWS Lambda**: Heavy scraping operations
- **CloudFlare**: CDN and DDoS protection
- **Redis Cloud**: Caching layer

**Development Workflow**:
```typescript
interface DeploymentPipeline {
  stages: {
    development: {
      database: 'convex-dev';
      testing: 'automated-unit-integration';
      deployment: 'local-development';
    };
    staging: {
      database: 'convex-staging';
      testing: 'automated-e2e-performance';
      deployment: 'vercel-preview';
    };
    production: {
      database: 'convex-prod';
      testing: 'manual-qa-monitoring';
      deployment: 'vercel-production';
    };
  };
}
```

### 9.2 Monitoring & Alerting

**Monitoring Stack**:
- **Sentry**: Error tracking and performance monitoring
- **DataDog**: Infrastructure and application metrics
- **Convex Dashboard**: Database performance and function metrics
- **Custom Dashboards**: Business-specific KPIs

**Alert Conditions**:
- Data freshness exceeds 45 minutes
- Scraping success rate drops below 90%
- API response time exceeds 1 second
- Error rate exceeds 1%
- Database query performance degrades

## 10. Success Metrics

### 10.1 Technical Metrics

**Performance**:
- API response time: < 500ms (P95)
- Database query time: < 100ms (P95)
- System uptime: > 99.9%
- Data freshness: < 30 minutes average

**Reliability**:
- Scraping success rate: > 95%
- Data accuracy: > 99%
- Zero data loss incidents
- Mean time to recovery: < 5 minutes

### 10.2 Business Metrics

**Data Coverage**:
- IPO tracking coverage: > 95% of Indian IPOs
- Data completeness: > 98% of required fields
- Multi-source validation: > 80% of data points
- Historical data retention: 2+ years

**User Experience**:
- API error rate: < 0.5%
- Real-time update latency: < 10 seconds
- Export functionality success: > 99%
- Mobile API performance: Comparable to desktop

This comprehensive backend PRD provides the foundation for building a robust, scalable, and reliable data processing system that supports the IPO Dalal platform's frontend requirements while ensuring high data quality and system performance.