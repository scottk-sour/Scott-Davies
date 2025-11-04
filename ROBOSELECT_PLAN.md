# RoboSelect - Implementation Plan

**Project**: Smart Robot Recommendation & Lead Generation Platform
**Target Market**: UK businesses needing service robots (hotels, restaurants, care homes)
**Business Model**: Lead generation for robot reselling business
**Tech Stack**: Next.js 14, TypeScript, PostgreSQL, Prisma, Anthropic Claude API

---

## 1. PROJECT OVERVIEW

### Business Context
- You resell service robots from Pudu, Keenon, and other manufacturers
- Average sale: £12k-15k per robot (typical order: 2-3 robots)
- Profit margin: £4k-6k per robot + financing commission (5-15%)
- Sales cycle: 2-4 weeks from first contact to sale
- This platform generates and qualifies leads automatically

### Success Metrics
- Generate 10+ qualified leads per week
- 20% quiz completion → quote request conversion
- 10% quiz completion → demo booking conversion
- <2 second page load times
- 60%+ mobile traffic
- Rank for "restaurant robots UK" within 3 months

---

## 2. DATABASE SCHEMA

### Complete Prisma Schema

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ============================================
// ROBOT & PRODUCT DATA
// ============================================

model Manufacturer {
  id          String   @id @default(cuid())
  name        String   @unique // "Pudu", "Keenon"
  slug        String   @unique
  description String?
  logo        String?
  website     String?
  robots      Robot[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([slug])
}

model Industry {
  id          String   @id @default(cuid())
  name        String   @unique // "Hotels", "Restaurants"
  slug        String   @unique
  description String?
  icon        String?
  robots      RobotIndustry[]
  assessments Assessment[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([slug])
}

model RobotType {
  id          String   @id @default(cuid())
  name        String   @unique // "Delivery", "Cleaning", "Reception"
  slug        String   @unique
  description String?
  icon        String?
  robots      RobotRobotType[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([slug])
}

model Robot {
  id             String   @id @default(cuid())
  name           String   // "BellaBot"
  slug           String   @unique
  model          String?  // "BellaBot Pro"
  tagline        String?  // "Cutest delivery robot"
  description    String?  @db.Text

  // Relationships
  manufacturerId String
  manufacturer   Manufacturer @relation(fields: [manufacturerId], references: [id])

  // Media
  thumbnail      String?
  images         String[]  // Array of image URLs
  videoUrl       String?
  videoThumbnail String?
  brochureUrl    String?   // PDF download link

  // Specifications (stored as JSON)
  specifications Json?     // Flexible structure for all specs
  features       String[]  // Array of key features

  // Pricing
  priceUpfront   Int       // Price in pence (£12,999 = 1299900)
  price2Year     Int       // Monthly payment for 2-year term
  price3Year     Int       // Monthly payment for 3-year term
  price5Year     Int       // Monthly payment for 5-year term

  // Matching Algorithm Weights
  matchWeights   Json?     // Custom weights for matching algorithm

  // SEO
  metaTitle      String?
  metaDescription String?

  // Status
  featured       Boolean  @default(false)
  active         Boolean  @default(true)

  // Relationships
  industries     RobotIndustry[]
  types          RobotRobotType[]
  useCases       UseCase[]
  quotes         QuoteItem[]
  demos          Demo[]

  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  @@index([slug])
  @@index([featured, active])
  @@index([manufacturerId])
}

// Many-to-many relationships
model RobotIndustry {
  robot      Robot    @relation(fields: [robotId], references: [id], onDelete: Cascade)
  robotId    String
  industry   Industry @relation(fields: [industryId], references: [id], onDelete: Cascade)
  industryId String

  @@id([robotId, industryId])
  @@index([robotId])
  @@index([industryId])
}

model RobotRobotType {
  robot      Robot     @relation(fields: [robotId], references: [id], onDelete: Cascade)
  robotId    String
  type       RobotType @relation(fields: [typeId], references: [id], onDelete: Cascade)
  typeId     String

  @@id([robotId, typeId])
  @@index([robotId])
  @@index([typeId])
}

model UseCase {
  id          String   @id @default(cuid())
  robotId     String
  robot       Robot    @relation(fields: [robotId], references: [id], onDelete: Cascade)

  title       String   // "Restaurant Table Service"
  description String   @db.Text
  benefits    String[] // Array of benefits
  images      String[] // Array of images

  order       Int      @default(0) // Display order

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([robotId])
  @@index([robotId, order])
}

// ============================================
// NEEDS ASSESSMENT (QUIZ)
// ============================================

model Assessment {
  id        String   @id @default(cuid())

  // Step 1: Industry
  industryId String?
  industry   Industry? @relation(fields: [industryId], references: [id])

  // Step 2: Use cases (stored as array)
  useCases   String[] // ["delivering", "cleaning", "reception"]

  // Step 3: Venue details
  floors     String?  // "1", "2", "3-5", "6-10", "10+"
  venueSize  String?  // "under-2k", "2-5k", "5-10k", "10-20k", "20k+"
  dailyGuests String? // "under-50", "50-100", "100-300", "300-500", "500+"
  staffCount Int?

  // Step 4: Priorities (1-5 rating for each)
  priorityCost       Int? // 1-5
  priorityLabor      Int? // 1-5
  priorityExperience Int? // 1-5
  priorityMarketing  Int? // 1-5
  priorityEfficiency Int? // 1-5

  // Step 5: Budget & Timeline
  budget     String?  // "under-10k", "10-25k", "25-50k", "50k+", "not-sure"
  timeline   String?  // "urgent", "2-3mo", "3-6mo", "researching"
  payment    String?  // "upfront", "financing", "not-sure"

  // Step 6: Contact (optional)
  email      String?
  phone      String?
  companyName String?

  // Matching Results (stored as JSON)
  matchResults Json?  // Array of {robotId, score, reasons}

  // Lead tracking
  leadId     String?  @unique
  lead       Lead?    @relation(fields: [leadId], references: [id])

  // Metadata
  ipAddress  String?
  userAgent  String?
  source     String?  // "organic", "ad", "referral"
  utmSource  String?
  utmMedium  String?
  utmCampaign String?

  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  @@index([email])
  @@index([createdAt])
  @@index([leadId])
}

// ============================================
// LEADS
// ============================================

model Lead {
  id           String   @id @default(cuid())

  // Contact info
  email        String   @unique
  phone        String?
  companyName  String?
  contactName  String?
  address      String?

  // Lead source
  source       String?  // "quiz", "demo-request", "quote-request"

  // Status
  status       LeadStatus @default(NEW)
  nextAction   String?
  nextActionDate DateTime?

  // Notes
  notes        String?  @db.Text

  // Relationships
  assessment   Assessment?
  quotes       Quote[]
  demos        Demo[]
  activities   LeadActivity[]

  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  @@index([email])
  @@index([status])
  @@index([createdAt])
  @@index([nextActionDate])
}

enum LeadStatus {
  NEW
  CONTACTED
  QUALIFIED
  DEMO_SCHEDULED
  DEMO_COMPLETED
  QUOTE_SENT
  NEGOTIATING
  WON
  LOST
  NURTURE
}

model LeadActivity {
  id        String   @id @default(cuid())
  leadId    String
  lead      Lead     @relation(fields: [leadId], references: [id], onDelete: Cascade)

  type      ActivityType
  description String @db.Text
  metadata  Json?

  createdAt DateTime @default(now())

  @@index([leadId, createdAt])
}

enum ActivityType {
  QUIZ_COMPLETED
  QUOTE_REQUESTED
  QUOTE_VIEWED
  DEMO_REQUESTED
  DEMO_COMPLETED
  EMAIL_SENT
  PHONE_CALL
  NOTE_ADDED
  STATUS_CHANGED
}

// ============================================
// QUOTES
// ============================================

model Quote {
  id           String   @id @default(cuid())
  quoteNumber  String   @unique // "Q-2025-001"

  // Customer
  leadId       String
  lead         Lead     @relation(fields: [leadId], references: [id], onDelete: Cascade)

  // Customer details (snapshot at time of quote)
  customerName    String
  customerEmail   String
  customerPhone   String?
  companyName     String?
  address         String?
  industryType    String?

  // Quote items
  items        QuoteItem[]

  // Pricing
  subtotal     Int      // Total before options

  // Options
  extendedWarranty Boolean @default(false)
  warrantyPrice    Int?
  prioritySupport  Boolean @default(false)
  supportPrice     Int?
  extraTraining    Boolean @default(false)
  trainingPrice    Int?

  // Finance terms
  financeTerm  String   // "upfront", "2-year", "3-year", "5-year"
  monthlyPayment Int?   // If financing
  totalPrice   Int      // Final total including options

  // Status
  status       QuoteStatus @default(DRAFT)
  sentAt       DateTime?
  viewedAt     DateTime?
  viewCount    Int      @default(0)
  acceptedAt   DateTime?
  rejectedAt   DateTime?

  // PDF
  pdfUrl       String?

  // ROI Calculation (saved for reference)
  roiData      Json?

  // Notes
  internalNotes String? @db.Text

  // Valid until
  validUntil   DateTime?

  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  @@index([leadId])
  @@index([quoteNumber])
  @@index([status])
  @@index([createdAt])
}

enum QuoteStatus {
  DRAFT
  SENT
  VIEWED
  ACCEPTED
  REJECTED
  EXPIRED
}

model QuoteItem {
  id        String @id @default(cuid())
  quoteId   String
  quote     Quote  @relation(fields: [quoteId], references: [id], onDelete: Cascade)

  robotId   String
  robot     Robot  @relation(fields: [robotId], references: [id])

  quantity  Int    @default(1)
  unitPrice Int    // Price at time of quote (snapshot)
  lineTotal Int    // quantity * unitPrice

  @@index([quoteId])
  @@index([robotId])
}

// ============================================
// DEMOS
// ============================================

model Demo {
  id          String   @id @default(cuid())

  // Customer
  leadId      String
  lead        Lead     @relation(fields: [leadId], references: [id], onDelete: Cascade)

  // Customer details (snapshot)
  customerName  String
  customerEmail String
  customerPhone String
  companyName   String?

  // Robot interest
  robotId     String?
  robot       Robot?   @relation(fields: [robotId], references: [id])
  robotName   String?  // In case robot is deleted later

  // Scheduling
  requestedDate DateTime
  requestedTime String? // "morning", "afternoon", "2pm"
  confirmedDate DateTime?
  confirmedTime DateTime?

  // Location
  address     String
  postcode    String?
  city        String?

  // Additional info
  attendees   Int?     @default(1)
  notes       String?  @db.Text

  // Status
  status      DemoStatus @default(REQUESTED)

  // Completion (filled after demo)
  completedAt DateTime?
  howDidItGo  String?  @db.Text
  interestLevel Int?   // 1-5
  completionNotes String? @db.Text
  nextSteps   String?  @db.Text

  // Follow-up
  followUpSent Boolean @default(false)
  convertedToQuote Boolean @default(false)

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([leadId])
  @@index([status])
  @@index([requestedDate])
  @@index([confirmedDate])
}

enum DemoStatus {
  REQUESTED
  CONFIRMED
  COMPLETED
  CANCELLED
  NO_SHOW
}

// ============================================
// CASE STUDIES
// ============================================

model CaseStudy {
  id          String   @id @default(cuid())

  title       String   // "How The Grand Hotel Increased Service Speed by 40%"
  slug        String   @unique

  // Customer
  customerName String  // "The Grand Hotel"
  industry     String  // "Hotels"
  location     String? // "London, UK"
  logo         String? // Customer logo

  // Story
  challenge    String  @db.Text
  solution     String  @db.Text
  results      String  @db.Text

  // Metrics
  metrics      Json?   // [{ label: "Service Speed", value: "+40%" }]

  // Media
  images       String[]
  videoUrl     String?

  // Testimonial
  testimonial  String? @db.Text
  testimonialAuthor String?
  testimonialRole   String?
  testimonialPhoto  String?

  // Related robots
  robotIds     String[] // Array of robot IDs featured

  // SEO
  metaTitle    String?
  metaDescription String?

  // Status
  featured     Boolean @default(false)
  published    Boolean @default(true)

  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  @@index([slug])
  @@index([featured, published])
}

// ============================================
// ADMIN / SETTINGS
// ============================================

model AdminUser {
  id        String   @id @default(cuid())
  email     String   @unique
  password  String   // Hashed with bcrypt
  name      String
  role      AdminRole @default(ADMIN)

  active    Boolean  @default(true)
  lastLogin DateTime?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([email])
}

enum AdminRole {
  SUPER_ADMIN
  ADMIN
  VIEWER
}

model EmailTemplate {
  id        String   @id @default(cuid())
  name      String   @unique // "quote-sent", "demo-confirmation"
  subject   String
  htmlBody  String   @db.Text
  textBody  String   @db.Text
  variables String[] // Available template variables

  active    Boolean  @default(true)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([name])
}

model SiteSettings {
  id        String   @id @default(cuid())
  key       String   @unique
  value     String   @db.Text

  updatedAt DateTime @updatedAt
}
```

---

## 3. API ENDPOINTS

### Public API Routes

#### Quiz & Matching
```
POST   /api/quiz/start              - Start new assessment
POST   /api/quiz/save               - Save progress (auto-save)
POST   /api/quiz/submit             - Submit completed quiz
GET    /api/quiz/results/:id        - Get quiz results
POST   /api/quiz/match              - Run matching algorithm
```

#### Robots
```
GET    /api/robots                  - List all robots (with filters)
GET    /api/robots/:slug            - Get single robot details
GET    /api/robots/:slug/related    - Get related robots
```

#### Industries
```
GET    /api/industries              - List all industries
GET    /api/industries/:slug        - Get industry details
GET    /api/industries/:slug/robots - Get robots for industry
```

#### Quotes
```
POST   /api/quotes/request          - Submit quote request
POST   /api/quotes/calculate        - Calculate pricing
GET    /api/quotes/:id/pdf          - Download quote PDF
POST   /api/quotes/:id/track-view   - Track quote opens
```

#### Demos
```
POST   /api/demos/request           - Submit demo request
GET    /api/demos/availability      - Check available dates
POST   /api/demos/:id/confirm       - Confirm demo (admin)
POST   /api/demos/:id/complete      - Mark demo complete (admin)
```

#### Case Studies
```
GET    /api/case-studies            - List case studies
GET    /api/case-studies/:slug      - Get single case study
```

#### Contact
```
POST   /api/contact                 - General contact form
```

### Admin API Routes

#### Authentication
```
POST   /api/admin/auth/login        - Admin login
POST   /api/admin/auth/logout       - Admin logout
GET    /api/admin/auth/session      - Check session
```

#### Dashboard
```
GET    /api/admin/dashboard/stats   - Get dashboard stats
GET    /api/admin/dashboard/charts  - Get chart data
```

#### Leads
```
GET    /api/admin/leads             - List all leads (with filters)
GET    /api/admin/leads/:id         - Get lead details
PATCH  /api/admin/leads/:id         - Update lead
POST   /api/admin/leads/:id/notes   - Add note to lead
POST   /api/admin/leads/:id/activity - Add activity to lead
DELETE /api/admin/leads/:id         - Delete lead
```

#### Robots
```
GET    /api/admin/robots            - List all robots
GET    /api/admin/robots/:id        - Get robot details
POST   /api/admin/robots            - Create robot
PATCH  /api/admin/robots/:id        - Update robot
DELETE /api/admin/robots/:id        - Delete robot
POST   /api/admin/robots/:id/images - Upload images
```

#### Quotes
```
GET    /api/admin/quotes            - List all quotes
GET    /api/admin/quotes/:id        - Get quote details
POST   /api/admin/quotes            - Create quote
PATCH  /api/admin/quotes/:id        - Update quote
POST   /api/admin/quotes/:id/send   - Send quote to customer
POST   /api/admin/quotes/:id/pdf    - Generate PDF
DELETE /api/admin/quotes/:id        - Delete quote
```

#### Demos
```
GET    /api/admin/demos             - List all demos
GET    /api/admin/demos/:id         - Get demo details
PATCH  /api/admin/demos/:id         - Update demo
POST   /api/admin/demos/:id/complete - Complete demo
POST   /api/admin/demos/:id/cancel  - Cancel demo
POST   /api/admin/demos/:id/follow-up - Send follow-up
```

#### Analytics
```
GET    /api/admin/analytics/overview - Analytics overview
GET    /api/admin/analytics/funnel  - Conversion funnel
GET    /api/admin/analytics/robots  - Robot popularity
GET    /api/admin/analytics/sources - Traffic sources
```

---

## 4. MATCHING ALGORITHM

### Algorithm Approach

Using **Anthropic Claude API** for intelligent robot recommendations.

#### Scoring Factors (0-100 points)

**1. Industry Match (30 points)**
- Exact match: 30 points
- Related industry: 15 points
- Robot not suited: 0 points

**2. Use Case Match (40 points)**
- All use cases covered: 40 points
- Most use cases covered: 30 points
- Some use cases covered: 15 points
- Few/no match: 0 points

**3. Venue Suitability (15 points)**
- Floors: Multi-floor capable if needed (5 points)
- Size: Robot capacity matches venue size (5 points)
- Guest volume: Robot throughput matches needs (5 points)

**4. Budget Alignment (10 points)**
- Within budget: 10 points
- Slightly over budget: 5 points
- Way over budget: 0 points

**5. Priority Alignment (5 points)**
- Matches top priorities: 5 points
- Matches some priorities: 3 points
- Doesn't match priorities: 0 points

#### Implementation

```typescript
// lib/ai/matching-algorithm.ts

interface MatchingInput {
  assessment: Assessment;
  robots: Robot[];
}

interface MatchResult {
  robotId: string;
  score: number; // 0-100
  matchPercentage: number;
  reasons: string[];
  pros: string[];
  cons: string[];
}

async function matchRobots(input: MatchingInput): Promise<MatchResult[]> {
  // 1. Calculate base scores for each robot
  const baseScores = robots.map(robot => ({
    robotId: robot.id,
    industryScore: calculateIndustryScore(robot, assessment),
    useCaseScore: calculateUseCaseScore(robot, assessment),
    venueScore: calculateVenueScore(robot, assessment),
    budgetScore: calculateBudgetScore(robot, assessment),
    priorityScore: calculatePriorityScore(robot, assessment),
  }));

  // 2. Use Claude API to refine and explain matches
  const claudePrompt = `
    Analyze these robot matches for a business:

    Business: ${assessment.industry.name}
    Use Cases: ${assessment.useCases.join(', ')}
    Venue: ${assessment.floors} floors, ${assessment.venueSize}, ${assessment.dailyGuests} guests/day
    Budget: ${assessment.budget}
    Top Priorities: ${getTopPriorities(assessment)}

    Robot candidates with base scores:
    ${JSON.stringify(baseScores, null, 2)}

    For each robot, provide:
    1. Refined score (0-100)
    2. Why it's a good match (3-5 reasons)
    3. Pros (3-5 points)
    4. Cons (2-3 points)

    Return top 5 robots ranked by score.
  `;

  const response = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 2000,
    messages: [{ role: 'user', content: claudePrompt }]
  });

  // 3. Parse Claude's response and format results
  const results = parseClaudeResponse(response);

  return results.sort((a, b) => b.score - a.score).slice(0, 5);
}
```

---

## 5. DAY-BY-DAY BUILD TIMELINE

### **Day 1: Foundation & Setup**

**Morning (4 hours)**
- [x] Create PLAN.md and CLAUDE.md
- [ ] Initialize Next.js 14 project with TypeScript
- [ ] Install all dependencies (see below)
- [ ] Set up folder structure
- [ ] Configure Tailwind CSS + shadcn/ui
- [ ] Set up ESLint, Prettier

**Afternoon (4 hours)**
- [ ] Create Prisma schema (all models)
- [ ] Set up PostgreSQL database (Neon)
- [ ] Run initial migration
- [ ] Create seed script with sample robots
- [ ] Set up environment variables
- [ ] Test database connection

**Evening wrap-up**: Core foundation complete, ready to build features

---

### **Day 2: Quiz System (Part 1)**

**Morning (4 hours)**
- [ ] Design quiz UI components:
  - [ ] QuizProgress component
  - [ ] QuizStep wrapper
  - [ ] QuizNavigation (back/next buttons)
- [ ] Build Step 1: Industry Selection
  - [ ] Industry card components
  - [ ] Form validation with Zod
  - [ ] State management

**Afternoon (4 hours)**
- [ ] Build Step 2: Use Cases (multi-select)
- [ ] Build Step 3: Venue Details
- [ ] Implement localStorage auto-save
- [ ] Add form animations (Framer Motion)
- [ ] Mobile responsive styling

**Evening wrap-up**: 3/5 quiz steps complete

---

### **Day 3: Quiz System (Part 2) & Matching**

**Morning (4 hours)**
- [ ] Build Step 4: Priorities (rating system)
- [ ] Build Step 5: Budget & Timeline
- [ ] Build Step 6: Contact Info (optional)
- [ ] Implement quiz submission API
- [ ] Store assessment in database

**Afternoon (4 hours)**
- [ ] Build matching algorithm:
  - [ ] Base scoring functions
  - [ ] Anthropic Claude API integration
  - [ ] Result parsing and ranking
- [ ] Build Results Page:
  - [ ] Match results display
  - [ ] Top robot showcase (with match %)
  - [ ] Other recommendations
  - [ ] CTAs (quote, demo)

**Evening wrap-up**: Quiz & matching system complete

---

### **Day 4: Robot Pages & Calculators**

**Morning (4 hours)**
- [ ] Build robot catalog page:
  - [ ] Grid layout
  - [ ] Filtering (industry, type, price)
  - [ ] Sorting
  - [ ] Robot cards
- [ ] Build individual robot page:
  - [ ] Hero section with gallery
  - [ ] Tabbed interface
  - [ ] Overview tab
  - [ ] Specifications tab

**Afternoon (4 hours)**
- [ ] Build calculators:
  - [ ] Finance Calculator component
    - [ ] Quantity selector
    - [ ] Payment term selector
    - [ ] Real-time calculation
  - [ ] ROI Calculator component
    - [ ] Staff cost inputs
    - [ ] Savings calculation
    - [ ] Payback period
- [ ] Build Use Cases tab
- [ ] Build Pricing & Finance tab

**Evening wrap-up**: Robot browsing experience complete

---

### **Day 5: Quote & Demo Systems**

**Morning (4 hours)**
- [ ] Build quote request system:
  - [ ] Multi-step form
  - [ ] Robot & quantity selection
  - [ ] Finance terms
  - [ ] Customer details
  - [ ] Additional options
  - [ ] Review & submit
- [ ] Create quote submission API
- [ ] Store quote in database

**Afternoon (4 hours)**
- [ ] Build PDF quote generator:
  - [ ] Professional layout design
  - [ ] Dynamic data rendering
  - [ ] Save to file system
  - [ ] Generate download link
- [ ] Build demo booking system:
  - [ ] Booking form
  - [ ] Calendar availability
  - [ ] Time slot selection
  - [ ] Confirmation page
- [ ] Create demo submission API

**Evening wrap-up**: Lead capture systems complete

---

### **Day 6: Email Automation & Admin (Part 1)**

**Morning (4 hours)**
- [ ] Set up Resend email service
- [ ] Create email templates:
  - [ ] Quote sent email (with PDF)
  - [ ] Demo confirmation
  - [ ] Demo reminder (24h before)
  - [ ] Demo follow-up
- [ ] Implement email sending functions
- [ ] Test email delivery

**Afternoon (4 hours)**
- [ ] Build admin authentication:
  - [ ] Login page
  - [ ] Password hashing (bcrypt)
  - [ ] Session management
  - [ ] Protected routes
- [ ] Build admin layout:
  - [ ] Sidebar navigation
  - [ ] Header with logout
  - [ ] Mobile responsive

**Evening wrap-up**: Email automation working, admin access ready

---

### **Day 7: Admin Dashboard**

**Morning (4 hours)**
- [ ] Build dashboard home:
  - [ ] Stats cards (leads, quotes, demos, sales)
  - [ ] Conversion funnel chart
  - [ ] Leads over time chart
  - [ ] Popular robots chart
- [ ] Build lead management:
  - [ ] Lead list table
  - [ ] Filtering and sorting
  - [ ] Lead detail modal
  - [ ] Timeline of activities
  - [ ] Notes section
  - [ ] Status updater

**Afternoon (4 hours)**
- [ ] Build quote management:
  - [ ] Quote list
  - [ ] Quote details
  - [ ] PDF download
  - [ ] Send quote
  - [ ] Track views
- [ ] Build demo management:
  - [ ] Demo list
  - [ ] Calendar view
  - [ ] Demo details
  - [ ] Completion form
  - [ ] Follow-up actions

**Evening wrap-up**: Core admin features complete

---

### **Day 8: Polish, SEO & Deploy**

**Morning (4 hours)**
- [ ] Build remaining public pages:
  - [ ] About page
  - [ ] Contact page
  - [ ] Industry landing pages
  - [ ] Privacy policy
  - [ ] Terms & conditions
- [ ] SEO optimization:
  - [ ] Meta tags on all pages
  - [ ] Open Graph tags
  - [ ] JSON-LD schema markup
  - [ ] Sitemap generation
  - [ ] robots.txt

**Afternoon (4 hours)**
- [ ] Final polish:
  - [ ] Mobile responsiveness check
  - [ ] Loading states everywhere
  - [ ] Error handling
  - [ ] 404 page
  - [ ] Success messages
  - [ ] Form validation messages
- [ ] Performance optimization:
  - [ ] Image optimization
  - [ ] Code splitting
  - [ ] Lazy loading
- [ ] Testing:
  - [ ] Quiz flow end-to-end
  - [ ] Quote request
  - [ ] Demo booking
  - [ ] Admin CRUD operations

**Evening (2 hours)**
- [ ] Deploy to Vercel:
  - [ ] Environment variables
  - [ ] Database migration
  - [ ] Domain configuration
- [ ] Seed production database:
  - [ ] Real robot data (Pudu, Keenon)
  - [ ] Sample case studies
  - [ ] Email templates
- [ ] Final smoke tests

**Evening wrap-up**: 🚀 LIVE!

---

## 6. DEPENDENCIES

### Core Dependencies

```json
{
  "dependencies": {
    "next": "^14.2.0",
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "typescript": "^5.4.0",

    // Database
    "@prisma/client": "^5.14.0",

    // UI
    "tailwindcss": "^3.4.0",
    "@radix-ui/react-*": "latest", // (via shadcn/ui)
    "lucide-react": "^0.378.0",
    "framer-motion": "^11.2.0",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.1",
    "tailwind-merge": "^2.3.0",

    // Forms
    "react-hook-form": "^7.51.0",
    "@hookform/resolvers": "^3.3.4",
    "zod": "^3.23.0",

    // AI
    "@anthropic-ai/sdk": "^0.20.0",

    // Email
    "resend": "^3.2.0",
    "@react-email/components": "^0.0.17",
    "react-email": "^2.1.0",

    // PDF Generation
    "@react-pdf/renderer": "^3.4.0",
    // OR
    "puppeteer": "^22.0.0",

    // Authentication
    "bcryptjs": "^2.4.3",
    "jose": "^5.2.0", // For JWT

    // Data Visualization
    "recharts": "^2.12.0",
    "@tanstack/react-table": "^8.16.0",

    // Date handling
    "date-fns": "^3.6.0",

    // Utilities
    "nanoid": "^5.0.0"
  },
  "devDependencies": {
    "prisma": "^5.14.0",
    "@types/node": "^20.12.0",
    "@types/react": "^18.3.0",
    "@types/bcryptjs": "^2.4.6",
    "eslint": "^8.57.0",
    "eslint-config-next": "^14.2.0",
    "prettier": "^3.2.0",
    "prettier-plugin-tailwindcss": "^0.5.14"
  }
}
```

---

## 7. ENVIRONMENT VARIABLES

```bash
# .env.example

# Database
DATABASE_URL="postgresql://user:password@host:5432/roboselect"

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NODE_ENV="development"

# Anthropic AI
ANTHROPIC_API_KEY="sk-ant-..."

# Email (Resend)
RESEND_API_KEY="re_..."
RESEND_FROM_EMAIL="quotes@roboselect.co.uk"

# Admin Authentication
ADMIN_JWT_SECRET="" # Generate with: openssl rand -base64 32
SESSION_COOKIE_NAME="roboselect-admin-session"

# File Upload (optional - can use Vercel Blob later)
# BLOB_READ_WRITE_TOKEN="vercel_blob_..."

# Analytics (optional)
NEXT_PUBLIC_GA_MEASUREMENT_ID="G-..."

# Google Maps (for demo addresses)
GOOGLE_MAPS_API_KEY="..."
```

---

## 8. KEY FEATURES DETAILS

### 8.1 Quiz Autosave
- Save to localStorage after each step
- Restore on page reload
- Clear on submission
- 7-day expiry

### 8.2 Finance Calculator
- Real-time calculation as user adjusts inputs
- Show monthly payment prominently
- Calculate total interest paid
- Compare payment options side-by-side

### 8.3 ROI Calculator
- Input: Current staff hourly rate × hours saved per day
- Calculate: Annual savings
- Compare: Savings vs. robot cost
- Output: Payback period in months
- Downloadable ROI report (PDF)

### 8.4 Email Automation Triggers

**Quote Sent**
- Immediate: Welcome + PDF attachment
- Day 2: Follow-up (did you have questions?)
- Day 5: Check-in (reminder)
- Day 7: Last call (offer expires)

**Demo Booked**
- Immediate: Confirmation + calendar invite
- 24 hours before: Reminder
- 1 hour before: "We're on our way"
- Next day: Follow-up + link to request quote

**Quiz Completed** (if email provided)
- Immediate: Results summary + top 3 robots
- Day 2: More details about #1 recommendation
- Day 7: Case study relevant to their industry

### 8.5 Admin Dashboard Metrics

**Overview Cards**
- This week's leads (with % change from last week)
- Quotes sent (with conversion rate)
- Demos scheduled (with completion rate)
- Pipeline value (total £ of open quotes)

**Charts**
- Conversion funnel (visitors → quiz → quote → demo → sale)
- Leads by source (organic, ad, referral)
- Leads over time (30-day line chart)
- Most popular robots (bar chart)
- Quote-to-sale conversion rate (trend)

**Alerts**
- New lead (real-time notification)
- Demo tomorrow (daily reminder)
- Quote not sent after request (24h delay)
- Demo completed but no follow-up (48h delay)

---

## 9. SEO STRATEGY

### On-Page SEO

**Homepage**
- Title: "Find the Perfect Service Robot for Your Business | RoboSelect UK"
- H1: "Find the Perfect Robot for Your Business in 2 Minutes"
- Meta description with target keywords
- Schema: Organization, WebSite

**Robot Pages**
- Title: "[Robot Name] - [Type] Robot | Pricing & Demo | RoboSelect"
- H1: Robot name
- Schema: Product (with offers, reviews)
- Detailed specs in structured format
- Customer reviews/ratings

**Industry Pages**
- Title: "Best [Industry] Robots in UK | Compare Prices | RoboSelect"
- H1: "Service Robots for [Industry]"
- Schema: CollectionPage
- Industry-specific content
- FAQs

**Case Studies**
- Title: "[Customer Name] Case Study | [Industry] | RoboSelect"
- Schema: Article
- Author markup
- Related robots linked

### Content Strategy (Post-Launch)

**Blog Topics** (for organic traffic):
1. "Complete Guide to Restaurant Delivery Robots in UK (2025)"
2. "Hotel Service Robots: ROI Calculator & Buying Guide"
3. "How Much Do Service Robots Cost? (UK Price Comparison)"
4. "Best Robots for Care Homes: Features, Pricing, Safety"
5. "Pudu vs Keenon: Which Delivery Robot Is Best?"
6. "Service Robot Financing: Options for UK Businesses"
7. "How Service Robots Reduce Labor Costs in Hospitality"
8. "Installing Service Robots: What You Need to Know"
9. "Top 10 Service Robots for UK Restaurants in 2025"
10. "Service Robot Maintenance: Costs & Best Practices"

**Target Keywords**:
- "restaurant robots UK"
- "hotel service robots"
- "delivery robot price"
- "robot for care home"
- "service robot cost UK"
- "buy restaurant robot"
- "Pudu robot price UK"
- "Keenon robot dealer UK"

### Technical SEO

- Sitemap: Auto-generated, submitted to Google
- robots.txt: Allow all (no restrictions)
- Canonical URLs: Prevent duplicate content
- Mobile-first: Perfect mobile experience
- Page speed: <2s load time
- Core Web Vitals: All green
- Structured data: Product, Organization, FAQ
- Internal linking: Related robots, use cases
- Image optimization: WebP, lazy loading, alt text

---

## 10. FUTURE ENHANCEMENTS (Post-MVP)

### Phase 2 (Month 2)
- **Live Chat**: Intercom or Crisp for instant questions
- **Video Testimonials**: Embedded customer videos
- **Comparison Tool**: Side-by-side robot comparison
- **Blog**: Full blog system with CMS
- **Email Sequences**: Advanced drip campaigns
- **SMS Notifications**: Demo reminders via SMS

### Phase 3 (Month 3)
- **Finance Application**: Online finance application form
- **Multi-user Admin**: Team roles and permissions
- **CRM Integration**: HubSpot or Pipedrive integration
- **Inventory Management**: Track robot availability
- **Advanced Analytics**: Google Analytics 4 events
- **A/B Testing**: Experiment with quiz flow

### Phase 4 (Month 4+)
- **Multi-language**: Welsh support
- **Reseller Portal**: For sub-dealers
- **Mobile App**: React Native companion app
- **AI Chatbot**: Anthropic Claude chatbot for questions
- **Virtual Tours**: 3D robot viewers
- **Customer Portal**: Existing customers log in

---

## 11. SUCCESS TRACKING

### Key Metrics to Monitor (Weekly)

**Traffic**
- Unique visitors
- Traffic sources (organic, direct, referral, ad)
- Most visited pages
- Average session duration
- Bounce rate

**Conversion Funnel**
- Homepage → Quiz start: X%
- Quiz start → Quiz complete: X%
- Quiz complete → Quote request: X%
- Quiz complete → Demo request: X%
- Quote sent → Quote accepted: X%
- Demo completed → Sale: X%

**Lead Quality**
- Leads per week
- Qualified leads (with budget + timeline)
- Response rate to follow-ups
- Average deal size
- Sales cycle length

**Revenue Pipeline**
- Total pipeline value (open quotes)
- Average quote value
- Conversion rate (quote → sale)
- Monthly revenue
- ROI (ad spend vs revenue)

### Success Targets (3 Months)

- **10+ qualified leads per week**
- **20% quiz → quote conversion**
- **10% quiz → demo conversion**
- **5% demo → sale conversion**
- **£50k+ monthly pipeline value**
- **Page 1 ranking for 5+ target keywords**
- **<2 second page load times**
- **4.5+ star average customer rating**

---

## 12. LAUNCH CHECKLIST

### Pre-Launch

- [ ] All quiz steps working perfectly
- [ ] Matching algorithm returning good results
- [ ] Quote PDF generation working
- [ ] Demo booking confirmation emails sending
- [ ] Admin dashboard fully functional
- [ ] All robots seeded with real data (photos, specs, pricing)
- [ ] 3-5 case studies published
- [ ] Privacy policy & terms published
- [ ] Mobile experience tested on iOS & Android
- [ ] Forms have validation and error handling
- [ ] 404 page exists
- [ ] Favicon and meta images set
- [ ] Google Analytics connected
- [ ] Google Search Console verified
- [ ] Sitemap submitted

### Launch Day

- [ ] Deploy to production (Vercel)
- [ ] Verify all environment variables set
- [ ] Run database migrations
- [ ] Test end-to-end: quiz → quote → email
- [ ] Test demo booking flow
- [ ] Test admin login
- [ ] Monitor error logs (Vercel logs)
- [ ] Test on real devices (phone, tablet, laptop)

### Week 1 Post-Launch

- [ ] Monitor email deliverability
- [ ] Check for JavaScript errors
- [ ] Review initial analytics data
- [ ] Respond to any leads immediately
- [ ] Fix any bugs discovered
- [ ] Get feedback from first users
- [ ] Run Lighthouse audit
- [ ] Check mobile usability in Search Console

---

## 13. BUSINESS PROCESS (AFTER LEAD COMES IN)

### Automated (by platform)
1. Lead completes quiz → Assessment saved
2. Match results shown → Lead data captured
3. Lead requests quote → Quote generated + PDF emailed
4. Lead books demo → Confirmation email sent + calendar invite
5. 24h before demo → Reminder email sent
6. After demo → Follow-up email sent

### Manual (by you)
1. Check admin dashboard daily for new leads
2. Review lead details (quiz responses, interest level)
3. Call lead within 24 hours to qualify
4. Confirm demo details (date, time, address)
5. Conduct demo at customer location
6. After demo: Update status in admin, add notes
7. If interested: Send detailed quote
8. Follow up via phone/email until decision made
9. If sale: Mark as WON, record details
10. If no sale: Mark as LOST or NURTURE, note reason

### Expected Timeline (per lead)
- **Day 0**: Lead comes in via quiz/quote/demo
- **Day 1**: You call to qualify and confirm interest
- **Day 2-7**: Demo scheduled and conducted
- **Day 7-14**: Quote sent and follow-up calls
- **Day 14-28**: Negotiation and decision
- **Week 4-6**: Sale closed OR lead marked as lost/nurture

---

## 14. NOTES & TIPS

### Development Best Practices
- **Commit often**: After each feature, commit with clear message
- **Test on mobile**: 60% of traffic will be mobile
- **Use TypeScript strictly**: No `any` types
- **Validate all inputs**: Zod schemas for all forms
- **Error handling**: Try-catch blocks in all API routes
- **Loading states**: Show spinners during async operations
- **Optimistic UI**: Update UI before API confirms

### UX Considerations
- **Quiz**: Make it fun, visual, and fast
- **Trust signals**: Show logos, testimonials, reviews prominently
- **Clear CTAs**: Every page should have obvious next step
- **Social proof**: "X businesses have found their robot"
- **Urgency**: "Limited demo slots available this month"
- **Simplicity**: Don't overwhelm with too much info

### Business Considerations
- **Mobile-first**: Most decision-makers browse on phone first
- **Speed matters**: Slow site = lost leads
- **Professional design**: Builds trust for £15k purchase
- **Follow up fast**: Call within 24h of lead submission
- **Qualify hard**: Focus time on serious buyers only
- **Demo prep**: Arrive early, be professional, wow them

---

**Ready to build!** 🚀

This plan should give us a clear path to building a high-quality, lead-generating platform for your robot reselling business. We'll move methodically through each phase, testing as we go, and have a polished product ready within 8 days.

The key to success will be:
1. **Great quiz experience** (smooth, engaging, fast)
2. **Smart matching** (Claude AI recommendations)
3. **Professional presentation** (design builds trust)
4. **Efficient admin** (easy for you to manage leads)
5. **Fast follow-up** (automated emails + your quick calls)

Let's start building! 🤖
