# IPO Dalal Backend - Updated System Specification & PRD

## 1. Executive Summary

### 1.1 Product Vision
The IPO Dalal backend serves as a comprehensive data processing and API layer for the Indian IPO tracking platform, integrating multiple data sources including NSE APIs, BSE APIs, and web scraping from premium data providers to deliver real-time IPO insights, GMP tracking, and subscription monitoring.

### 1.2 Core Objectives
- **Multi-Source Data Integration**: Seamless integration with NSE/BSE APIs and premium web sources
- **Real-time Processing**: Sub-minute data freshness for critical IPO metrics
- **High Availability**: 99.9% uptime with automatic failover capabilities
- **Scalable Architecture**: Handle growing data volume and concurrent user base
- **Data Integrity**: Ensure accurate, validated, and consistent data across all services
- **Anti-Bot Measures**: Robust scraping with advanced anti-detection mechanisms

### 1.3 Technology Stack
- **Runtime**: Node.js 18+ with TypeScript
- **Database**: Convex (Serverless, Real-time, Document-based)
- **Web Scraping**: Puppeteer with anti-bot measures, Playwright, Cheerio
- **Session Management**: Dynamic cookie handling with session warming
- **Caching**: Redis for API responses and session data
- **Message Queue**: Convex Actions for background processing
- **Monitoring**: Comprehensive logging and health monitoring
- **Deployment**: Vercel for API routes, AWS Lambda for intensive scrapers

## 2. Data Sources Integration

### 2.1 NSE API Integration

#### 2.1.1 Core NSE APIs
```typescript
interface NSEAPIEndpoints {
  marketStatus: 'https://www.nseindia.com/api/marketStatus';
  currentIPOs: 'https://www.nseindia.com/api/ipo-current-issue';
  upcomingIPOs: 'https://www.nseindia.com/api/all-upcoming-issues?category=ipo';
  pastIssues: 'https://www.nseindia.com/api/public-past-issues';
  bidDetails: 'https://www.nseindia.com/api/ipo-bid-details?symbol={SYMBOL}&series={SERIES}';
  activeCategory: 'https://www.nseindia.com/api/ipo-active-category?symbol={SYMBOL}';
  demandChart: 'https://www.nseindia.com/api/ipo-chart-demand?symbol={SYMBOL}&exchange={EXCHANGE}';
  ipoDetails: 'https://www.nseindia.com/api/ipo-detail?symbol={SYMBOL}&series={SERIES}';
}
```

#### 2.1.2 Session Management Strategy
```typescript
interface SessionManager {
  warmupSession(symbol: string, series: string, type: string): Promise<void>;
  getHeaders(symbol?: string, series?: string, type?: string): Record<string, string>;
  manageCookies(): Promise<void>;
  rotateSession(): Promise<void>;
}

const getBaseHeaders = (referrer?: string) => ({
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  'Accept': 'application/json, text/plain, */*',
  'Accept-Language': 'en-US,en;q=0.9',
  'Cache-Control': 'no-cache',
  'Pragma': 'no-cache',
  'Connection': 'keep-alive',
  'Referer': referrer || 'https://www.nseindia.com/',
  'Sec-Fetch-Dest': 'empty',
  'Sec-Fetch-Mode': 'cors',
  'Sec-Fetch-Site': 'same-origin'
});
```

#### 2.1.3 Dynamic Referrer Management
```typescript
interface ReferrerStrategy {
  getMarketDataReferrer(): string; // 'https://www.nseindia.com/market-data/all-upcoming-issues-ipo'
  getIPOSpecificReferrer(symbol: string, series: string, type: string): string;
  // 'https://www.nseindia.com/market-data/issue-information?symbol={SYMBOL}&series={SERIES}&type={TYPE}'
}
```

### 2.2 Premium Data Sources Integration

#### 2.2.1 IPO Premium (https://ipopremium.in/)
```typescript
interface IPOPremiumScraper {
  targetURL: 'https://ipopremium.in/';
  selector: 'body > div > div > section.content > div:nth-child(5) > div > div > div.box-body.no-padding.table-responsive > table';
  xpath: '/html/body/div[1]/div/section[2]/div[4]/div/div/div[2]/table';
  
  extractedFields: {
    companyName: string;
    companyLink: string;
    exchangeBoard: string;
    issueType: string;
    premium: number;
    open: string;
    close: string;
    price: number;
    lotSize: number;
    allotmentDate: string;
    listingDate: string;
    actions: string;
    actionLink: string;
    remark: string;
  };
}
```

#### 2.2.2 IPO Central (https://ipocentral.in/)
```typescript
interface IPOCentralScraper {
  targetURL: 'https://ipocentral.in/ipo-discussion/';
  
  mainboardTable: {
    selector: '#tablepress-57';
    xpath: '//*[@id="tablepress-57"]';
  };
  
  smeTable: {
    selector: '#tablepress-58';
    xpath: '//*[@id="tablepress-58"]';
  };
  
  extractedFields: {
    companyName: string;
    type: 'Mainboard' | 'SME';
    price: number; // Upper price band
    subjectToRate: number; // INR 2L for Mainboard, INR 10L for SME
  };
}
```

#### 2.2.3 IPO Watch (https://ipowatch.in/)
```typescript
interface IPOWatchScraper {
  targetURL: 'https://ipowatch.in/ipo-grey-market-premium-latest-ipo-gmp/';
  selector: 'body > div.elementor.elementor-4483.elementor-location-single.post-3445.page.type-page.status-publish.has-post-thumbnail.hentry > section > div > div.elementor-column.elementor-col-50.elementor-top-column.elementor-element.elementor-element-36a48a19 > div > div.elementor-element.elementor-element-1f27a874.elementor-widget.elementor-widget-theme-post-content > div > figure.wp-block-table.is-style-regular > table';
  xpath: '/html/body/div[1]/section/div/div[1]/div/div[5]/div/figure[1]/table';
}
```

#### 2.2.4 InvestorGain (https://www.investorgain.com/)
```typescript
interface InvestorGainScraper {
  gmpTableURL: 'https://www.investorgain.com/report/live-ipo-gmp/331/all/';
  selector: '#report_table';
  xpath: '//*[@id="report_table"]';
  
  // Individual company page scraping
  companySaudaRates: {
    selectors: [
      '#main > div:nth-child(5) > div > div.float-none.mb-2.ms-2 > div:nth-child(1) > p > span',
      '#main > div:nth-child(5) > div > div.float-none.mb-2.ms-2 > div:nth-child(1) > p > span:nth-child(5)',
      '#main > div:nth-child(5) > div > div.float-none.mb-2.ms-2 > div:nth-child(1) > p > span:nth-child(6)'
    ];
    xpaths: [
      '//*[@id="main"]/div[3]/div/div[2]/div[1]/p/span',
      '//*[@id="main"]/div[3]/div/div[2]/div[1]/p/span[1]',
      '//*[@id="main"]/div[3]/div/div[2]/div[1]/p/span[2]'
    ];
  };
}
```

### 2.3 SEBI Document Scraping
```typescript
interface SEBIDocumentScraper {
  endpoints: {
    DRHP: 'https://www.sebi.gov.in/sebiweb/home/HomeAction.do?doListing=yes&sid=3&ssid=15&smid=10';
    RHP: 'https://www.sebi.gov.in/sebiweb/home/HomeAction.do?doListing=yes&sid=3&ssid=15&smid=11';
    finalOffer: 'https://www.sebi.gov.in/sebiweb/home/HomeAction.do?doListing=yes&sid=3&ssid=15&smid=12';
    SME: 'https://www.sebi.gov.in/sebiweb/home/HomeAction.do?doListing=yes&sid=3&ssid=15&smid=78';
  };
  
  commonSelector: '#sample_1';
}
```

## 3. Enhanced System Architecture

