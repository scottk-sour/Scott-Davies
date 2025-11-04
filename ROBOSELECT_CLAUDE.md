# ROBOSELECT_CLAUDE.md - Development Guide for RoboSelect

**Project**: RoboSelect - Smart Robot Recommendation & Lead Generation Platform
**Purpose**: Guidelines for AI assistants working on this project
**Last Updated**: 2025-11-03

---

## TECH STACK

### Core Technologies
- **Framework**: Next.js 14.2+ (App Router)
- **Language**: TypeScript 5.0+ (strict mode)
- **Database**: PostgreSQL + Prisma ORM
- **Styling**: Tailwind CSS 3.4+
- **UI Components**: shadcn/ui (Radix UI primitives)
- **Icons**: Lucide React
- **Animations**: Framer Motion
- **AI**: Anthropic Claude API
- **Email**: Resend + React Email
- **PDF**: @react-pdf/renderer
- **Charts**: Recharts
- **Tables**: TanStack Table
- **Forms**: React Hook Form + Zod validation
- **Deployment**: Vercel

---

## PROJECT STRUCTURE

```
roboselect/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── (public)/                 # Public routes (no auth)
│   │   │   ├── page.tsx              # Homepage
│   │   │   ├── layout.tsx            # Public layout
│   │   │   ├── quiz/
│   │   │   │   ├── page.tsx          # Needs assessment quiz
│   │   │   │   └── layout.tsx
│   │   │   ├── results/[id]/
│   │   │   │   └── page.tsx          # Quiz results with matches
│   │   │   ├── robots/
│   │   │   │   ├── page.tsx          # Robot catalog
│   │   │   │   └── [slug]/
│   │   │   │       └── page.tsx      # Individual robot page
│   │   │   ├── industries/[slug]/
│   │   │   │   └── page.tsx          # Industry landing pages
│   │   │   ├── case-studies/
│   │   │   │   ├── page.tsx          # Case studies list
│   │   │   │   └── [slug]/
│   │   │   │       └── page.tsx      # Individual case study
│   │   │   ├── about/
│   │   │   │   └── page.tsx
│   │   │   ├── contact/
│   │   │   │   └── page.tsx
│   │   │   ├── privacy/
│   │   │   │   └── page.tsx
│   │   │   └── terms/
│   │   │       └── page.tsx
│   │   ├── (admin)/                  # Protected admin routes
│   │   │   ├── layout.tsx            # Admin layout with sidebar
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx          # Admin dashboard home
│   │   │   ├── leads/
│   │   │   │   ├── page.tsx          # Lead list
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx      # Lead details
│   │   │   ├── robots/
│   │   │   │   ├── page.tsx          # Robot management
│   │   │   │   ├── new/
│   │   │   │   │   └── page.tsx      # Create robot
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx      # Edit robot
│   │   │   ├── quotes/
│   │   │   │   ├── page.tsx          # Quote list
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx      # Quote details
│   │   │   ├── demos/
│   │   │   │   ├── page.tsx          # Demo calendar/list
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx      # Demo details
│   │   │   └── analytics/
│   │   │       └── page.tsx          # Analytics dashboard
│   │   ├── api/                      # API routes
│   │   │   ├── quiz/
│   │   │   │   ├── start/route.ts
│   │   │   │   ├── save/route.ts
│   │   │   │   ├── submit/route.ts
│   │   │   │   └── match/route.ts    # Matching algorithm
│   │   │   ├── robots/
│   │   │   │   ├── route.ts
│   │   │   │   └── [slug]/route.ts
│   │   │   ├── industries/
│   │   │   │   ├── route.ts
│   │   │   │   └── [slug]/route.ts
│   │   │   ├── quotes/
│   │   │   │   ├── request/route.ts
│   │   │   │   ├── calculate/route.ts
│   │   │   │   └── [id]/
│   │   │   │       ├── pdf/route.ts
│   │   │   │       └── track/route.ts
│   │   │   ├── demos/
│   │   │   │   ├── request/route.ts
│   │   │   │   └── availability/route.ts
│   │   │   ├── case-studies/
│   │   │   │   ├── route.ts
│   │   │   │   └── [slug]/route.ts
│   │   │   ├── contact/route.ts
│   │   │   └── admin/
│   │   │       ├── auth/
│   │   │       │   ├── login/route.ts
│   │   │       │   ├── logout/route.ts
│   │   │       │   └── session/route.ts
│   │   │       ├── dashboard/
│   │   │       │   ├── stats/route.ts
│   │   │       │   └── charts/route.ts
│   │   │       ├── leads/
│   │   │       │   ├── route.ts
│   │   │       │   └── [id]/route.ts
│   │   │       ├── robots/
│   │   │       │   ├── route.ts
│   │   │       │   └── [id]/route.ts
│   │   │       ├── quotes/
│   │   │       │   ├── route.ts
│   │   │       │   └── [id]/route.ts
│   │   │       ├── demos/
│   │   │       │   ├── route.ts
│   │   │       │   └── [id]/route.ts
│   │   │       └── analytics/
│   │   │           └── route.ts
│   │   ├── layout.tsx                # Root layout
│   │   └── globals.css               # Global styles + Tailwind
│   ├── components/
│   │   ├── ui/                       # shadcn/ui components
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── input.tsx
│   │   │   ├── select.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── tabs.tsx
│   │   │   └── ...
│   │   ├── quiz/                     # Quiz components
│   │   │   ├── QuizProgress.tsx
│   │   │   ├── QuizStep1Industry.tsx
│   │   │   ├── QuizStep2UseCases.tsx
│   │   │   ├── QuizStep3VenueDetails.tsx
│   │   │   ├── QuizStep4Priorities.tsx
│   │   │   ├── QuizStep5Budget.tsx
│   │   │   ├── QuizStep6Contact.tsx
│   │   │   ├── QuizNavigation.tsx
│   │   │   └── QuizSummary.tsx
│   │   ├── robots/                   # Robot components
│   │   │   ├── RobotCard.tsx
│   │   │   ├── RobotGrid.tsx
│   │   │   ├── RobotGallery.tsx
│   │   │   ├── RobotSpecs.tsx
│   │   │   ├── RobotTabs.tsx
│   │   │   ├── FinanceCalculator.tsx
│   │   │   ├── ROICalculator.tsx
│   │   │   ├── RelatedRobots.tsx
│   │   │   └── MatchBadge.tsx
│   │   ├── results/                  # Quiz results components
│   │   │   ├── MatchResults.tsx
│   │   │   ├── TopRobotMatch.tsx
│   │   │   ├── OtherMatches.tsx
│   │   │   └── WhyRecommended.tsx
│   │   ├── quotes/                   # Quote components
│   │   │   ├── QuoteRequestForm.tsx
│   │   │   ├── QuoteStep1Robot.tsx
│   │   │   ├── QuoteStep2Terms.tsx
│   │   │   ├── QuoteStep3Details.tsx
│   │   │   ├── QuoteStep4Options.tsx
│   │   │   ├── QuoteStep5Review.tsx
│   │   │   └── QuotePDF.tsx
│   │   ├── demos/                    # Demo booking components
│   │   │   ├── DemoBookingForm.tsx
│   │   │   ├── DatePicker.tsx
│   │   │   ├── TimeSlotSelector.tsx
│   │   │   └── DemoConfirmation.tsx
│   │   ├── case-studies/             # Case study components
│   │   │   ├── CaseStudyCard.tsx
│   │   │   ├── CaseStudyGrid.tsx
│   │   │   └── CaseStudyDetail.tsx
│   │   ├── admin/                    # Admin dashboard components
│   │   │   ├── AdminSidebar.tsx
│   │   │   ├── AdminHeader.tsx
│   │   │   ├── StatsCard.tsx
│   │   │   ├── ConversionFunnel.tsx
│   │   │   ├── LeadsChart.tsx
│   │   │   ├── LeadTable.tsx
│   │   │   ├── LeadDetailModal.tsx
│   │   │   ├── QuoteTable.tsx
│   │   │   ├── DemoCalendar.tsx
│   │   │   ├── DemoList.tsx
│   │   │   └── RobotForm.tsx
│   │   ├── layout/                   # Layout components
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── Navigation.tsx
│   │   │   └── MobileMenu.tsx
│   │   └── shared/                   # Shared/common components
│   │       ├── Logo.tsx
│   │       ├── LoadingSpinner.tsx
│   │       ├── LoadingSkeleton.tsx
│   │       ├── ErrorMessage.tsx
│   │       ├── EmptyState.tsx
│   │       ├── Breadcrumbs.tsx
│   │       └── SEO.tsx
│   ├── lib/
│   │   ├── db/
│   │   │   └── prisma.ts             # Prisma client singleton
│   │   ├── ai/
│   │   │   ├── anthropic.ts          # Claude API client
│   │   │   └── matching-algorithm.ts # Robot matching logic
│   │   ├── auth/
│   │   │   ├── session.ts            # Session management
│   │   │   ├── hash.ts               # Password hashing
│   │   │   └── middleware.ts         # Auth middleware
│   │   ├── email/
│   │   │   ├── resend.ts             # Resend client
│   │   │   ├── send.ts               # Email sending functions
│   │   │   └── templates/            # Email templates
│   │   │       ├── QuoteSent.tsx
│   │   │       ├── DemoConfirmation.tsx
│   │   │       ├── DemoReminder.tsx
│   │   │       └── DemoFollowUp.tsx
│   │   ├── pdf/
│   │   │   └── quote-generator.ts    # PDF generation
│   │   ├── pricing/
│   │   │   ├── calculator.ts         # Pricing calculations
│   │   │   └── finance.ts            # Finance calculations
│   │   ├── validations/
│   │   │   ├── quiz.ts               # Quiz Zod schemas
│   │   │   ├── quote.ts              # Quote Zod schemas
│   │   │   ├── demo.ts               # Demo Zod schemas
│   │   │   └── robot.ts              # Robot Zod schemas
│   │   ├── utils/
│   │   │   ├── cn.ts                 # Class name utility
│   │   │   ├── format.ts             # Formatting utilities
│   │   │   └── storage.ts            # localStorage helpers
│   │   ├── constants.ts              # App constants
│   │   └── api.ts                    # API client utilities
│   ├── types/
│   │   ├── database.ts               # Database types (from Prisma)
│   │   ├── quiz.ts                   # Quiz types
│   │   ├── robot.ts                  # Robot types
│   │   ├── quote.ts                  # Quote types
│   │   ├── demo.ts                   # Demo types
│   │   ├── lead.ts                   # Lead types
│   │   └── api.ts                    # API response types
│   └── hooks/
│       ├── useQuizState.ts           # Quiz state management
│       ├── useLocalStorage.ts        # localStorage hook
│       ├── useRobots.ts              # Fetch robots
│       ├── useQuote.ts               # Quote management
│       └── useDemo.ts                # Demo booking
├── prisma/
│   ├── schema.prisma                 # Database schema
│   ├── migrations/                   # Migration history
│   └── seed.ts                       # Database seeding
├── public/
│   ├── robots/                       # Robot images
│   │   ├── bellabot/
│   │   ├── kettybot/
│   │   └── ...
│   ├── case-studies/                 # Case study images
│   ├── logos/                        # Brand logos
│   └── favicon.ico
├── .env.local                        # Local environment variables
├── .env.example                      # Example env file
├── .gitignore
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
├── postcss.config.js
├── package.json
├── ROBOSELECT_PLAN.md               # This file
├── ROBOSELECT_CLAUDE.md             # This file
└── README.md
```

