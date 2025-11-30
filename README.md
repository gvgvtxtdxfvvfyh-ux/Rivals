# Rivals - MHT-CET Battle Tracker

## Overview

Rivals is a competitive tracking application designed for exactly two users preparing for the MHT-CET examination (11th batch from PW Physics Wallah). The application creates a gamified learning environment where rivals can track lecture completions, DPP (Daily Practice Problems) progress, school lessons, and maintain competitive streaks. The system enforces a strict two-user limit through a rival code mechanism, creating an exclusive one-on-one competitive experience.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Styling:**
- React with TypeScript for type-safe component development
- Wouter for lightweight client-side routing
- Tailwind CSS for utility-first styling with a custom dark theme configuration
- shadcn/ui component library (New York style) for consistent UI primitives
- React Hook Form with Zod for type-safe form validation

**State Management:**
- TanStack React Query for server state management, data fetching, and caching
- Custom query client with cookie-based authentication
- Optimistic updates disabled (staleTime: Infinity) for consistent data display

**Design System:**
- Dark-first competitive gaming aesthetic ("Precision Combat Interface")
- Inter font family for all typography
- Custom color system using HSL with CSS variables
- Responsive grid layouts with mobile-first breakpoints
- Radix UI primitives for accessible, unstyled components

### Backend Architecture

**Server Framework:**
- Express.js for HTTP server and API routing
- Dual-mode setup: Development (with Vite HMR) and Production (static serving)
- Cookie-based JWT authentication for session management
- Custom middleware for request logging and authentication

**Database Layer:**
- Better-sqlite3 for local, persistent SQLite database
- Storage abstraction pattern (IStorage interface) for potential database swapping
- Write-Ahead Logging (WAL) mode enabled for better concurrency
- Manual schema management with CREATE TABLE IF NOT EXISTS statements

**Authentication System:**
- bcrypt.js for password hashing
- JWT tokens stored in HTTP-only cookies
- Rival code system enforces exactly 2 users per rivalry group
- User count validation on signup to prevent third-user registration

**Core Business Logic:**
- Streak calculation based on daily activity (minimum 1 lecture or DPP completion in 24 hours)
- Progress tracking across three subjects: Physics, Chemistry, Mathematics
- Completion toggles for lectures, DPPs, and school lessons
- Real-time chat messaging between rivals

### Data Model

**Users:**
- Unique identification with email authentication
- Rival code linking for pairing two users
- Customizable user icons (emoji-based, defaults to 🦊)
- PW Batch ID for context tracking

**Content Tracking:**
- Lectures: Subject-based with number and name
- DPPs: Subject-based with number and name  
- School Lessons: Subject-based with lesson number, name, and month range
- Completion records: Many-to-many relationships between users and content items

**Engagement Features:**
- Streaks: Daily activity counter with automatic calculation
- Chat Messages: User-to-user communication with timestamps
- Progress Dashboard: Comparative visualization of both users' achievements

### API Structure

**Authentication Endpoints:**
- POST `/api/auth/signup` - New user registration with rival code
- POST `/api/auth/signin` - Email/password authentication
- POST `/api/auth/logout` - Session termination
- GET `/api/auth/me` - Current user information
- GET `/api/auth/user-count` - Total registered users (for signup validation)

**Content Management:**
- GET `/api/pw/all` - Fetch all PW lectures and DPPs with completion status
- POST `/api/pw/lectures` - Create new lecture entry
- POST `/api/pw/dpps` - Create new DPP entry
- POST `/api/pw/lectures/:id/toggle` - Toggle lecture completion
- POST `/api/pw/dpps/:id/toggle` - Toggle DPP completion

**School Tracking:**
- GET `/api/school/all` - Fetch school lessons and chat messages
- POST `/api/school/lessons` - Create new school lesson
- POST `/api/school/lessons/:id/toggle` - Toggle lesson completion
- POST `/api/school/chat` - Send chat message

**Progress & Analytics:**
- GET `/api/progress/dashboard` - Aggregated progress data for both rivals with streak information

### External Dependencies

**UI Components:**
- @radix-ui/* - Comprehensive suite of accessible, unstyled UI primitives (accordion, dialog, dropdown, select, toast, etc.)
- recharts - Chart visualization library for progress bars and statistics

**Form Handling:**
- react-hook-form - Performant form state management
- @hookform/resolvers - Validation resolver integration
- zod - TypeScript-first schema validation

**Database:**
- better-sqlite3 - Synchronous SQLite3 bindings for Node.js
- drizzle-orm with drizzle-kit - Type-safe ORM with PostgreSQL schema definitions (configured but not actively used; SQLite is primary)
- @neondatabase/serverless - Neon PostgreSQL driver (available but not implemented)

**Development Tools:**
- Vite - Build tool and dev server with HMR
- @replit/vite-plugin-* - Replit-specific development enhancements (runtime error overlay, cartographer, dev banner)
- esbuild - Fast JavaScript bundler for production builds

**Authentication & Security:**
- bcryptjs - Password hashing
- jsonwebtoken - JWT token generation and verification
- cookie-parser - HTTP cookie parsing middleware

**Utilities:**
- date-fns - Date manipulation and formatting
- nanoid - Unique ID generation
- class-variance-authority - Type-safe variant styling
- clsx & tailwind-merge - Conditional class name management

**Note:** The application is configured for both SQLite (currently active) and PostgreSQL (via Drizzle schema), allowing for future database migration if needed. The storage layer uses an interface pattern that abstracts database operations, making it straightforward to swap implementations."# Rivals" 