### 3.1 Multi-Source Data Processing Pipeline

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           Data Sources Layer                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────────────────┐ │
│  │   NSE APIs      │  │   BSE APIs      │  │    Premium Sources          │ │
│  │                 │  │                 │  │                             │ │
│  │ • Market Status │  │ • IPO Data      │  │ • InvestorGain              │ │
│  │ • Current IPOs  │  │ • Bid Details   │  │ • IPO Premium               │ │
│  │ • Bid Details   │  │ • Subscription  │  │ • IPO Central               │ │
│  │ • Demand Charts │  │ ・ Allotment    │  │ • IPO Watch                 │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                      Advanced Scraping Layer                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────────────────┐ │
│  │ Session Manager │  │  Anti-Bot Suite │  │    Data Extractors          │ │
│  │                 │  │                 │  │                             │ │
│  │ • Cookie Mgmt   │  │ • User-Agent    │  │ • CSS Selectors             │ │
│  │ • Session Warm  │  │ • Proxy Rotation│  │ • XPath Extractors          │ │
│  │ • Header Mgmt   │  │ • CAPTCHA Handle│  │ • JSON Parsers              │ │
│  │ • Referrer Mgmt │  │ • Rate Limiting │  │ • Error Recovery            │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                      Data Processing & Validation                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────────────────┐ │
│  │ Data Validator  │  │ Cross-Reference │  │    Quality Scorer           │ │
│  │                 │  │                 │  │                             │ │
│  │ • Schema Check  │  │ • Multi-Source  │  │ • Confidence Metrics        │ │
│  │ • Range Valid   │  │ • Consistency   │  │ • Source Reliability        │ │
│  │ • Format Check  │  │ • Conflict Res  │  │ • Data Freshness            │ │
│  │ • Duplicate Det │  │ • Priority Rules│  │ • Historical Accuracy       │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         Convex Database Layer                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────────┐ │
│  │                         Enhanced Schema                                 │ │
│  │                                                                         │ │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────────────────┐ │ │
│  │  │ Master Tables   │  │ Multi-Source    │  │     Current State        │ │ │
│  │  │                 │  │ Historical Data │  │                          │ │ │
│  │  │ • ipos          │  │ • nse_bid_hist  │  │ • current_gmp            │ │ │
│  │  │ • data_sources  │  │ • demand_hist   │  │ • current_subscription   │ │ │
│  │  │ • scrape_config │  │ • gmp_history   │  │ • current_bid_details    │ │ │
│  │  │ • sebi_docs     │  │ • sub_history   │  │ • system_health          │ │ │
│  │  └─────────────────┘  └─────────────────┘  └──────────────────────────┘ │ │
│  └─────────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 3.2 Enhanced Database Schema

#### 3.2.1 Master IPO Table (Enhanced)
```typescript
interface IPORecord {
  _id: Id<"ipos">;
  _creationTime: number;
  
  // Basic Information
  symbol: string;                    // NSE/BSE symbol
  companyName: string;
  series: "EQ" | "SME";
  
  // Pricing & Size
  issueSize: number;                 // In crores
  issuePrice: string;                // "Rs.584 to Rs.614"
  priceBand: {
    lower: number;
    upper: number;
  };
  lotSize: number;
  
  // Dates
  issueStartDate: string;            // DD-MMM-YYYY
  issueEndDate: string;
  allotmentDate?: string;
  listingDate?: string;
  
  // Status & Classification
  status: "Active" | "Closed" | "Listed" | "Upcoming";
  isBse: boolean;
  category?: string;
  
  // NSE Specific Fields
  noOfSharesOffered?: number;
  noOfSharesBid?: number;
  subscriptionMultiple?: number;
  
  // Metadata
  dataSource: string[];              // Multiple sources
  lastUpdated: number;
  qualityScore: number;              // 0-100
}
```

#### 3.2.2 NSE Bid Details (New Table)
```typescript
interface NSEBidDetails {
  _id: Id<"nse_bid_details">;
  _creationTime: number;
  
  // Reference
  ipoId: Id<"ipos">;
  symbol: string;
  series: "EQ" | "SME";
  
  // Temporal
  timestamp: number;
  updateTime: string;                // "Updated as on 13-Jun-2025 17:00:11 hrs"
  
  // Bid Details (varies by series)
  categories: Array<{
    srNo: string;
    category: string;
    noOfSharesOffered?: number;      // EQ only
    noOfSharesBid: number;
    noOfTotalMeant?: number;         // EQ only
    noOfApplications?: number;       // SME only
  }>;
  
  // Data Source
  apiEndpoint: "ipo-bid-details" | "ipo-active-category";
  batchId: string;
}
```

#### 3.2.3 NSE Demand Chart Data (New Table)
```typescript
interface NSEDemandChart {
  _id: Id<"nse_demand_chart">;
  _creationTime: number;
  
  // Reference
  ipoId: Id<"ipos">;
  symbol: string;
  company: string;
  exchange: "NSE" | "ALL";
  
  // Demand Data
  timestamp: string;                 // "13-Jun-2025 17:00:00"
  price: string;                     // "Cut-Off" or numeric
  cumQty: string;                    // "30,98,664"
  
  // Metadata
  batchId: string;
  scrapedAt: number;
}
```

#### 3.2.4 Multi-Source GMP Data (Enhanced)
```typescript
interface GMPHistory {
  _id: Id<"gmp_history">;
  _creationTime: number;
  
  // Reference
  ipoId: Id<"ipos">;
  
  // Temporal
  timestamp: number;
  date: string;
  
  // GMP Data
  gmpPercent: number;
  gmpPrice: number;
  
  // Trading Rates (varies by source)
  kostakRates?: number;
  saudaRates: {
    retail: number;
    shni?: number;                   // null for SME
  };
  
  // Multi-Source Tracking
  source: "InvestorGain" | "IPOPremium" | "IPOCentral" | "IPOWatch";
  sourceUrl: string;
  batchId: string;
  
  // Quality Metrics
  confidenceScore: number;           // 0-100
  isVerified: boolean;
  conflictResolution?: string;       // If data conflicts existed
}
```

#### 3.2.5 SEBI Documents (New Table)
```typescript
interface SEBIDocument {
  _id: Id<"sebi_documents">;
  _creationTime: number;
  
  // Reference
  ipoId: Id<"ipos">;
  companyName: string;
  
  // Document Information
  documentType: "DRHP" | "RHP" | "Final Offer" | "SME";
  documentUrl: string;
  filingDate: string;
  
  // Metadata
  scrapedAt: number;
  fileSize?: number;
  isActive: boolean;
}
```

## 4. Advanced Scraping Implementation

### 4.1 Anti-Bot Scraping Engine
```typescript
class AdvancedScraper {
  private browserPool: Browser[];
  private proxyPool: string[];
  private userAgents: string[];
  private sessionManager: SessionManager;
  
  constructor() {
    this.initializeBrowserPool();
    this.setupProxyRotation();
    this.configureAntiDetection();
  }
  
  async scrapeWithAntiBot(config: ScrapingConfig): Promise<ScrapingResult> {
    const browser = await this.getBrowser();
    const page = await browser.newPage();
    
    // Apply anti-detection measures
    await this.applyAntiDetectionMeasures(page);
    
    // Setup session
    await this.sessionManager.warmupSession(config.symbol, config.series, config.type);
    
    // Navigate and extract
    const result = await this.extractData(page, config);
    
    // Cleanup
    await this.releaseBrowser(browser);
    
    return result;
  }
  
  private async applyAntiDetectionMeasures(page: Page): Promise<void> {
    // Disable images and CSS for faster loading
    await page.setRequestInterception(true);
    page.on('request', (req) => {
      if(['image', 'stylesheet', 'font'].includes(req.resourceType())) {
        req.abort();
      } else {
        req.continue();
      }
    });
    
    // Randomize viewport
    await page.setViewport({
      width: 1200 + Math.floor(Math.random() * 800),
      height: 800 + Math.floor(Math.random() * 600)
    });
    
    // Add human-like delays
    await this.addRandomDelay(1000, 3000);
    
    // Execute stealth scripts
    await page.evaluateOnNewDocument(() => {
      // Remove webdriver property
      delete (navigator as any).webdriver;
      
      // Mock plugins
      Object.defineProperty(navigator, 'plugins', {
        get: () => [1, 2, 3, 4, 5]
      });
    });
  }
}
```