---

## CODING CONVENTIONS

### TypeScript

**Always use strict TypeScript**
```typescript
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitAny": true,
    "strictNullChecks": true
  }
}
```

**Prefer types over interfaces**
```typescript
// Good
type Robot = {
  id: string;
  name: string;
  manufacturer: Manufacturer;
};

// Use interfaces for extensible objects
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
```

**Use Zod for all validation**
```typescript
import { z } from 'zod';

// Define schema
const quizStep1Schema = z.object({
  industryId: z.string().min(1, 'Please select an industry'),
});

// Infer TypeScript type from schema
type QuizStep1 = z.infer<typeof quizStep1Schema>;

// Validate
const result = quizStep1Schema.safeParse(data);
if (!result.success) {
  return { error: result.error.flatten() };
}
```

---

### React Components

**Use Server Components by default**
```typescript
// app/robots/page.tsx
// Server Component (default in App Router)
import { prisma } from '@/lib/db/prisma';

export default async function RobotsPage() {
  const robots = await prisma.robot.findMany({
    where: { active: true },
    include: { manufacturer: true },
  });

  return <RobotGrid robots={robots} />;
}
```

**Mark Client Components with 'use client'**
```typescript
// components/quiz/QuizStep1Industry.tsx
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

export function QuizStep1Industry({ onNext }: Props) {
  const [selected, setSelected] = useState<string | null>(null);
  // Client-side interactivity
}
```

