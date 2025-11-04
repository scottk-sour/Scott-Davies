# RoboSelect 🤖

**Smart Robot Recommendation & Lead Generation Platform**

RoboSelect helps UK businesses discover the perfect service robots for their needs through an intelligent 2-minute quiz, while generating high-quality sales leads for robot resellers.

---

## 🎯 Project Overview

RoboSelect is a lead generation platform for a robot reselling business specializing in service robots from manufacturers like Pudu and Keenon. The platform helps businesses in hotels, restaurants, care homes, and other industries find the right robots while automating the sales qualification process.

### Key Features

- **🎯 Smart Quiz**: 2-minute needs assessment with AI-powered matching
- **🤖 Robot Catalog**: Comprehensive robot database with specs, pricing, and use cases
- **💰 Finance Calculator**: Real-time payment calculations for multiple financing terms
- **📊 ROI Calculator**: Instant payback period and savings calculations
- **📧 Quote System**: Automated quote generation with professional PDFs
- **📅 Demo Booking**: Seamless demo scheduling with email automation
- **📈 Admin Dashboard**: Complete lead management and analytics system
- **🎨 Case Studies**: Customer success stories with metrics and testimonials

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database (local or cloud)
- Anthropic API key (for matching algorithm)
- Resend account (for emails)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd roboselect
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```

   Edit `.env.local` and add your credentials:
   ```bash
   DATABASE_URL="postgresql://user:password@localhost:5432/roboselect"
   ANTHROPIC_API_KEY="sk-ant-api03-..."
   RESEND_API_KEY="re_..."
   ADMIN_JWT_SECRET="your-secret-key-here"
   NEXT_PUBLIC_APP_URL="http://localhost:3000"
   ```

4. **Set up the database**
   ```bash
   # Generate Prisma Client
   npx prisma generate

   # Run migrations
   npx prisma migrate dev

   # (Optional) Seed with sample data
   npm run db:seed
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📁 Project Structure

```
roboselect/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (public)/          # Public-facing pages
│   │   │   ├── quiz/          # Needs assessment quiz
│   │   │   ├── results/       # Quiz results with matches
│   │   │   ├── robots/        # Robot catalog & details
│   │   │   ├── industries/    # Industry landing pages
│   │   │   └── case-studies/  # Customer success stories
│   │   ├── (admin)/           # Protected admin pages
│   │   │   ├── dashboard/     # Admin home
│   │   │   ├── leads/         # Lead management
│   │   │   ├── robots/        # Robot CRUD
│   │   │   ├── quotes/        # Quote management
│   │   │   └── demos/         # Demo scheduling
│   │   └── api/               # API routes
│   ├── components/            # React components
│   │   ├── ui/               # shadcn/ui components
│   │   ├── quiz/             # Quiz components
│   │   ├── robots/           # Robot components
│   │   ├── admin/            # Admin components
│   │   └── shared/           # Shared components
│   ├── lib/                  # Utilities & services
│   │   ├── db/              # Prisma client
│   │   ├── ai/              # Anthropic Claude AI
│   │   ├── auth/            # Authentication
│   │   ├── email/           # Email service (Resend)
│   │   ├── pdf/             # PDF generation
│   │   └── validations/     # Zod schemas
│   ├── types/               # TypeScript types
│   └── hooks/               # Custom React hooks
├── prisma/                  # Database schema & migrations
├── public/                  # Static assets
└── ROBOSELECT_PLAN.md      # Detailed implementation plan
```

---

## 🛠️ Tech Stack

### Core
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript 5
- **Database**: PostgreSQL + Prisma ORM
- **Styling**: Tailwind CSS + shadcn/ui

### Key Dependencies
- **AI**: Anthropic Claude API (matching algorithm)
- **Email**: Resend + React Email
- **PDF**: @react-pdf/renderer
- **Forms**: React Hook Form + Zod
- **Charts**: Recharts
- **Animations**: Framer Motion
- **Tables**: TanStack Table
- **Icons**: Lucide React

### Deployment
- **Hosting**: Vercel
- **Database**: Neon (PostgreSQL)
- **Email**: Resend
- **AI**: Anthropic Claude

---

## 📊 Database Schema

### Core Models

- **Robot**: Product catalog (specs, pricing, media)
- **Manufacturer**: Robot manufacturers (Pudu, Keenon, etc.)
- **Industry**: Target industries (hotels, restaurants, etc.)
- **RobotType**: Robot categories (delivery, cleaning, etc.)
- **Assessment**: Quiz responses and results
- **Lead**: Consolidated lead tracking
- **Quote**: Generated quotes with PDFs
- **Demo**: Demo booking and scheduling
- **CaseStudy**: Customer success stories

See `prisma/schema.prisma` for complete schema.

---

## 🔑 Environment Variables

See `.env.example` for all required environment variables.

**Critical variables:**
- `DATABASE_URL`: PostgreSQL connection string
- `ANTHROPIC_API_KEY`: Claude API key for matching
- `RESEND_API_KEY`: Email service API key
- `ADMIN_JWT_SECRET`: JWT secret for admin auth
- `NEXT_PUBLIC_APP_URL`: App URL (for emails, redirects)

