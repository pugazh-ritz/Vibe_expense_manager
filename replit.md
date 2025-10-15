# Daily Expense Tracker with Goal-Based Savings

## Overview

A mobile-first expense tracking application that helps users manage daily spending and work towards savings goals. The app tracks expenses in Indian Rupees (₹), monitors daily budget limits, and enables goal-based savings allocation. Built with a modern fintech-inspired design system that prioritizes clarity, trust, and ease of use.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Tooling**
- React 18 with TypeScript for type-safe component development
- Vite as the build tool and dev server
- Wouter for lightweight client-side routing (single-page application)
- TanStack Query (React Query) for server state management and API caching

**UI Component System**
- Shadcn/ui component library with Radix UI primitives for accessible, unstyled components
- Tailwind CSS for utility-first styling with custom design tokens
- Class Variance Authority (CVA) for variant-based component styling
- Custom CSS variables for theme support (light/dark mode)

**Design System**
- Fintech-inspired design with emphasis on clarity and trust
- Mobile-first responsive approach (primary target: mobile devices)
- Custom color palette for financial states (primary blue, success green, danger red)
- Typography using Inter for UI text and JetBrains Mono for numeric displays
- Touch-optimized interface with large tap targets

**Form Management**
- React Hook Form for form state and validation
- Zod schemas for runtime type validation (shared with backend)
- @hookform/resolvers for integrating Zod with React Hook Form

**State Management Strategy**
- Server state managed by TanStack Query with aggressive caching (staleTime: Infinity)
- Local UI state managed by React hooks (useState, useContext)
- Theme state persisted to localStorage via custom ThemeProvider context

### Backend Architecture

**Server Framework**
- Express.js as the HTTP server framework
- TypeScript with ESM module system
- Custom middleware for request logging and error handling

**API Design Pattern**
- RESTful API endpoints under `/api` prefix
- JSON request/response format
- Mutation operations return updated entities
- Error responses include status codes and descriptive messages

**Development vs Production**
- Development: Vite dev server middleware integrated with Express
- Production: Static file serving from built assets
- Conditional plugin loading based on NODE_ENV and REPL_ID

**Storage Layer**
- In-memory storage implementation (MemStorage class) as default
- Interface-based design (IStorage) for easy database swapping
- UUID-based entity identification using crypto.randomUUID()

### Data Model

**Core Entities**
- **Expenses**: Tracks individual spending transactions with amount, category, description, and date
- **Savings Goals**: Defines savings targets with name, target amount, current amount, and icon
- **Daily Budget**: Manages daily spending limits with date, limit, and spent tracking

**Schema Validation**
- Drizzle ORM schema definitions in PostgreSQL dialect (configured but not actively used)
- Zod schemas derived from Drizzle for runtime validation
- Shared schema between client and server via `@shared` path alias

**Data Flow**
- Client submits validated data via API requests
- Server validates with Zod schemas before persistence
- TanStack Query automatically invalidates and refetches affected queries
- Toast notifications provide user feedback on operations

### Routing & Navigation

**Client-Side Routing**
- Wouter for declarative routing without React Router overhead
- Bottom navigation pattern for primary routes (Home, Goals, History, Settings)
- Fixed bottom navigation bar (z-index: 20) for persistent access

**Route Structure**
- `/` - Home page with budget overview and today's expenses
- `/goals` - Savings goals management
- `/history` - Historical expense viewing
- `/settings` - Budget configuration and preferences
- Catch-all 404 page for unmatched routes

### Build & Deployment

**Build Process**
- Client: Vite builds React app to `dist/public`
- Server: esbuild bundles Express server to `dist/index.js`
- Shared TypeScript configuration with path aliases
- Production build combines both client and server artifacts

**Development Workflow**
- Hot module replacement (HMR) via Vite
- Type checking with `tsc --noEmit`
- Database schema push with Drizzle Kit

## External Dependencies

### Database (Configured)
- **Neon Database**: Serverless PostgreSQL configured via `@neondatabase/serverless`
- **Drizzle ORM**: PostgreSQL ORM with schema migrations (v0.39.1)
- **Connection**: Via DATABASE_URL environment variable
- Note: Application currently uses in-memory storage; database integration is prepared but not active

### UI Component Libraries
- **Radix UI**: Comprehensive set of unstyled, accessible components (@radix-ui/react-*)
- **Lucide React**: Icon library for consistent iconography
- **Embla Carousel**: Touch-friendly carousel implementation
- **date-fns**: Date manipulation and formatting (v3.6.0)

### Development Tools
- **Replit Plugins**: Cartographer and dev banner for Replit-specific development features
- **Runtime Error Overlay**: Vite plugin for better error visibility
- **PostCSS**: With Tailwind CSS and Autoprefixer for CSS processing

### Session Management (Prepared)
- **connect-pg-simple**: PostgreSQL session store for Express sessions
- Note: Session infrastructure is installed but authentication/session handling not yet implemented

### Validation & Type Safety
- **Zod**: Runtime schema validation (v3.x)
- **drizzle-zod**: Generates Zod schemas from Drizzle ORM definitions
- Type safety enforced across client-server boundary via shared schemas