### 4.2 Session Management Implementation
```typescript
class SessionManager {
  private activeSessions: Map<string, SessionData> = new Map();
  private cookieStore: Map<string, Cookie[]> = new Map();
  
  async warmupSession(symbol: string, series: string, type: string): Promise<void> {
    const sessionKey = `${symbol}_${series}_${type}`;
    
    if (this.activeSessions.has(sessionKey)) {
      return; // Session already warmed up
    }
    
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    
    // Visit referrer page first
    const referrerUrl = this.getReferrerUrl(symbol, series, type);
    await page.goto(referrerUrl, { waitUntil: 'networkidle2' });
    
    // Extract cookies
    const cookies = await page.cookies();
    this.cookieStore.set(sessionKey, cookies);
    
    // Store session data
    this.activeSessions.set(sessionKey, {
      cookies,
      lastUsed: Date.now(),
      userAgent: await page.evaluate(() => navigator.userAgent)
    });
    
    await browser.close();
  }
  
  getHeaders(symbol?: string, series?: string, type?: string): Record<string, string> {
    const sessionKey = symbol && series && type ? `${symbol}_${series}_${type}` : 'default';
    const session = this.activeSessions.get(sessionKey);
    
    const baseHeaders = {
      'User-Agent': session?.userAgent || this.getRandomUserAgent(),
      'Accept': 'application/json, text/plain, */*',
      'Accept-Language': 'en-US,en;q=0.9,hi;q=0.8',
      'Accept-Encoding': 'gzip, deflate, br',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1',
      'Sec-Fetch-Dest': 'empty',
      'Sec-Fetch-Mode': 'cors',
      'Sec-Fetch-Site': 'same-origin',
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache'
    };
    
    if (symbol && series && type) {
      baseHeaders['Referer'] = this.getReferrerUrl(symbol, series, type);
    } else {
      baseHeaders['Referer'] = 'https://www.nseindia.com/market-data/all-upcoming-issues-ipo';
    }
    
    return baseHeaders;
  }
  
  private getReferrerUrl(symbol: string, series: string, type: string): string {
    return `https://www.nseindia.com/market-data/issue-information?symbol=${symbol}&series=${series}&type=${type}`;
  }
}
```

## 5. Comprehensive API Implementation

### 5.1 NSE API Client
```typescript
class NSEAPIClient {
  private sessionManager: SessionManager;
  private rateLimiter: RateLimiter;
  
  constructor() {
    this.sessionManager = new SessionManager();
    this.rateLimiter = new RateLimiter({ requests: 10, per: 60000 }); // 10 requests per minute
  }
  
  async fetchMarketStatus(): Promise<MarketStatusResponse> {
    await this.rateLimiter.wait();
    
    const headers = this.sessionManager.getHeaders();
    const response = await fetch('https://www.nseindia.com/api/marketStatus', { headers });
    
    if (!response.ok) {
      throw new Error(`NSE API Error: ${response.status}`);
    }
    
    return response.json();
  }
  
  async fetchCurrentIPOs(): Promise<CurrentIPOResponse[]> {
    await this.rateLimiter.wait();
    
    const headers = this.sessionManager.getHeaders();
    const response = await fetch('https://www.nseindia.com/api/ipo-current-issue', { headers });
    
    return response.json();
  }
  
  async fetchBidDetails(symbol: string, series: "EQ" | "SME"): Promise<BidDetailsResponse> {
    await this.sessionManager.warmupSession(symbol, series, 'bid');
    await this.rateLimiter.wait();
    
    const headers = this.sessionManager.getHeaders(symbol, series, 'bid');
    const url = `https://www.nseindia.com/api/ipo-bid-details?symbol=${symbol}&series=${series}`;
    
    const response = await fetch(url, { headers });
    
    if (!response.ok) {
      // Fallback to Puppeteer if API fails
      return this.scrapeBidDetailsWithPuppeteer(symbol, series);
    }
    
    return response.json();
  }
  
  async fetchDemandChart(symbol: string, exchange: "NSE" | "ALL"): Promise<DemandChartResponse[]> {
    await this.sessionManager.warmupSession(symbol, 'EQ', 'demand');
    await this.rateLimiter.wait();
    
    const headers = this.sessionManager.getHeaders(symbol, 'EQ', 'demand');
    const url = `https://www.nseindia.com/api/ipo-chart-demand?symbol=${symbol}&exchange=${exchange}`;
    
    const response = await fetch(url, { headers });
    return response.json();
  }
  
  private async scrapeBidDetailsWithPuppeteer(symbol: string, series: string): Promise<BidDetailsResponse> {
    // Fallback Puppeteer implementation with anti-bot measures
    const scraper = new AdvancedScraper();
    return scraper.scrapeNSEBidDetails(symbol, series);
  }
}
```

### 5.2 Multi-Source GMP Scraper
```typescript
class MultiSourceGMPScraper {
  private scrapers: Map<string, SourceScraper> = new Map();
  
  constructor() {
    this.initializeScrapers();
  }
  
  async scrapeAllSources(): Promise<MultiSourceGMPData[]> {
    const results = await Promise.allSettled([
      this.scrapers.get('InvestorGain')?.scrapeGMP(),
      this.scrapers.get('IPOPremium')?.scrapeGMP(),
      this.scrapers.get('IPOCentral')?.scrapeGMP(),
      this.scrapers.get('IPOWatch')?.scrapeGMP()
    ]);
    
    const validResults = results
      .filter((result): result is PromiseFulfilledResult<GMPData[]> => result.status === 'fulfilled')
      .map(result => result.value)
      .flat();
    
    return this.consolidateGMPData(validResults);
  }
  
  private consolidateGMPData(data: GMPData[]): MultiSourceGMPData[] {
    const consolidatedMap = new Map<string, MultiSourceGMPData>();
    
    data.forEach(record => {
      const key = record.companyName.toLowerCase().trim();
      
      if (consolidatedMap.has(key)) {
        const existing = consolidatedMap.get(key)!;
        existing.sources.push({
          source: record.source,
          gmpPercent: record.gmpPercent,
          confidence: record.confidence,
          timestamp: record.timestamp
        });
        
        // Update with highest confidence data
        if (record.confidence > existing.confidence) {
          existing.gmpPercent = record.gmpPercent;
          existing.confidence = record.confidence;
          existing.primarySource = record.source;
        }
      } else {
        consolidatedMap.set(key, {
          companyName: record.companyName,
          type: record.type,
          gmpPercent: record.gmpPercent,
          confidence: record.confidence,
          primarySource: record.source,
          sources: [{
            source: record.source,
            gmpPercent: record.gmpPercent,
            confidence: record.confidence,
            timestamp: record.timestamp
          }],
          conflictResolution: null
        });
      }
    });
    
    return Array.from(consolidatedMap.values());
  }
}
```

## 6. Advanced Data Processing Pipeline

### 6.1 Multi-Source Data Validator
```typescript
class MultiSourceValidator {
  private validationRules: ValidationRule[];
  private crossReferenceRules: CrossReferenceRule[];
  
  async validateBatch(data: RawScrapedData[], source: string): Promise<ValidationResult> {
    const results: ValidationResult = {
      valid: [],
      invalid: [],
      warnings: [],
      conflicts: []
    };
    
    for (const record of data) {
      // Schema validation
      const schemaResult = await this.validateSchema(record);
      if (!schemaResult.isValid) {
        results.invalid.push({
          record,
          errors: schemaResult.errors,
          source
        });
        continue;
      }
      
      // Business logic validation
      const businessResult = await this.validateBusinessLogic(record);
      if (!businessResult.isValid) {
        results.warnings.push({
          record,
          warnings: businessResult.warnings,
          source
        });
      }
      
      // Cross-reference validation
      const crossRefResult = await this.validateCrossReference(record, source);
      if (crossRefResult.hasConflicts) {
        results.conflicts.push({
          record,
          conflicts: crossRefResult.conflicts,
          source
        });
      }
      
      results.valid.push({
        record: {
          ...record,
          validationScore: this.calculateValidationScore(schemaResult, businessResult, crossRefResult),
          qualityFlags: this.generateQualityFlags(record, source)
        },
        source
      });
    }
    
    return results;
  }
  
