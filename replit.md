# Rivals - MHT-CET Battle Tracker

## Overview

Rivals is a competitive learning platform designed specifically for exactly two users preparing for MHT-CET (Maharashtra Common Entrance Test). The application combines productivity tracking with gamification elements, allowing study rivals to compete head-to-head by tracking lectures, DPPs (Daily Practice Papers), school lessons, and achievements. The platform features real-time progress comparison, streak tracking, a chat system, and an achievement system to motivate consistent study habits.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build System**
- React 18 with TypeScript for type-safe component development
- Vite as the build tool and development server
- Wouter for lightweight client-side routing
- TanStack Query (React Query) for server state management with aggressive caching (staleTime: Infinity)

**UI Component System**
- Shadcn/ui component library built on Radix UI primitives
- Tailwind CSS for utility-first styling with custom design system
- Class Variance Authority (CVA) for component variant management
- Design follows a hybrid productivity/gaming aesthetic inspired by Linear, Notion, and Duolingo

**State Management Strategy**
- Authentication state managed through React Context (AuthContext)
- Theme state managed through React Context (ThemeProvider)
- Server state managed exclusively through TanStack Query
- No global client state management library (Redux/Zustand) - queries handle all data fetching

**Design System**
- Custom color scheme with CSS variables for light/dark theme support
- Typography based on Inter font family with defined hierarchy
- Spacing system using Tailwind's 4px-based scale
- Component elevation system using shadow utilities
- Badge outline system using CSS custom properties

### Backend Architecture

**Server Framework**
- Express.js with TypeScript
- HTTP server with custom logging middleware
- Cookie-based JWT authentication (no sessions)
- File upload support via Multer (profile images stored in /uploads directory)

**API Design**
- RESTful endpoints organized by feature domain
- Authentication middleware applied per-route
- Request/response logging with timing metrics
- Error responses use standard HTTP status codes

**Authentication & Authorization**
- JWT tokens stored in HTTP-only cookies (cookie name: "rivals_token")
- Bcrypt for password hashing
- No role-based access control - all users have equal permissions
- Rival matching based on shared "rival code" field

**Business Logic**
- Users can only have one rival (determined by matching rivalCode)
- Completion tracking prevents duplicates via unique constraints
- Streak calculation based on daily activity
- Achievement system with predefined triggers (ACHIEVEMENT_DEFINITIONS)
- Chapter structure hardcoded in CHAPTERS_DATA (Physics, Chemistry, Mathematics)

### Data Storage Solutions

**Database**
- **Neon Serverless PostgreSQL** (via DATABASE_URL environment variable)
- Drizzle ORM for type-safe database access
- Schema-first approach with Drizzle-Zod integration
- WebSocket connection pooling for serverless environments
- Auto-migrations on app startup using Drizzle migrations

**Schema Design**
- Users table: authentication, profile data, rival matching via rivalCode
- Content tables: lectures, dpps, schoolLessons (organized by subject/chapter)
- Completion tables: lectureCompletions, dppCompletions, schoolLessonCompletions with unique constraints
- Social tables: chatMessages (filtered by rival relationship), achievements, streaks
- Relationships enforced via foreign keys

**Data Access Patterns**
- Storage layer abstraction (server/storage.ts) provides interface for all database operations
- Queries optimized for 1v1 comparison (user + rival data)
- Completion counts aggregated using SQL count functions
- Streak data calculated based on date-based completion records

### External Dependencies

**Database Service**
- Neon Serverless Postgres - connection via DATABASE_URL environment variable
- The app automatically reads DATABASE_URL and connects to Neon's pooler
- Works on Replit (development), Vercel, Render, and any other platform
- Connection pooling via @neondatabase/serverless with WebSocket support
- Automatic migrations run on app startup (no manual db:push needed in production)

**Authentication Libraries**
- jsonwebtoken for JWT creation/verification
- bcryptjs for password hashing
- cookie-parser middleware for cookie handling

**File Upload**
- Multer for multipart/form-data handling
- Local filesystem storage in /uploads directory
- Image validation (type and size checks)

**UI Component Libraries**
- Radix UI primitives for accessible components
- Recharts for data visualization (dashboard charts)
- React Hook Form + Zod for form validation
- Lucide React for icons

**Development Tools**
- Replit-specific plugins (vite-plugin-runtime-error-modal, cartographer, dev-banner)
- ESBuild for server bundling in production
- Drizzle Kit for database migrations

**Build Process**
- Client built with Vite to dist/public
- Server bundled with ESBuild to dist/index.cjs
- Selective dependency bundling (allowlist for specific packages to reduce syscalls)
- Static file serving from dist/public in production