**Component structure**
```typescript
// 1. Imports (grouped)
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils/cn';
import type { Robot } from '@/types/robot';

// 2. Type definitions
type RobotCardProps = {
  robot: Robot;
  matchScore?: number;
  onSelect?: (robotId: string) => void;
};

// 3. Component
export function RobotCard({ robot, matchScore, onSelect }: RobotCardProps) {
  // 3a. Hooks
  const [isHovered, setIsHovered] = useState(false);

  // 3b. Derived values
  const formattedPrice = formatPrice(robot.priceUpfront);

  // 3c. Event handlers
  const handleClick = () => {
    onSelect?.(robot.id);
  };

  // 3d. Render
  return (
    <motion.div
      className={cn('rounded-lg border p-4', {
        'border-primary': matchScore && matchScore > 80,
      })}
      whileHover={{ scale: 1.02 }}
      onClick={handleClick}
    >
      {/* Content */}
    </motion.div>
  );
}
```

**Props naming**
```typescript
// ✅ Good: Descriptive prop names
type RobotCardProps = {
  robot: Robot;
  matchScore?: number;
  showPrice?: boolean;
  onSelect?: (id: string) => void;
};

// ❌ Bad: Unclear prop names
type Props = {
  data: any;
  score: number;
  fn: Function;
};
```