  private async validateSchema(record: RawScrapedData): Promise<SchemaValidationResult> {
    const errors: ValidationError[] = [];
    
    // Required fields validation
    if (!record.companyName || record.companyName.trim().length === 0) {
      errors.push({ field: 'companyName', message: 'Company name is required', severity: 'error' });
    }
    
    // GMP validation
    if (record.gmpPercent !== undefined) {
      if (typeof record.gmpPercent !== 'number' || record.gmpPercent < -50 || record.gmpPercent > 500) {
        errors.push({ field: 'gmpPercent', message: 'GMP percent must be between -50% and 500%', severity: 'error' });
      }
    }
    
    // Date validation
    if (record.closingDate && !this.isValidDate(record.closingDate)) {
      errors.push({ field: 'closingDate', message: 'Invalid date format', severity: 'error' });
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings: []
    };
  }
  
  private calculateValidationScore(
    schema: SchemaValidationResult,
    business: BusinessValidationResult,
    crossRef: CrossReferenceResult
  ): number {
    let score = 100;
    
    // Deduct for schema errors
    score -= schema.errors.length * 20;
    
    // Deduct for business warnings
    score -= business.warnings.length * 10;
    
    // Deduct for conflicts
    score -= crossRef.conflicts.length * 15;
    
    return Math.max(0, score);
  }
}
```

### 6.2 Background Processing System
```typescript
class BackgroundProcessor {
  private scheduler: CronScheduler;
  private taskQueue: TaskQueue;
  private healthMonitor: HealthMonitor;
  
  constructor() {
    this.initializeScheduler();
    this.setupTaskQueue();
    this.startHealthMonitoring();
  }
  
  private initializeScheduler(): void {
    this.scheduler = new CronScheduler([
      {
        name: 'scrape_nse_current_ipos',
        schedule: '*/10 * 9-15 * * 1-5', // Every 10 minutes during market hours
        action: this.scrapeNSECurrentIPOs.bind(this),
        priority: 'high',
        timeout: 120000
      },
      {
        name: 'scrape_nse_bid_details',
        schedule: '*/5 * 9-15 * * 1-5', // Every 5 minutes during market hours
        action: this.scrapeAllBidDetails.bind(this),
        priority: 'high',
        timeout: 300000
      },
      {
        name: 'scrape_multi_source_gmp',
        schedule: '*/15 * * * *', // Every 15 minutes
        action: this.scrapeMultiSourceGMP.bind(this),
        priority: 'medium',
        timeout: 600000
      },
      {
        name: 'scrape_nse_demand_charts',
        schedule: '*/20 * 9-15 * * 1-5', // Every 20 minutes during market hours
        action: this.scrapeAllDemandCharts.bind(this),
        priority: 'medium',
        timeout: 240000
      },
      {
        name: 'update_ipo_status',
        schedule: '0 9 * * *', // Daily at 9 AM
        action: this.updateIPOStatus.bind(this),
        priority: 'low',
        timeout: 180000
      },
      {
        name: 'cleanup_old_data',
        schedule: '0 2 * * *', // Daily at 2 AM
        action: this.cleanupOldData.bind(this),
        priority: 'low',
        timeout: 1800000 // 30 minutes
      },
      {
        name: 'scrape_sebi_documents',
        schedule: '0 10 * * *', // Daily at 10 AM
        action: this.scrapeSEBIDocuments.bind(this),
        priority: 'low',
        timeout: 900000 // 15 minutes
      }
    ]);
  }
  
  private async scrapeNSECurrentIPOs(): Promise<void> {
    try {
      const nseClient = new NSEAPIClient();
      const currentIPOs = await nseClient.fetchCurrentIPOs();
      
      await this.processCurrentIPOs(currentIPOs);
      
      // Update system health
      await this.healthMonitor.recordSuccess('nse_current_ipos', {
        recordsProcessed: currentIPOs.length,
        timestamp: Date.now()
      });
      
    } catch (error) {
      await this.healthMonitor.recordError('nse_current_ipos', error);
      throw error;
    }
  }
  
  private async scrapeAllBidDetails(): Promise<void> {
    const activeIPOs = await this.getActiveIPOs();
    const results = [];
    
    for (const ipo of activeIPOs) {
      try {
        const nseClient = new NSEAPIClient();
        
        // Scrape bid details from multiple endpoints
        const bidDetails = await nseClient.fetchBidDetails(ipo.symbol, ipo.series);
        const activeCategory = ipo.series === 'EQ' ? 
          await nseClient.fetchActiveCategory(ipo.symbol) : null;
        
        results.push({
          ipo: ipo.symbol,
          bidDetails,
          activeCategory,
          success: true
        });
        
        // Process and store data
        await this.processBidDetails(ipo._id, bidDetails, activeCategory);
        
        // Add delay between requests
        await this.addDelay(2000, 5000);
        
      } catch (error) {
        results.push({
          ipo: ipo.symbol,
          error: error.message,
          success: false
        });
        
        console.error(`Failed to scrape bid details for ${ipo.symbol}:`, error);
      }
    }
    
    // Record batch results
    await this.healthMonitor.recordBatchResult('nse_bid_details', results);
  }
  
  private async scrapeMultiSourceGMP(): Promise<void> {
    const scraper = new MultiSourceGMPScraper();
    
    try {
      const gmpData = await scraper.scrapeAllSources();
      
      // Process and validate data
      const validator = new MultiSourceValidator();
      const validationResult = await validator.validateGMPBatch(gmpData);
      
      // Store valid data
      await this.storeValidatedGMPData(validationResult.valid);
      
      // Log conflicts and warnings
      if (validationResult.conflicts.length > 0) {
        await this.logDataConflicts(validationResult.conflicts);
      }
      
      await this.healthMonitor.recordSuccess('multi_source_gmp', {
        totalRecords: gmpData.length,
        validRecords: validationResult.valid.length,
        conflicts: validationResult.conflicts.length,
        timestamp: Date.now()
      });
      
    } catch (error) {
      await this.healthMonitor.recordError('multi_source_gmp', error);
      throw error;
    }
  }
}
```

## 7. Real-time API Layer

### 7.1 Enhanced Convex Queries
```typescript
// Enhanced dashboard query with multi-source data
export const getDashboardData = query({
  handler: async (ctx) => {
    const currentTime = Date.now();
    
    // Get active IPOs with latest data
    const activeIPOs = await ctx.db
      .query("ipos")
      .filter(q => q.eq(q.field("status"), "Active"))
      .collect();
    
    // Enrich with current GMP and subscription data
    const enrichedIPOs = await Promise.all(
      activeIPOs.map(async (ipo) => {
        const [gmpData, subscriptionData, bidDetails] = await Promise.all([
          ctx.db
            .query("current_gmp")
            .filter(q => q.eq(q.field("ipoId"), ipo._id))
            .first(),
          ctx.db
            .query("current_subscription")
            .filter(q => q.eq(q.field("ipoId"), ipo._id))
            .first(),
          ctx.db
            .query("nse_bid_details")
            .filter(q => q.eq(q.field("ipoId"), ipo._id))
            .order("desc")
            .first()
        ]);
        
        return {
          ...ipo,
          gmp: gmpData,
          subscription: subscriptionData,
          latestBidDetails: bidDetails,
          dataFreshness: gmpData ? currentTime - gmpData.lastUpdated : null
        };
      })
    );
    
    // Get upcoming IPOs
    const upcomingIPOs = await ctx.db
      .query("ipos")
      .filter(q => q.eq(q.field("status"), "Upcoming"))
      .order("asc")
      .take(10);
    
    // Get recently listed IPOs
    const recentListings = await ctx.db
      .query("ipos")
      .filter(q => q.eq(q.field("status"), "Listed"))
      .order("desc")
      .take(5);
    
    return {
      activeIPOs: enrichedIPOs,
      upcomingIPOs,
      recentListings,
      lastUpdated: currentTime,
      systemHealth: await this.getSystemHealth(ctx)
    };
  }
});

