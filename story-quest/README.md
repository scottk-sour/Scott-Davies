# StoryQuest - Therapeutic Stories for Children in Care

> Trauma-informed interactive stories designed to support healing and growth for children in the care system.

---

## 🎯 Mission

**Every child in care deserves access to therapeutic support.**

StoryQuest provides trauma-informed interactive stories completely **free** for children in foster care, kinship care, residential care, and those adopted from care. Our platform is funded through partnerships with Local Authorities and charitable grants.

---

## ✨ What Makes Us Different

### For Children
- **Interactive Stories**: Children make choices that empower them and help process difficult emotions
- **Trauma-Informed**: Every story is crafted with therapeutic principles
- **Safe Content**: Content warnings and age-appropriate filtering
- **Audio Narration**: Full narration with adjustable speed
- **Free Access**: Completely free for children in the care system

### For Professionals (Social Workers, Therapists, Teachers)
- **Track Progress**: Monitor reading sessions and emotional responses
- **Conversation Guides**: Evidence-based prompts for therapeutic discussions
- **Secure Notes**: Document observations with appropriate consent
- **Professional Verification**: DBS-checked professionals only

### For Local Authorities
- **Institutional Licensing**: Serve up to 250 children
- **Bulk Management**: Easy onboarding and account management
- **Safeguarding Built-In**: Full audit trails and reporting
- **Compliance**: GDPR compliant, professional oversight

---

## 🛠 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript (strict mode)
- **Database**: PostgreSQL with Prisma ORM
- **Auth**: NextAuth.js v5 with role-based access
- **Styling**: Tailwind CSS
- **Audio**: Howler.js
- **Validation**: Zod
- **Deployment**: Vercel

---

## 🏗 Project Structure

```
story-quest/
├── app/
│   ├── (auth)/              # Auth pages (login, signup)
│   ├── (dashboard)/         # Protected dashboard routes
│   ├── (marketing)/         # Public pages
│   └── api/                 # API routes
├── components/
│   ├── ui/                  # Reusable UI components
│   ├── story/               # Story reader components
│   ├── auth/                # Auth components
│   ├── dashboard/           # Dashboard components
│   └── professional/        # Professional tools
├── lib/
│   ├── auth.ts              # NextAuth configuration
│   ├── prisma.ts            # Prisma client
│   ├── utils.ts             # Utility functions
│   └── validations/         # Zod schemas
├── prisma/
│   └── schema.prisma        # Database schema
└── types/
    └── index.ts             # TypeScript types
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd story-quest
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```

   Update `.env` with your credentials:
   ```
   DATABASE_URL="postgresql://..."
   NEXTAUTH_SECRET="..." # Generate with: openssl rand -base64 32
   NEXTAUTH_URL="http://localhost:3000"
   ```