---

### File Naming

```
Components:       PascalCase.tsx     (RobotCard.tsx)
Utilities:        kebab-case.ts      (matching-algorithm.ts)
Pages:            page.tsx           (app/robots/page.tsx)
Layouts:          layout.tsx         (app/layout.tsx)
API Routes:       route.ts           (app/api/robots/route.ts)
Types:            kebab-case.ts      (types/robot.ts)
Hooks:            camelCase.ts       (hooks/useRobots.ts)
```

---

### API Routes

**Standard response format**
```typescript
// lib/api.ts
export type ApiSuccess<T> = {
  success: true;
  data: T;
};

export type ApiError = {
  success: false;
  error: {
    message: string;
    code?: string;
    details?: unknown;
  };
};

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

// Helper functions
export function successResponse<T>(data: T): Response {
  return NextResponse.json({ success: true, data });
}

export function errorResponse(
  message: string,
  status = 400,
  code?: string
): Response {
  return NextResponse.json(
    {
      success: false,
      error: { message, code },
    },
    { status }
  );
}
```

**API route structure**
```typescript
// app/api/robots/route.ts
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { successResponse, errorResponse } from '@/lib/api';

export async function GET(req: NextRequest) {
  try {
    // 1. Parse and validate query params
    const { searchParams } = new URL(req.url);
    const industrySlug = searchParams.get('industry');

    // 2. Query database
    const robots = await prisma.robot.findMany({
      where: {
        active: true,
        ...(industrySlug && {
          industries: {
            some: {
              industry: { slug: industrySlug },
            },
          },
        }),
      },
      include: {
        manufacturer: true,
        industries: { include: { industry: true } },
      },
    });

    // 3. Return success response
    return successResponse(robots);
  } catch (error) {
    // 4. Handle errors
    console.error('Error fetching robots:', error);
    return errorResponse('Failed to fetch robots', 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    // 1. Parse body
    const body = await req.json();

    // 2. Validate with Zod
    const schema = z.object({
      name: z.string().min(1),
      manufacturerId: z.string(),
      priceUpfront: z.number().positive(),
    });

    const validated = schema.parse(body);

    // 3. Create in database
    const robot = await prisma.robot.create({
      data: validated,
    });

    // 4. Return success
    return successResponse(robot);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return errorResponse('Validation failed', 400, 'VALIDATION_ERROR');
    }
    console.error('Error creating robot:', error);
    return errorResponse('Failed to create robot', 500);
  }
}
```

**Protected admin routes**
```typescript
// app/api/admin/leads/route.ts
import { getSession } from '@/lib/auth/session';

export async function GET(req: NextRequest) {
  // 1. Check authentication
  const session = await getSession(req);
  if (!session) {
    return errorResponse('Unauthorized', 401, 'UNAUTHORIZED');
  }

  // 2. Check authorization (optional - if you have roles)
  if (session.user.role !== 'ADMIN') {
    return errorResponse('Forbidden', 403, 'FORBIDDEN');
  }

  // 3. Proceed with logic
  const leads = await prisma.lead.findMany();
  return successResponse(leads);
}
```

---

### Database Patterns

**Prisma Client as singleton**
```typescript
// lib/db/prisma.ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
```

