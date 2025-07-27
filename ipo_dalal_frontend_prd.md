# IPO Dalal Frontend - Product Requirements Document

## 1. Overview

### 1.1 Product Vision
IPO Dalal is a comprehensive IPO tracking platform designed for Indian investors, providing real-time data, analysis, and insights to help investors make informed decisions about Initial Public Offerings (IPOs) in the Indian market.

### 1.2 Core Objectives
- **Comprehensive IPO Data**: Centralized platform for all IPO-related information
- **Real-time Updates**: Live GMP, subscription data, and market insights
- **Investment Decision Support**: Tools and data to help investors make better decisions
- **Mobile-First Design**: Responsive platform working seamlessly across all devices
- **Indian Market Focus**: Localized for Indian investors with INR, IST, and Indian numbering system

### 1.3 Technology Stack
- **Frontend Framework**: Next.js (React)
- **Backend & Database**: Convex (Real-time, serverless)
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn/ui
- **Charting**: Evilcharts and Recharts
- **Hosting**: Vercel


## 2. User Personas

### 2.1 Primary Users
- **Retail Investors**: Individual investors looking for IPO opportunities
- **HNI Investors**: High Net Worth Individuals seeking premium IPO data
- **Research Analysts**: Professionals requiring comprehensive IPO analysis
- **Financial Advisors**: Professionals advising clients on IPO investments

### 2.2 User Journey
1. **Discovery**: User lands on homepage/dashboard
2. **Exploration**: Browse current and upcoming IPOs
3. **Analysis**: Deep dive into specific IPO details and GMP data
4. **Decision**: Use aggregated data to make investment decisions
5. **Monitoring**: Track subscription progress and GMP changes

## 3. Feature Requirements

### 3.1 Core Features

#### 3.1.1 Home Page/Dashboard
**Purpose**: Primary landing page providing overview of IPO market

**Key Components**:
- **IPO Status Overview Cards**
  - Upcoming IPOs and Active IPOs
IPO Dashboard will contain a table of Upcoming and Active IPOs. it will have the folowing columns - type, company, ipo size, lot, price, amount, gmp, closing, allotment, refund, listing. 

#### 3.1.2 GMP Aggregator Page
**Purpose**: Comprehensive GMP data for all IPOs

**Data Columns**:
- Type (SME/Mainline with visual badges)
- Company Name (with link to detailed view)
- IPO Size (₹ in crores, Indian numbering)
- IPO Price (₹ per share)
- GMP % (with color coding. 0% to 15%, 15% to 30%, 30% to 50%, 50%+ in increasing order of dark colour.)
- GMP Price (₹)
- Est. Listing Price (IPO Price + GMP Price)
- Est. Profit (₹ for Retail and SHNI lots)
- Kostak Rates (₹)
- Subject to Sauda (Retail/SHNI rates)
- Total Subscription (times subscribed)
- Closing Date (with countdown for active IPOs)

**Features**:
- **Advanced Filtering**
  - By IPO type (SME/Mainline)
  - By GMP range
  - By subscription status
  - By closing date range
  - By IPO size

- **Sorting Options**
  - GMP % (highest to lowest)
  - IPO size
  - Closing date
  - Subscription level
  - Alphabetical

- **Data Export**
  - CSV export functionality
  - Image with IPODalal watermark and website name. 

**Technical Requirements**:
- Real-time updates without full page refresh
- Mobile-responsive table (horizontal scroll + priority columns)

#### 3.1.3 Subscription Aggregator Page
**Purpose**: Detailed subscription data across all categories

**Data Columns**:
- Type (SME/Mainline)
- Company Name
- Issue Size (₹ in crores)
- Current GMP %
- QIB Subscription (times)
- BHNI Subscription (times)
- SHNI Subscription (times)
- Retail Subscription (times)
- Employee Subscription (times)
- Shareholder Subscription (times)
- Total Subscription (times)
- Total Amount Applied (₹ in crores)
- Closing Date

### 3.2 Advanced Features (Phase 2)

#### 3.2.1 Individual IPO Detail Pages
- Complete IPO information
- Historical GMP charts
- Subscription timeline
- Company fundamentals
- Document downloads (DRHP, RHP)