4. **Set up the database**
   ```bash
   npx prisma generate
   npx prisma migrate dev
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000)

---

## 🗄 Database Schema

### Core Models

#### User
- Email/password authentication
- Roles: PARENT, PROFESSIONAL, ADMIN
- Email preferences

#### Child
- Basic info (name, age, avatar)
- **Care Status**: Foster care, kinship care, residential care, etc.
- Care status verification
- Therapeutic profile (trauma history, triggers, goals)
- Reading preferences

#### Professional
- Job title, organization
- **DBS verification** details
- Qualifications
- Child assignments
- Verification status

#### Story
- Basic metadata (title, description, cover)
- **Therapeutic themes** (safety, trust, resilience)
- **Trauma topics** (with content warnings)
- **Conversation guides** for professionals
- Interactive content (choices, scenes, endings)
- Audio narration

#### TherapeuticNote
- Professional observations
- Session notes
- Progress tracking
- Confidentiality controls

#### SafeguardingLog
- Event tracking
- Severity levels
- Action taken
- Resolution status

#### InstitutionalLicense
- Local Authority licenses
- Seat management
- Billing integration

---

## 🎨 Design Principles

### Trauma-Informed Approach

1. **Safety First**: Clear content warnings, opt-in for sensitive topics
2. **Empowerment**: Children make choices, control pace
3. **Predictability**: Clear structure, consistent navigation
4. **Professional Support**: Guidance available at every step
5. **Child-Centered**: Language, visuals, and interactions designed for children

### Safeguarding

- **Access Controls**: Role-based permissions
- **Audit Logging**: All actions tracked
- **Professional Verification**: DBS checks required
- **Confidentiality**: Secure note-taking with appropriate sharing
- **Reporting**: Built-in safeguarding concern reporting

---

## 💰 Pricing Model

### For Children in Care
- **FREE** - Completely free access when care status is verified

### For Professionals (Individual)
- **FREE** - Access to professional tools and conversation guides

### For Institutions
- **Standard**: £2,500/year (50 seats)
- **Large**: £4,500/year (100 seats)
- **Enterprise**: £9,999/year (250+ seats)
- **Pilot**: FREE for 3 months

---

## 🧑‍⚕️ Content Development

### Story Creation Process

1. **Therapeutic Design**: Consult with child psychologists
2. **Story Writing**: Craft narrative with clear therapeutic goals
3. **Professional Review**: Psychologist review and approval
4. **Content Warnings**: Identify potential triggers
5. **Conversation Guides**: Create discussion prompts
6. **Audio Production**: Record or generate narration
7. **Testing**: Test with professionals and pilot group

### Story Categories

- **Safety & Security**: Finding safety, feeling secure
- **Feelings & Emotions**: Understanding and expressing emotions
- **Trust & Relationships**: Building trust, healthy relationships
- **Resilience & Strength**: Overcoming challenges
- **Identity & Belonging**: Who am I, where do I belong
- **Healing & Growth**: Processing trauma, growing stronger

---

## 🔐 Security & Compliance

### GDPR Compliance
- Data minimization
- Consent management
- Right to erasure
- Data portability
- Privacy by design

### Safeguarding
- DBS checks for professionals
- Audit logging
- Incident reporting
- Professional oversight
- Regular reviews

### Data Security
- Encrypted at rest and in transit
- Secure authentication (NextAuth.js)
- Role-based access control
- Regular security audits

---

## 📊 Roadmap

### Phase 1: Foundation (Current) ✅
- [x] Project setup
- [x] Database schema
- [x] Authentication system
- [x] Landing page
- [ ] Story reader
- [ ] Professional dashboard
- [ ] Child management

### Phase 2: Core Features
- [ ] Audio integration
- [ ] Progress tracking
- [ ] Conversation guides
- [ ] Safeguarding features
- [ ] First 5 therapeutic stories

### Phase 3: Launch Preparation
- [ ] Professional verification
- [ ] Care status verification
- [ ] Institutional licensing
- [ ] Local Authority pilot

### Phase 4: Growth
- [ ] Grant funding applications
- [ ] Partnership development
- [ ] Content expansion
- [ ] Mobile app (future)

---

## 🤝 Partnership Opportunities

### We're Seeking Partnerships With:

- **Local Authorities**: Pilot programs for children in care
- **Foster Care Agencies**: Platform access for foster families
- **Charities**: Co-funding and content development
- **Educational Psychologists**: Content review and guidance
- **Trauma Specialists**: Story development consultation

**Contact**: [Insert contact details]

---

## 📚 Resources

### For Developers
- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [NextAuth.js Documentation](https://next-auth.js.org)
- [Tailwind CSS](https://tailwindcss.com)

### For Content Creators
- See `CONTENT_GUIDELINES.md` (coming soon)
- Trauma-informed storytelling guide
- Conversation guide templates

### For Professionals
- See `PROFESSIONAL_GUIDE.md` (coming soon)
- Using conversation guides effectively
- Interpreting child responses

---

## 🧪 Testing

```bash
# Run unit tests
npm run test

# Type checking
npm run type-check

# Lint
npm run lint

# Database management
npm run prisma:studio  # Open Prisma Studio
npm run prisma:migrate # Run migrations
```

---

## 📄 License

This project is proprietary. All rights reserved.

**Non-Commercial Use**: The platform is provided free for children in care through institutional partnerships.

---

## 💖 Acknowledgments

This platform was created with love and care, informed by:
- Child trauma research
- Lived experience of care leavers
- Professional expertise from social workers and therapists
- Input from Local Authorities

Special thanks to all the professionals working tirelessly to support children in care.

---

## 📞 Contact & Support

- **Website**: [Coming soon]
- **Email**: [Insert email]
- **Safeguarding Concerns**: [Insert emergency contact]

---

**Built with Next.js, TypeScript, and compassion** 💜

*Last updated: 2025-10-31*