**Efficient queries**
```typescript
// ✅ Good: Select only needed fields
const robots = await prisma.robot.findMany({
  select: {
    id: true,
    name: true,
    slug: true,
    thumbnail: true,
    priceUpfront: true,
    manufacturer: {
      select: {
        name: true,
        logo: true,
      },
    },
  },
  where: { active: true },
});

// ❌ Bad: Fetch all fields (wasteful)
const robots = await prisma.robot.findMany({
  include: {
    manufacturer: true,
    industries: true,
    types: true,
    useCases: true,
  },
});
```

**Use transactions for related operations**
```typescript
await prisma.$transaction(async (tx) => {
  // Create lead
  const lead = await tx.lead.create({
    data: { email, status: 'NEW' },
  });

  // Create assessment
  await tx.assessment.create({
    data: {
      leadId: lead.id,
      industryId,
      useCases,
      budget,
    },
  });

  // Create activity
  await tx.leadActivity.create({
    data: {
      leadId: lead.id,
      type: 'QUIZ_COMPLETED',
      description: 'Completed needs assessment quiz',
    },
  });
});
```

**Proper indexing**
```prisma
model Robot {
  // ...

  @@index([slug])
  @@index([featured, active])
  @@index([manufacturerId])
}

model Lead {
  // ...

  @@index([email])
  @@index([status])
  @@index([createdAt])
}
```

---

### Form Handling

**Using React Hook Form + Zod**
```typescript
// components/quotes/QuoteRequestForm.tsx
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const quoteRequestSchema = z.object({
  robotId: z.string().min(1, 'Please select a robot'),
  quantity: z.coerce.number().min(1).max(10),
  financeTerm: z.enum(['upfront', '2-year', '3-year', '5-year']),
  customerName: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
  phone: z.string().optional(),
  companyName: z.string().optional(),
});

type QuoteRequestForm = z.infer<typeof quoteRequestSchema>;

export function QuoteRequestForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<QuoteRequestForm>({
    resolver: zodResolver(quoteRequestSchema),
  });

  const onSubmit = async (data: QuoteRequestForm) => {
    const response = await fetch('/api/quotes/request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (response.ok) {
      // Handle success
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('robotId')} type="hidden" />
      {errors.robotId && <span>{errors.robotId.message}</span>}

      <input {...register('customerName')} placeholder="Your name" />
      {errors.customerName && <span>{errors.customerName.message}</span>}

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Submitting...' : 'Request Quote'}
      </button>
    </form>
  );
}
```

---

### Styling with Tailwind

**Use cn() utility for conditional classes**
```typescript
import { cn } from '@/lib/utils/cn';

<div
  className={cn(
    'rounded-lg border p-4',
    'hover:shadow-lg transition-shadow',
    {
      'border-primary bg-primary/10': isSelected,
      'border-muted': !isSelected,
    }
  )}
>
```

**Consistent spacing**
```typescript
// Use Tailwind's spacing scale consistently
<div className="space-y-6">       {/* 24px between children */}
  <h1 className="text-3xl font-bold mb-2">Title</h1>
  <p className="text-muted-foreground">Description</p>
</div>
```

**Mobile-first responsive**
```typescript
// ✅ Good: Mobile first, then larger screens
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

// ❌ Bad: Desktop first
<div className="grid-cols-3 lg:grid-cols-2 md:grid-cols-1">
```

---

### Error Handling

**Global error boundary**
```typescript
// app/error.tsx
'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold">Something went wrong!</h2>
        <p className="text-muted-foreground">{error.message}</p>
        <button onClick={reset} className="mt-4">
          Try again
        </button>
      </div>
    </div>
  );
}
```

**Try-catch in async functions**
```typescript
async function fetchRobots() {
  try {
    const response = await fetch('/api/robots');
    if (!response.ok) {
      throw new Error('Failed to fetch robots');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching robots:', error);
    throw error; // Re-throw to be handled by caller
  }
}
```

---

### Performance Optimization

**Image optimization**
```typescript
import Image from 'next/image';

<Image
  src={robot.thumbnail}
  alt={robot.name}
  width={400}
  height={300}
  className="rounded-lg object-cover"
  loading="lazy"
/>
```

**Lazy load client components**
```typescript
import dynamic from 'next/dynamic';

const FinanceCalculator = dynamic(
  () => import('@/components/robots/FinanceCalculator'),
  {
    loading: () => <LoadingSkeleton />,
    ssr: false, // Don't render on server
  }
);
```

**Use Server Components for data fetching**
```typescript
// app/robots/[slug]/page.tsx
// Server Component - no JS sent to client
export default async function RobotPage({ params }: { params: { slug: string } }) {
  const robot = await prisma.robot.findUnique({
    where: { slug: params.slug },
    include: { manufacturer: true, useCases: true },
  });

  if (!robot) notFound();

  return <RobotDetail robot={robot} />;
}
```