#### 3.2.2 Portfolio Tracking
- Track applied IPOs
- Allotment status
- Profit/Loss calculation
- Investment history

#### 3.2.3 Alerts & Notifications
- GMP change alerts
- Subscription milestone notifications
- New IPO announcements
- Closing date reminders

## 4. System Architecture

### 4.1 Frontend Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Next.js Application                      │
├─────────────────────────────────────────────────────────────┤
│  Pages & Routing                                           │
│  ├── / (Home Dashboard)                                    │
│  ├── /gmp-aggregator                                       │
│  ├── /subscription-aggregator                              │
│  ├── /ipo/[slug] (Individual IPO pages)                    │
│  └── /api/* (API routes for external integrations)         │
├─────────────────────────────────────────────────────────────┤
│  Components Layer                                          │
│  ├── Layout Components (Header, Footer, Sidebar)           │
│  ├── Data Display (Tables, Cards, Charts)                  │
│  ├── UI Components (Buttons, Modals, Forms)                │
│  └── Business Logic Components (IPO Cards, GMP Displays)   │
├─────────────────────────────────────────────────────────────┤
│  State Management                                          │
│  ├── Convex Queries (Real-time data)                       │
│  ├── React Query (Caching & API state)                     │
│  ├── Zustand (Client-side state)                           │
│  └── Context API (Theme, User preferences)                 │
├─────────────────────────────────────────────────────────────┤
│  Utility Layer                                            │
│  ├── Date/Time utilities (IST formatting)                  │
│  ├── Number formatting (Indian numbering system)           │
│  ├── Currency utilities (₹ formatting)                     │
│  └── API helpers and data transformers                     │
└─────────────────────────────────────────────────────────────┘
```

### 4.2 Data Flow Architecture

```
┌─────────────┐    ┌──────────────┐    ┌─────────────────┐
│   Convex    │    │  Next.js     │    │   User Device   │
│  Database   │◄──►│  Frontend    │◄──►│   (Browser)     │
└─────────────┘    └──────────────┘    └─────────────────┘
       ▲                                          │
       │                                          │
       │           ┌──────────────┐               │
       │           │  API Routes  │               │
       │           │              │               │
       └───────────│ • NSE APIs   │               │
                   │ • BSE APIs   │               │
                   │ • Scrapers   │               │
                   └──────────────┘               │
                          │                       │
                          ▼                       │
                   ┌──────────────┐               │
                   │ External     │               │
                   │ Services     │◄──────────────┘
                   │ • Analytics  │
                   │ • Monitoring │
                   └──────────────┘
```

### 4.3 Component Structure

```
src/
├── app/                          # Next.js 14 App Router
│   ├── layout.tsx               # Root layout
│   ├── page.tsx                 # Home dashboard
│   ├── gmp-aggregator/
│   │   └── page.tsx            # GMP Aggregator
│   ├── subscription-aggregator/
│   │   └── page.tsx            # Subscription Aggregator
│   └── api/                    # API routes
├── components/
│   ├── ui/                     # Shadcn/ui components
│   ├── layout/                 # Layout components
│   ├── dashboard/              # Dashboard-specific components
│   ├── tables/                 # Data table components
│   ├── charts/                 # Chart components
│   └── common/                 # Reusable components
├── convex/                     # Convex functions
│   ├── queries.ts              # Database queries
│   ├── mutations.ts            # Database mutations
│   └── schema.ts               # Database schema
├── lib/
│   ├── utils.ts                # Utility functions
│   ├── constants.ts            # App constants
│   ├── formatters.ts           # Number/date formatters
│   └── api.ts                  # API helpers
├── hooks/                      # Custom React hooks
├── stores/                     # State management
└── types/                      # TypeScript definitions
```

## 5. User Interface Design

### 5.1 Design System

#### 5.1.1 Color Palette
- **Primary**: Blue (#0066CC) - Trust, finance
- **Success**: Green (#00A86B) - Positive GMP, profits
- **Danger**: Red (#FF4444) - Negative GMP, losses
- **Warning**: Orange (#FF8C00) - Moderate risk, alerts
- **Neutral**: Gray scale for text and backgrounds

#### 5.1.2 Typography
- **Headings**: Inter font family (600-700 weight)
- **Body**: Inter font family (400-500 weight)
- **Numbers**: Tabular numbers for data alignment
- **Monospace**: For technical data (IDs, codes)

#### 5.1.3 Spacing & Layout
- **Grid System**: 12-column responsive grid
- **Breakpoints**: Mobile (320px), Tablet (768px), Desktop (1024px+)
- **Spacing**: 4px base unit (4, 8, 12, 16, 24, 32, 48px)

### 5.2 Mobile-First Design

#### 5.2.1 Mobile Optimizations
- **Touch-Friendly**: Minimum 44px touch targets
- **Swipe Actions**: Horizontal scroll for tables
- **Priority Content**: Most important columns visible first
- **Collapsible Sections**: Accordion-style information display

#### 5.2.2 Progressive Enhancement
- **Core Functionality**: Works without JavaScript
- **Enhanced Experience**: Rich interactions with JavaScript
- **Offline Support**: Service worker for cached data
- **Fast Loading**: Code splitting and lazy loading

## 6. Performance Requirements

### 6.1 Loading Performance
- **First Contentful Paint**: < 1.5 seconds
- **Largest Contentful Paint**: < 2.5 seconds
- **Time to Interactive**: < 3 seconds
- **Core Web Vitals**: Meet Google's standards

### 6.2 Runtime Performance
- **Real-time Updates**: < 100ms for data updates
- **Table Rendering**: Handle 100+ rows smoothly
- **Search/Filter**: < 200ms response time
- **Chart Rendering**: < 500ms for complex visualizations

### 6.3 Data Freshness
- **GMP Data**: Updated every 15-30 minutes
- **Subscription Data**: Updated every 5-10 minutes
- **IPO Details**: Updated daily or on change
- **Market Status**: Real-time during market hours

## 7. Indian Localization

### 7.1 Numbering System
- **Currency**: ₹ symbol
- **Large Numbers**: Indian format (₹1,00,000 instead of ₹100,000)
- **Crores/Lakhs**: Display both formats based on magnitude

### 7.2 Time & Dates
- **Timezone**: IST (Indian Standard Time)
- **Date Format**: DD-MMM-YYYY
- **Time Format**: 12-hour with AM/PM
- **Market Hours**: Highlight Indian market timings

## 8. Security & Compliance

### 8.1 Data Protection
- **HTTPS Only**: SSL/TLS encryption
- **API Security**: Rate limiting and authentication
- **User Privacy**: No personal data collection initially
- **Data Integrity**: Validation and sanitization

### 8.2 Financial Regulations
- **Disclaimers**: Investment risk warnings
- **Data Sources**: Clear attribution of data sources
- **No Financial Advice**: Platform is for information only
- **Accuracy Notices**: Data not guaranteed to be error-free

## 9. Success Metrics

### 9.1 User Engagement
- **Daily Active Users**: Target 1,000+ DAU within 6 months
- **Session Duration**: Average 5+ minutes per session
- **Page Views**: 10+ pages per session
- **Return Rate**: 60%+ user return within 7 days

### 9.2 Technical Performance
- **Uptime**: 99.9% availability
- **Error Rate**: < 0.1% of requests
- **Load Time**: 95% of pages load within 3 seconds
- **Mobile Usage**: 70%+ traffic from mobile devices

### 9.3 Business Impact
- **Market Coverage**: Track 95%+ of Indian IPOs
- **Data Accuracy**: < 1% discrepancy vs official sources
- **User Satisfaction**: 4.5+ rating (when ratings implemented)
- **Growth Rate**: 20% month-over-month user growth

## 10. Technical Specifications

### 0.3 Build Configuration
- **Next.js Config**: App Router, optimized images
- **Tailwind Config**: Custom color palette, Indian number formatting
- **TypeScript**: Strict mode enabled
- **ESLint**: Custom rules for consistent code style

This comprehensive PRD provides the foundation for building IPO Dalal's frontend, ensuring it meets the needs of Indian investors while providing a scalable, performant, and user-friendly platform for IPO tracking and analysis.