// Advanced GMP aggregator with filtering and sorting
export const getGMPAggregatorData = query({
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
      })),
      subscriptionRange: v.optional(v.object({
        min: v.number(),
        max: v.number()
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
    let query = ctx.db.query("ipos");
    
    // Apply filters
    if (args.filters) {
      if (args.filters.type) {
        const seriesFilter = args.filters.type === "SME" ? "SME" : "EQ";
        query = query.filter(q => q.eq(q.field("series"), seriesFilter));
      }
      
      if (args.filters.closingDateRange) {
        query = query.filter(q => 
          q.and(
            q.gte(q.field("issueEndDate"), args.filters!.closingDateRange!.from),
            q.lte(q.field("issueEndDate"), args.filters!.closingDateRange!.to)
          )
        );
      }
    }
    
    const ipos = await query.collect();
    
    // Enrich with GMP and subscription data
    const enrichedData = await Promise.all(
      ipos.map(async (ipo) => {
        const [gmpData, subscriptionData] = await Promise.all([
          ctx.db
            .query("current_gmp")
            .filter(q => q.eq(q.field("ipoId"), ipo._id))
            .first(),
          ctx.db
            .query("current_subscription")
            .filter(q => q.eq(q.field("ipoId"), ipo._id))
            .first()
        ]);
        
        const enriched = {
          ...ipo,
          gmpPercent: gmpData?.gmpPercent || 0,
          gmpPrice: gmpData?.gmpPrice || 0,
          estListingPrice: gmpData?.estListingPrice || ipo.priceBand?.upper || 0,
          estRetailProfit: gmpData?.estRetailProfit || 0,
          estShniProfit: gmpData?.estShniProfit || 0,
          totalSubscription: subscriptionData?.totalSub || 0,
          kostakRates: gmpData?.kostakRates || 0,
          saudaRates: {
            retail: gmpData?.retailSaudaRates || 0,
            shni: gmpData?.shniSaudaRates || 0
          },
          dataQuality: {
            gmpFreshness: gmpData ? Date.now() - gmpData.lastUpdated : null,
            subscriptionFreshness: subscriptionData ? Date.now() - subscriptionData.lastUpdated : null,
            sources: gmpData?.source ? [gmpData.source] : []
          }
        };
        
        return enriched;
      })
    );
    
    // Apply GMP range filter
    let filteredData = enrichedData;
    if (args.filters?.gmpRange) {
      filteredData = enrichedData.filter(item => 
        item.gmpPercent >= args.filters!.gmpRange!.min &&
        item.gmpPercent <= args.filters!.gmpRange!.max
      );
    }
    
    // Apply subscription range filter
    if (args.filters?.subscriptionRange) {
      filteredData = filteredData.filter(item =>
        item.totalSubscription >= args.filters!.subscriptionRange!.min &&
        item.totalSubscription <= args.filters!.subscriptionRange!.max
      );
    }
    
    // Apply sorting
    if (args.sorting) {
      filteredData.sort((a, b) => {
        const aVal = (a as any)[args.sorting!.field];
        const bVal = (b as any)[args.sorting!.field];
        
        if (args.sorting!.direction === "asc") {
          return aVal > bVal ? 1 : -1;
        } else {
          return aVal < bVal ? 1 : -1;
        }
      });
    }
    
    // Apply pagination
    const startIndex = ((args.pagination?.page || 1) - 1) * (args.pagination?.limit || 50);
    const endIndex = startIndex + (args.pagination?.limit || 50);
    const paginatedData = filteredData.slice(startIndex, endIndex);
    
    return {
      data: paginatedData,
      pagination: {
        total: filteredData.length,
        page: args.pagination?.page || 1,
        limit: args.pagination?.limit || 50,
        totalPages: Math.ceil(filteredData.length / (args.pagination?.limit || 50))
      },
      metadata: {
        lastUpdated: Date.now(),
        dataFreshness: this.calculateAverageDataFreshness(paginatedData),
        qualityScore: this.calculateAverageQualityScore(paginatedData)
      }
    };
  }
});