---

## 💻 Development Workflow

### Database Commands

```bash
# Generate Prisma Client (after schema changes)
npm run db:generate

# Create a new migration
npm run db:migrate

# Push schema to database (dev only)
npm run db:push

# Open Prisma Studio (database GUI)
npm run db:studio

# Seed database with sample data
npm run db:seed
```

### Code Quality

```bash
# Type check
npm run type-check

# Lint code
npm run lint

# Format with Prettier
npm run format
```

### Building

```bash
# Build for production
npm run build

# Start production server
npm start
```

---

## 🎨 Design System

### Colors
- **Primary**: Blue (#3B82F6) - Trust, professionalism
- **Secondary**: Slate - Clean, modern
- **Accent**: Indigo - Call-to-actions
- **Success**: Green - Positive actions
- **Warning**: Orange - Important notices
- **Error**: Red - Errors and validation

### Typography
- **Font**: Inter (Google Fonts)
- **Headings**: Bold, large, clear hierarchy
- **Body**: Regular, 16px base, 1.5 line-height

### Components
All UI components are from shadcn/ui (Radix UI primitives) for:
- Accessibility (WCAG AA compliant)
- Keyboard navigation
- Screen reader support
- Focus management

---

## 🔐 Authentication

### Admin Authentication
- **Method**: Email + Password (bcrypt hashing)
- **Session**: JWT tokens in HTTP-only cookies
- **Expiry**: 7 days (configurable)
- **Routes**: All `/admin/*` routes are protected

### Public Access
- Quiz and robot browsing: No authentication required
- Quote/demo requests: Email required (creates lead)

---

## 📧 Email Automation

### Automated Emails

**Quote Sent**
- Immediate: Quote PDF + welcome message
- Day 2: Follow-up with questions
- Day 5: Check-in reminder
- Day 7: Final call (expires soon)

**Demo Booked**
- Immediate: Confirmation + calendar invite
- 24h before: Reminder
- 1h before: "On our way" message
- Next day: Follow-up + quote link

**Quiz Completed** (if email provided)
- Immediate: Results summary + top matches
- Day 2: Deep dive on #1 recommendation
- Day 7: Relevant case study

---

## 📈 Success Metrics

### Target KPIs
- **10+ qualified leads per week**
- **20% quiz → quote conversion**
- **10% quiz → demo conversion**
- **<2 second page load times**
- **60%+ mobile traffic**
- **Page 1 ranking** for target keywords in 3 months

### Analytics Tracking
- Quiz completion rate
- Most popular robots
- Conversion funnel
- Traffic sources
- Lead quality metrics

---

## 🗺️ Roadmap

### Phase 1: MVP (Current)
- [x] Project setup
- [ ] Quiz system with AI matching
- [ ] Robot catalog and detail pages
- [ ] Quote request system
- [ ] Demo booking system
- [ ] Admin dashboard
- [ ] Email automation
- [ ] SEO optimization
- [ ] Production deployment

### Phase 2: Enhancement
- [ ] Live chat support
- [ ] Video testimonials
- [ ] Comparison tool
- [ ] Blog/CMS
- [ ] SMS notifications
- [ ] Advanced email sequences

### Phase 3: Advanced
- [ ] Finance application forms
- [ ] Multi-user admin roles
- [ ] CRM integration (HubSpot)
- [ ] Inventory management
- [ ] A/B testing framework

---

## 🤝 Contributing

This is a proprietary project. For authorized contributors:

1. Create a feature branch
2. Make your changes
3. Run tests and linting
4. Submit pull request

---

## 📝 Documentation

- **Implementation Plan**: See `ROBOSELECT_PLAN.md`
- **Coding Guide**: See `ROBOSELECT_CLAUDE.md`
- **API Documentation**: Coming soon
- **Component Library**: Use Storybook (planned)

---

## 🐛 Troubleshooting

### Database connection errors
```bash
# Check PostgreSQL is running
# Verify DATABASE_URL in .env.local
npx prisma db push
```

### Prisma Client errors
```bash
npx prisma generate
```

### Type errors
```bash
npm run type-check
```

### Build errors
```bash
# Clear .next and node_modules
rm -rf .next node_modules
npm install
npm run build
```

---

## 📞 Support

- **Documentation**: Check `ROBOSELECT_PLAN.md` and `ROBOSELECT_CLAUDE.md`
- **Issues**: Open an issue in the repository
- **Email**: support@roboselect.co.uk

---

## 📄 License

Proprietary - All rights reserved

---

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org) - React framework
- [Prisma](https://prisma.io) - Database ORM
- [shadcn/ui](https://ui.shadcn.com) - UI components
- [Anthropic](https://anthropic.com) - Claude AI API
- [Resend](https://resend.com) - Email service
- [Vercel](https://vercel.com) - Hosting platform

---

**Built with ❤️ for the future of service robotics in UK businesses**

Last updated: 2025-11-03