---

## COMMON COMMANDS

### Development

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Type check
npm run type-check

# Lint
npm run lint

# Format with Prettier
npm run format
```

### Database

```bash
# Generate Prisma Client (after schema changes)
npx prisma generate

# Create migration
npx prisma migrate dev --name add_robots_table

# Apply migrations (production)
npx prisma migrate deploy

# Reset database (DANGER: deletes all data)
npx prisma migrate reset

# Open Prisma Studio (database GUI)
npx prisma studio

# Seed database
npx prisma db seed
```

### Git

```bash
# Create feature branch
git checkout -b feature/quiz-system

# Commit
git add .
git commit -m "feat: add quiz step 1 industry selection"

# Push
git push origin feature/quiz-system
```

---

## TESTING APPROACH

### Manual Testing Checklist

**Quiz Flow**
- [ ] All 5-6 steps display correctly
- [ ] Form validation works
- [ ] Back button preserves data
- [ ] Progress bar updates
- [ ] Mobile responsive
- [ ] Auto-save to localStorage
- [ ] Submit creates assessment in database
- [ ] Redirect to results page

**Robot Pages**
- [ ] Catalog displays all robots
- [ ] Filters work (industry, type, price)
- [ ] Individual pages load
- [ ] Gallery works
- [ ] Tabs switch correctly
- [ ] Finance calculator calculates correctly
- [ ] ROI calculator works
- [ ] Related robots show

**Quote System**
- [ ] Form validation works
- [ ] Quote saves to database
- [ ] PDF generates correctly
- [ ] Email sends with PDF attachment
- [ ] Customer receives email
- [ ] Admin receives notification

**Demo Booking**
- [ ] Form validation works
- [ ] Date picker works
- [ ] Demo saves to database
- [ ] Confirmation email sends
- [ ] Calendar invite attached

**Admin Dashboard**
- [ ] Login works
- [ ] Dashboard stats show
- [ ] Charts render
- [ ] Lead table loads
- [ ] Lead details show
- [ ] Quote table loads
- [ ] Demo calendar shows
- [ ] CRUD operations work

### E2E Testing (Future)

```bash
# Install Playwright
npm install -D @playwright/test

# Run tests
npx playwright test

# Run in UI mode
npx playwright test --ui
```

---

## DEBUGGING TIPS

### Common Issues

**Prisma Client not found**
```bash
npx prisma generate
```

**Database connection error**
```bash
# Check DATABASE_URL in .env.local
# Test connection
npx prisma db push
```

**TypeScript errors**
```bash
# Check types
npm run type-check

# Regenerate Prisma types
npx prisma generate
```

**API route not found**
```bash
# Check file is named route.ts (not api.ts)
# Restart dev server
```

**Tailwind classes not working**
```bash
# Check tailwind.config.ts content paths
# Restart dev server
```

---

## KEY PRINCIPLES

1. **Type Safety**: Always use TypeScript, never `any`
2. **Validation**: Validate all user input with Zod
3. **Server First**: Use Server Components by default
4. **Mobile First**: Design for mobile, enhance for desktop
5. **Performance**: Optimize images, lazy load, code split
6. **Security**: Validate input, sanitize output, protect routes
7. **Error Handling**: Always handle errors gracefully
8. **User Feedback**: Loading states, error messages, success messages
9. **Accessibility**: Semantic HTML, ARIA labels, keyboard navigation
10. **Consistency**: Follow patterns, use shared components

---

## WHEN TO ASK FOR HELP

1. **Anthropic Claude API**: If matching algorithm isn't returning good results
2. **PDF Generation**: If PDFs aren't rendering correctly
3. **Email Deliverability**: If emails aren't being received
4. **Database Performance**: If queries are slow
5. **Deployment Issues**: If Vercel deployment fails
6. **Design Decisions**: If unsure about UX/UI approach

---

## RESOURCES

- [Next.js Docs](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [shadcn/ui](https://ui.shadcn.com)
- [Framer Motion](https://www.framer.com/motion)
- [Anthropic Claude API](https://docs.anthropic.com)
- [Resend Docs](https://resend.com/docs)
- [React Hook Form](https://react-hook-form.com)
- [Zod](https://zod.dev)

---

**Last Updated**: 2025-11-03
**Version**: 1.0

**Ready to code!** 🚀