// Historical data query for charts
export const getHistoricalData = query({
  args: {
    ipoId: v.id("ipos"),
    dataType: v.union(v.literal("gmp"), v.literal("subscription"), v.literal("bidDetails")),
    timeRange: v.object({
      from: v.string(),
      to: v.string()
    }),
    aggregation: v.optional(v.union(
      v.literal("raw"),
      v.literal("hourly"), 
      v.literal("daily")
    )),
    source: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    const fromTimestamp = new Date(args.timeRange.from).getTime();
    const toTimestamp = new Date(args.timeRange.to).getTime();
    
    let data;
    
    switch (args.dataType) {
      case "gmp":
        let gmpQuery = ctx.db
          .query("gmp_history")
          .filter(q => q.eq(q.field("ipoId"), args.ipoId))
          .filter(q => q.gte(q.field("timestamp"), fromTimestamp))
          .filter(q => q.lte(q.field("timestamp"), toTimestamp));
        
        if (args.source) {
          gmpQuery = gmpQuery.filter(q => q.eq(q.field("source"), args.source));
        }
        
        data = await gmpQuery.order("asc").collect();
        break;
        
      case "subscription":
        data = await ctx.db
          .query("subscription_history")
          .filter(q => q.eq(q.field("ipoId"), args.ipoId))
          .filter(q => q.gte(q.field("timestamp"), fromTimestamp))
          .filter(q => q.lte(q.field("timestamp"), toTimestamp))
          .order("asc")
          .collect();
        break;
        
      case "bidDetails":
        data = await ctx.db
          .query("nse_bid_details")
          .filter(q => q.eq(q.field("ipoId"), args.ipoId))
          .filter(q => q.gte(q.field("timestamp"), fromTimestamp))
          .filter(q => q.lte(q.field("timestamp"), toTimestamp))
          .order("asc")
          .collect();
        break;
    }
    
    // Apply aggregation if requested
    if (args.aggregation && args.aggregation !== "raw") {
      data = this.aggregateTimeSeriesData(data, args.aggregation);
    }
    
    return {
      data,
      metadata: {
        totalRecords: data.length,
        timeRange: args.timeRange,
        aggregation: args.aggregation || "raw",
        source: args.source
      }
    };
  }
});
```

### 7.2 Enhanced Mutation Functions
```typescript
// Batch insert for NSE API data
export const insertNSEBatch = mutation({
  args: {
    ipos: v.optional(v.array(v.object({
      symbol: v.string(),
      companyName: v.string(),
      series: v.union(v.literal("EQ"), v.literal("SME")),
      issueStartDate: v.string(),
      issueEndDate: v.string(),
      status: v.string(),
      issueSize: v.optional(v.string()),
      issuePrice: v.optional(v.string()),
      isBse: v.optional(v.string()),
      noOfSharesOffered: v.optional(v.string()),
      noOfSharesBid: v.optional(v.string()),
      subscriptionMultiple: v.optional(v.string())
    }))),
    bidDetails: v.optional(v.array(v.object({
      symbol: v.string(),
      series: v.union(v.literal("EQ"), v.literal("SME")),
      updateTime: v.string(),
      categories: v.array(v.object({
        srNo: v.optional(v.string()),
        category: v.string(),
        noOfSharesOffered: v.optional(v.string()),
        noOfSharesBid: v.string(),
        noOfTotalMeant: v.optional(v.string()),
        noOfApplications: v.optional(v.string())
      }))
    }))),
    demandCharts: v.optional(v.array(v.object({
      symbol: v.string(),
      company: v.string(),
      timestamp: v.string(),
      price: v.string(),
      cumQty: v.string(),
      exchange: v.union(v.literal("NSE"), v.literal("ALL"))
    }))),
    batchMetadata: v.object({
      source: v.string(),
      scrapeTimestamp: v.number(),
      batchId: v.string()
    })
  },
  handler: async (ctx, args) => {
    const results = {
      iposProcessed: 0,
      bidDetailsProcessed: 0,
      demandChartsProcessed: 0,
      errors: [] as string[]
    };
    
    try {
      // Process IPOs
      if (args.ipos) {
        for (const ipoData of args.ipos) {
          try {
            // Check if IPO already exists
            const existingIPO = await ctx.db
              .query("ipos")
              .filter(q => q.eq(q.field("symbol"), ipoData.symbol))
              .first();
            
            if (existingIPO) {
              // Update existing IPO
              await ctx.db.patch(existingIPO._id, {
                companyName: ipoData.companyName,
                series: ipoData.series,
                issueStartDate: ipoData.issueStartDate,
                issueEndDate: ipoData.issueEndDate,
                status: this.mapNSEStatus(ipoData.status),
                issueSize: this.parseIssueSize(ipoData.issueSize),
                issuePrice: ipoData.issuePrice,
                priceBand: this.parsePriceBand(ipoData.issuePrice),
                isBse: ipoData.isBse === "1",
                noOfSharesOffered: this.parseNumber(ipoData.noOfSharesOffered),
                noOfSharesBid: this.parseNumber(ipoData.noOfSharesBid),
                subscriptionMultiple: this.parseNumber(ipoData.subscriptionMultiple),
                lastUpdated: Date.now(),
                dataSource: ["NSE"],
                qualityScore: 95 // High quality for official NSE data
              });
            } else {
              // Create new IPO
              await ctx.db.insert("ipos", {
                symbol: ipoData.symbol,
                companyName: ipoData.companyName,
                series: ipoData.series,
                issueStartDate: ipoData.issueStartDate,
                issueEndDate: ipoData.issueEndDate,
                status: this.mapNSEStatus(ipoData.status),
                issueSize: this.parseIssueSize(ipoData.issueSize),
                issuePrice: ipoData.issuePrice || "",
                priceBand: this.parsePriceBand(ipoData.issuePrice),
                lotSize: 0, // Will be updated from other sources
                isBse: ipoData.isBse === "1",
                noOfSharesOffered: this.parseNumber(ipoData.noOfSharesOffered),
                noOfSharesBid: this.parseNumber(ipoData.noOfSharesBid),
                subscriptionMultiple: this.parseNumber(ipoData.subscriptionMultiple),
                lastUpdated: Date.now(),
                dataSource: ["NSE"],
                qualityScore: 95
              });
            }
            
            results.iposProcessed++;
          } catch (error) {
            results.errors.push(`IPO ${ipoData.symbol}: ${error.message}`);
          }
        }
      }
      
      // Process bid details
      if (args.bidDetails) {
        for (const bidDetail of args.bidDetails) {
          try {
            // Find corresponding IPO
            const ipo = await ctx.db
              .query("ipos")
              .filter(q => q.eq(q.field("symbol"), bidDetail.symbol))
              .first();
            
            if (!ipo) {
              results.errors.push(`IPO not found for symbol: ${bidDetail.symbol}`);
              continue;
            }
            
            // Insert bid details history
            await ctx.db.insert("nse_bid_details", {
              ipoId: ipo._id,
              symbol: bidDetail.symbol,
              series: bidDetail.series,
              timestamp: Date.now(),
              updateTime: bidDetail.updateTime,
              categories: bidDetail.categories.map(cat => ({
                srNo: cat.srNo || "",
                category: cat.category,
                noOfSharesOffered: this.parseNumber(cat.noOfSharesOffered),
                noOfSharesBid: this.parseNumber(cat.noOfSharesBid),
                noOfTotalMeant: this.parseNumber(cat.noOfTotalMeant),
                noOfApplications: this.parseNumber(cat.noOfApplications)
              })),
              apiEndpoint: "ipo-bid-details",
              batchId: args.batchMetadata.batchId
            });
            
            // Update current subscription data
            const totalCategory = bidDetail.categories.find(cat => 
              cat.category.toLowerCase().includes('total')
            );
            
            if (totalCategory) {
              await this.upsertCurrentSubscription(ctx, ipo._id, {
                totalSub: this.parseNumber(totalCategory.noOfTotalMeant) || 0,
                totalAmount: 0, // Will be calculated from other data
                source: "NSE",
                lastUpdated: Date.now(),
                dataFreshness: 0
              });
            }
            
            results.bidDetailsProcessed++;
          } catch (error) {
            results.errors.push(`Bid details ${bidDetail.symbol}: ${error.message}`);
          }
        }
      }
      
      // Process demand charts
      if (args.demandCharts) {
        for (const demandData of args.demandCharts) {
          try {
            const ipo = await ctx.db
              .query("ipos")
              .filter(q => q.eq(q.field("symbol"), demandData.symbol))
              .first();
            
            if (!ipo) {
              results.errors.push(`IPO not found for symbol: ${demandData.symbol}`);
              continue;
            }
            
            await ctx.db.insert("nse_demand_chart", {
              ipoId: ipo._id,
              symbol: demandData.symbol,
              company: demandData.company,
              exchange: demandData.exchange,
              timestamp: demandData.timestamp,
              price: demandData.price,
              cumQty: demandData.cumQty,
              batchId: args.batchMetadata.batchId,
              scrapedAt: Date.now()
            });
            
            results.demandChartsProcessed++;
          } catch (error) {
            results.errors.push(`Demand chart ${demandData.symbol}: ${error.message}`);
          }
        }
      }
      
      // Log batch processing results
      await ctx.db.insert("scrape_logs", {
        source: args.batchMetadata.source,
        batchId: args.batchMetadata.batchId,
        timestamp: args.batchMetadata.scrapeTimestamp,
        results,
        success: results.errors.length === 0,
        processingTime: Date.now() - args.batchMetadata.scrapeTimestamp
      });
      
      return results;
      
    } catch (error) {
      // Log critical error
      await ctx.db.insert("scrape_logs", {
        source: args.batchMetadata.source,
        batchId: args.batchMetadata.batchId,
        timestamp: args.batchMetadata.scrapeTimestamp,
        results,
        success: false,
        error: error.message,
        processingTime: Date.now() - args.batchMetadata.scrapeTimestamp
      });
      
      throw error;
    }
  },
  
  // Helper methods
  mapNSEStatus(nseStatus: string): "Active" | "Closed" | "Listed" | "Upcoming" {
    switch (nseStatus.toLowerCase()) {
      case "active": return "Active";
      case "closed": return "Closed";
      case "listed": return "Listed";
      default: return "Upcoming";
    }
  },
  
  parseIssueSize(sizeStr?: string): number {
    if (!sizeStr) return 0;
    const numStr = sizeStr.replace(/[^\d.]/g, '');
    return parseFloat(numStr) || 0;
  },
  
  parsePriceBand(priceStr?: string): { lower: number; upper: number } | null {
    if (!priceStr) return null;
    
    const matches = priceStr.match(/Rs\.(\d+)\s*to\s*Rs\.(\d+)/);
    if (matches) {
      return {
        lower: parseInt(matches[1]),
        upper: parseInt(matches[2])
      };
    }
    
    const singlePrice = priceStr.match(/Rs\.(\d+)/);
    if (singlePrice) {
      const price = parseInt(singlePrice[1]);
      return { lower: price, upper: price };
    }
    
    return null;
  },
  
  parseNumber(str?: string): number | null {
    if (!str) return null;
    const cleaned = str.replace(/[^\d.-]/g, '');
    const num = parseFloat(cleaned);
    return isNaN(num) ? null : num;
  }
});
```

## 8. Monitoring & Health System

### 8.1 System Health Monitoring
```typescript
class HealthMonitor {
  private metrics: Map<string, HealthMetric> = new Map();
  private alertThresholds: AlertThresholds;
  
  constructor() {
    this.setupAlertThresholds();
    this.startPeriodicHealthChecks();
  }
  
  async recordSuccess(operation: string, metadata: any): Promise<void> {
    const metric = this.getOrCreateMetric(operation);
    
    metric.successCount++;
    metric.lastSuccess = Date.now();
    metric.averageResponseTime = this.calculateAverageResponseTime(
      metric.averageResponseTime,
      metadata.duration || 0
    );
    
    await this.updateHealthScore(operation);
    
    // Check if we should clear any existing alerts
    await this.checkAlertResolution(operation);
  }
  
  async recordError(operation: string, error: Error): Promise<void> {
    const metric = this.getOrCreateMetric(operation);
    
    metric.errorCount++;
    metric.lastError = Date.now();
    metric.recentErrors.push({
      timestamp: Date.now(),
      message: error.message,
      stack: error.stack
    });
    
    // Keep only recent errors (last 100)
    if (metric.recentErrors.length > 100) {
      metric.recentErrors = metric.recentErrors.slice(-100);
    }
    
    await this.updateHealthScore(operation);
    await this.checkAlertTriggers(operation, error);
  }
  
  async getSystemHealth(): Promise<SystemHealthStatus> {
    const services = ['nse_api', 'multi_source_scraping', 'database', 'background_jobs'];
    const healthData: SystemHealthStatus = {
      overall: 'healthy',
      services: {},
      timestamp: Date.now(),
      alerts: []
    };
    
    for (const service of services) {
      const metric = this.metrics.get(service);
      if (!metric) {
        healthData.services[service] = {
          status: 'unknown',
          uptime: 0,
          errorRate: 0,
          lastCheck: 0
        };
        continue;
      }
      
      const errorRate = metric.errorCount / (metric.successCount + metric.errorCount);
      const uptime = this.calculateUptime(metric);
      
      let status: 'healthy' | 'degraded' | 'down' = 'healthy';
      if (errorRate > 0.1 || uptime < 0.95) {
        status = 'degraded';
      }
      if (errorRate > 0.5 || uptime < 0.5) {
        status = 'down';
      }
      
      healthData.services[service] = {
        status,
        uptime,
        errorRate,
        lastCheck: metric.lastSuccess || metric.lastError || 0,
        averageResponseTime: metric.averageResponseTime
      };
      
      // Update overall status
      if (status === 'down') {
        healthData.overall = 'down';
      } else if (status === 'degraded' && healthData.overall === 'healthy') {
        healthData.overall = 'degraded';
      }
    }
    
    // Get active alerts
    healthData.alerts = await this.getActiveAlerts();
    
    return healthData;
  }
  
  private async checkAlertTriggers(operation: string, error: Error): Promise<void> {
    const metric = this.metrics.get(operation);
    if (!metric) return;
    
    const threshold = this.alertThresholds[operation];
    if (!threshold) return;
    
    const errorRate = metric.errorCount / (metric.successCount + metric.errorCount);
    const timeSinceLastSuccess = Date.now() - (metric.lastSuccess || 0);
    
    // Check error rate threshold
    if (errorRate > threshold.maxErrorRate) {
      await this.triggerAlert({
        type: 'error_rate_exceeded',
        operation,
        severity: 'high',
        message: `Error rate ${(errorRate * 100).toFixed(2)}% exceeds threshold ${(threshold.maxErrorRate * 100).toFixed(2)}%`,
        metadata: { errorRate, threshold: threshold.maxErrorRate }
      });
    }
    
    // Check response time threshold
    if (metric.averageResponseTime > threshold.maxResponseTime) {
      await this.triggerAlert({
        type: 'response_time_exceeded',
        operation,
        severity: 'medium',
        message: `Average response time ${metric.averageResponseTime}ms exceeds threshold ${threshold.maxResponseTime}ms`,
        metadata: { responseTime: metric.averageResponseTime, threshold: threshold.maxResponseTime }
      });
    }
    
    // Check staleness threshold
    if (timeSinceLastSuccess > threshold.maxStaleness) {
      await this.triggerAlert({
        type: 'data_staleness',
        operation,
        severity: 'critical',
        message: `No successful operation for ${Math.floor(timeSinceLastSuccess / 60000)} minutes`,
        metadata: { timeSinceLastSuccess, threshold: threshold.maxStaleness }
      });
    }
  }
}

interface HealthMetric {
  successCount: number;
  errorCount: number;
  lastSuccess: number | null;
  lastError: number | null;
  averageResponseTime: number;
  recentErrors: Array<{
    timestamp: number;
    message: string;
    stack?: string;
  }>;
}

interface AlertThresholds {
  [operation: string]: {
    maxErrorRate: number;      // 0.1 = 10%
    maxResponseTime: number;   // milliseconds
    maxStaleness: number;      // milliseconds
  };
}
```

### 8.2 Data Quality Monitoring
```typescript
class DataQualityMonitor {
  private qualityMetrics: Map<string, QualityMetric> = new Map();
  
  async assessDataQuality(source: string, data: any[]): Promise<QualityAssessment> {
    const assessment: QualityAssessment = {
      source,
      timestamp: Date.now(),
      totalRecords: data.length,
      qualityScore: 0,
      issues: [],
      metrics: {
        completeness: 0,
        accuracy: 0,
        consistency: 0,
        timeliness: 0
      }
    };
    
    // Assess completeness
    assessment.metrics.completeness = this.assessCompleteness(data);
    
    // Assess accuracy (cross-validation with other sources)
    assessment.metrics.accuracy = await this.assessAccuracy(data, source);
    
    // Assess consistency (internal data consistency)
    assessment.metrics.consistency = this.assessConsistency(data);
    
    // Assess timeliness (data freshness)
    assessment.metrics.timeliness = this.assessTimeliness(data);
    
    // Calculate overall quality score
    assessment.qualityScore = (
      assessment.metrics.completeness * 0.3 +
      assessment.metrics.accuracy * 0.4 +
      assessment.metrics.consistency * 0.2 +
      assessment.metrics.timeliness * 0.1
    );
    
    // Identify specific issues
    assessment.issues = this.identifyQualityIssues(data, assessment.metrics);
    
    // Store quality metric
    this.qualityMetrics.set(`${source}_${Date.now()}`, {
      source,
      timestamp: Date.now(),
      qualityScore: assessment.qualityScore,
      recordCount: data.length,
      issues: assessment.issues.length
    });
    
    return assessment;
  }
  
  private assessCompleteness(data: any[]): number {
    if (data.length === 0) return 0;
    
    const requiredFields = ['companyName', 'type', 'gmpPercent'];
    let totalScore = 0;
    
    for (const record of data) {
      let recordScore = 0;
      for (const field of requiredFields) {
        if (record[field] !== undefined && record[field] !== null && record[field] !== '') {
          recordScore += 1;
        }
      }
      totalScore += (recordScore / requiredFields.length);
    }
    
    return (totalScore / data.length) * 100;
  }
  
  private async assessAccuracy(data: any[], currentSource: string): Promise<number> {
    // Cross-validate with other sources
    let accuracyScore = 100;
    const otherSources = await this.getRecentDataFromOtherSources(currentSource);
    
    for (const record of data) {
      const matchingRecords = otherSources.filter(other => 
        this.fuzzyMatch(record.companyName, other.companyName)
      );
      
      if (matchingRecords.length > 0) {
        const avgGMP = matchingRecords.reduce((sum, r) => sum + r.gmpPercent, 0) / matchingRecords.length;
        const deviation = Math.abs(record.gmpPercent - avgGMP) / Math.max(avgGMP, 1);
        
        if (deviation > 0.2) { // More than 20% deviation
          accuracyScore -= 5;
        }
      }
    }
    
    return Math.max(0, accuracyScore);
  }
  
  private assessConsistency(data: any[]): number {
    let consistencyScore = 100;
    
    for (const record of data) {
      // Check logical consistency
      if (record.gmpPercent < 0 && record.type === 'Mainline') {
        // Negative GMP is unusual for mainline IPOs
        consistencyScore -= 2;
      }
      
      if (record.gmpPercent > 300) {
        // Very high GMP might be an error
        consistencyScore -= 5;
      }
      
      if (record.estListingPrice && record.gmpPrice && record.ipoPrice) {
        const expectedListing = record.ipoPrice + record.gmpPrice;
        const deviation = Math.abs(record.estListingPrice - expectedListing) / expectedListing;
        
        if (deviation > 0.05) { // More than 5% deviation
          consistencyScore -= 3;
        }
      }
    }
    
    return Math.max(0, consistencyScore);
  }
  
  private assessTimeliness(data: any[]): number {
    const now = Date.now();
    const maxAge = 30 * 60 * 1000; // 30 minutes
    
    let totalScore = 0;
    
    for (const record of data) {
      const age = now - (record.timestamp || record.scrapedAt || now);
      const freshnessScore = Math.max(0, 100 - (age / maxAge) * 100);
      totalScore += freshnessScore;
    }
    
    return data.length > 0 ? totalScore / data.length : 0;
  }
}

interface QualityMetric {
  source: string;
  timestamp: number;
  qualityScore: number;
  recordCount: number;
  issues: number;
}

interface QualityAssessment {
  source: string;
  timestamp: number;
  totalRecords: number;
  qualityScore: number;
  issues: QualityIssue[];
  metrics: {
    completeness: number;
    accuracy: number;
    consistency: number;
    timeliness: number;
  };
}
```

## 9. Performance Optimization

### 9.1 Caching Strategy
```typescript
class CacheManager {
  private redisClient: Redis;
  private cacheStrategies: Map<string, CacheStrategy>;
  
  constructor() {
    this.initializeRedis();
    this.setupCacheStrategies();
  }
  
  private setupCacheStrategies(): void {
    this.cacheStrategies = new Map([
      ['dashboard_data', {
        ttl: 300, // 5 minutes
        key: 'dashboard:main',
        invalidationTriggers: ['ipo_update', 'gmp_update'],
        compression: true
      }],
      ['gmp_aggregator', {
        ttl: 900, // 15 minutes
        key: 'gmp:aggregator:{filters_hash}',
        invalidationTriggers: ['gmp_update'],
        compression: true
      }],
      ['nse_session', {
        ttl: 1800, // 30 minutes
        key: 'nse:session:{symbol}:{series}',
        invalidationTriggers: ['session_expired'],
        compression: false
      }],
      ['historical_data', {
        ttl: 3600, // 1 hour
        key: 'historical:{type}:{ipo_id}:{time_range_hash}',
        invalidationTriggers: [],
        compression: true
      }]
    ]);
  }
  
  async get<T>(key: string, strategyName: string): Promise<T | null> {
    const strategy = this.cacheStrategies.get(strategyName);
    if (!strategy) return null;
    
    try {
      const cachedData = await this.redisClient.get(key);
      if (!cachedData) return null;
      
      const parsed = JSON.parse(cachedData);
      
      // Check if cache has expired
      if (Date.now() - parsed.timestamp > strategy.ttl * 1000) {
        await this.redisClient.del(key);
        return null;
      }
      
      return strategy.compression ? 
        this.decompress(parsed.data) : parsed.data;
        
    } catch (error) {
      console.error(`Cache get error for key ${key}:`, error);
      return null;
    }
  }
  
  async set<T>(key: string, data: T, strategyName: string): Promise<void> {
    const strategy = this.cacheStrategies.get(strategyName);
    if (!strategy) return;
    
    try {
      const cacheData = {
        data: strategy.compression ? this.compress(data) : data,
        timestamp: Date.now(),
        strategy: strategyName
      };
      
      await this.redisClient.setex(
        key, 
        strategy.ttl, 
        JSON.stringify(cacheData)
      );
      
    } catch (error) {
      console.error(`Cache set error for key ${key}:`, error);
    }
  }
  
  async invalidate(trigger: string): Promise<void> {
    const affectedStrategies = Array.from(this.cacheStrategies.entries())
      .filter(([_, strategy]) => strategy.invalidationTriggers.includes(trigger));
    
    for (const [strategyName, strategy] of affectedStrategies) {
      const pattern = strategy.key.replace(/\{[^}]+\}/g, '*');
      const keys = await this.redisClient.keys(pattern);
      
      if (keys.length > 0) {
        await this.redisClient.del(...keys);
        console.log(`Invalidated ${keys.length} cache entries for strategy ${strategyName}`);
      }
    }
  }
}
```

### 9.2 Database Optimization
```typescript
class DatabaseOptimizer {
  private indexStrategies: IndexStrategy[];
  
  constructor() {
    this.setupIndexStrategies();
  }
  
  private setupIndexStrategies(): void {
    this.indexStrategies = [
      {
        table: 'ipos',
        indexes: [
          { fields: ['symbol'], unique: true },
          { fields: ['status', 'series'] },
          { fields: ['issueEndDate'] },
          { fields: ['companyName'], textSearch: true }
        ]
      },
      {
        table: 'gmp_history',
        indexes: [
          { fields: ['ipoId', 'timestamp'] },
          { fields: ['source', 'timestamp'] },
          { fields: ['date', 'source'] },
          { fields: ['batchId'] }
        ]
      },
      {
        table: 'nse_bid_details',
        indexes: [
          { fields: ['ipoId', 'timestamp'] },
          { fields: ['symbol', 'series'] },
          { fields: ['batchId'] }
        ]
      },
      {
        table: 'current_gmp',
        indexes: [
          { fields: ['ipoId'], unique: true },
          { fields: ['lastUpdated'] },
          { fields: ['gmpPercent'] }
        ]
      }
    ];
  }
  
  async optimizeQueries(): Promise<QueryOptimizationResult> {
    const results: QueryOptimizationResult = {
      optimizedQueries: 0,
      indexesCreated: 0,
      performanceGains: {}
    };
    
    // Analyze slow queries
    const slowQueries = await this.identifySlowQueries();
    
    for (const query of slowQueries) {
      const optimization = await this.optimizeQuery(query);
      if (optimization.applied) {
        results.optimizedQueries++;
        results.performanceGains[query.id] = optimization.performanceGain;
      }
    }
    
    return results;
  }
  
  async archiveOldData(): Promise<ArchiveResult> {
    const cutoffDate = Date.now() - (90 * 24 * 60 * 60 * 1000); // 90 days ago
    
    const tables = ['gmp_history', 'subscription_history', 'nse_bid_details', 'scrape_logs'];
    const archiveResults: ArchiveResult = {
      totalRecordsArchived: 0,
      tablesProcessed: 0,
      spaceSaved: 0
    };
    
    for (const table of tables) {
      try {
        const oldRecords = await this.getOldRecords(table, cutoffDate);
        
        if (oldRecords.length > 0) {
          // Archive to cold storage
          await this.archiveToStorage(table, oldRecords);
          
          // Delete from active database
          await this.deleteOldRecords(table, cutoffDate);
          
          archiveResults.totalRecordsArchived += oldRecords.length;
          archiveResults.tablesProcessed++;
        }
      } catch (error) {
        console.error(`Failed to archive data from ${table}:`, error);
      }
    }
    
    return archiveResults;
  }
}
```


## 16. Conclusion

This comprehensive backend PRD and system specification provides a robust foundation for building the IPO Dalal platform. The system is designed to handle the complexities of multi-source data integration, real-time processing, and high availability while maintaining data quality and user experience.

### Key Success Factors:
1. **Multi-Source Reliability**: By integrating multiple data sources with validation and conflict resolution
2. **Advanced Anti-Bot Measures**: Ensuring reliable data collection through sophisticated scraping techniques
3. **Real-time Processing**: Providing fresh data through optimized pipelines and caching strategies
4. **Scalable Architecture**: Built to grow with user demands and data volume
5. **Comprehensive Monitoring**: Proactive issue detection and resolution
6. **Security & Compliance**: Ensuring legal and ethical data collection and usage

### Expected Outcomes:
- **99.9% System Uptime**: Through redundancy and monitoring
- **Sub-30 Minute Data Freshness**: For all critical IPO metrics
- **95%+ Market Coverage**: Of Indian IPOs across all segments
- **High Data Accuracy**: Through multi-source validation and quality scoring
- **Scalable Growth**: Supporting 10x+ user growth without major architectural changes

This system specification serves as the blueprint for implementing a world-class IPO tracking platform that will serve Indian investors with reliable, accurate, and timely IPO information and analysis.