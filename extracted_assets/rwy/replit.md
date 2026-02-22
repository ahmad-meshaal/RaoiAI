# replit.md

## Overview

This is an Arabic novel writing assistant called **راوي** (Rawi). It's a full-stack web application that helps users create, manage, and write novels in Arabic. The app supports creating novels with chapters and characters, AI-powered plot and chapter generation, a chapter editor with auto-save, and PDF export via browser print. The entire UI is in Arabic with RTL (right-to-left) layout and uses a warm, literary aesthetic with paper-like backgrounds.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript, bundled by Vite
- **Routing**: Wouter (lightweight client-side router)
- **State Management**: TanStack React Query for server state; local React state for UI
- **UI Components**: shadcn/ui (new-york style) built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming. Custom warm paper theme with terracotta primary color
- **Fonts**: Amiri (serif, for headings/body text) and Noto Sans Arabic (sans-serif, for UI elements)
- **RTL**: The entire app renders right-to-left (`dir="rtl"` on root element, `direction: rtl` in CSS)
- **Path aliases**: `@/` maps to `client/src/`, `@shared/` maps to `shared/`

### Pages
- **Home** (`/`): Novel library listing all novels with create dialog
- **NovelDashboard** (`/novels/:id`): Overview of a single novel with chapters, characters, and AI plot generation
- **Characters** (`/novels/:id/characters`): Character management for a novel
- **Editor** (`/novels/:novelId/editor/:chapterId`): Chapter text editor with auto-save (30s interval) and AI chapter generation
- **Export** (`/novels/:id/export`): Print-ready view for PDF export using native browser print
- **Settings** (`/settings`): Dark mode toggle and app preferences

### Backend Architecture
- **Runtime**: Node.js with Express 5
- **Language**: TypeScript, executed via tsx
- **Dev server**: Vite dev server runs as middleware in development; static files served in production
- **API pattern**: RESTful JSON API under `/api/` prefix. Routes defined in `shared/routes.ts` with Zod schemas for validation
- **Storage layer**: `IStorage` interface implemented by `DatabaseStorage` class in `server/storage.ts`, using Drizzle ORM directly

### API Routes
- `GET/POST /api/novels` — List/create novels
- `GET/PUT/DELETE /api/novels/:id` — Get/update/delete novel
- `GET/POST /api/novels/:id/characters` — List/create characters
- `GET/PUT/DELETE /api/characters/:id` — Get/update/delete character
- `GET/POST /api/novels/:id/chapters` — List/create chapters
- `GET/PUT/DELETE /api/chapters/:id` — Get/update/delete chapter
- `POST /api/ai/generate-plot` — AI plot generation
- `POST /api/ai/generate-chapter` — AI chapter generation
- `POST /api/generate-image` — AI image generation
- `/api/conversations/*` — Chat integration routes

### Database
- **Database**: PostgreSQL (required, connection via `DATABASE_URL` environment variable)
- **ORM**: Drizzle ORM with `drizzle-zod` for schema-to-Zod validation
- **Schema location**: `shared/schema.ts`
- **Migrations**: Drizzle Kit with `drizzle-kit push` command (`npm run db:push`)
- **Tables**:
  - `novels` — id, title, genre, synopsis, status, createdAt
  - `characters` — id, novelId, name, role, traits, description, createdAt
  - `chapters` — id, novelId, title, sequenceNumber, content, outline, createdAt
  - `conversations` — id, title, createdAt (for AI chat integration)
  - `messages` — id, conversationId, role, content, createdAt (for AI chat integration)

### Shared Code
- `shared/schema.ts` — Drizzle table definitions, relations, insert schemas, and TypeScript types
- `shared/routes.ts` — API route definitions with paths, methods, Zod input/output schemas
- `shared/models/chat.ts` — Chat-specific table definitions for AI integrations

### Build System
- **Dev**: `npm run dev` runs tsx on `server/index.ts`, which sets up Vite middleware for HMR
- **Build**: `npm run build` runs Vite build for client → `dist/public/`, then esbuild for server → `dist/index.cjs`
- **Production**: `npm start` runs the built `dist/index.cjs`
- **Type check**: `npm run check`

### AI Integrations (Replit-specific)
Located in `server/replit_integrations/`:
- **Chat** (`chat/`): Conversation management with OpenAI streaming
- **Image** (`image/`): Image generation via `gpt-image-1`
- **Audio** (`audio/`): Voice chat with speech-to-text, text-to-speech, SSE streaming
- **Batch** (`batch/`): Batch processing utility with rate limiting and retries
- Client-side audio utilities in `client/replit_integrations/audio/`

### Important Notes
- The `temp_extract/` directory is a duplicate/backup of the main project and should be ignored
- The app's AI service (`server/ai_service.ts`) uses OpenAI API configured via Replit AI Integrations environment variables
- All AI prompts are in Arabic, requesting responses in formal Arabic (الفصحى)

## External Dependencies

### Database
- **PostgreSQL** — Primary data store, connected via `DATABASE_URL` environment variable
- **connect-pg-simple** — PostgreSQL session store (available but sessions not currently active)

### AI Services
- **OpenAI API** (via Replit AI Integrations) — Used for:
  - Plot generation and chapter writing (`gpt-5.2` model)
  - Image generation (`gpt-image-1` model)
  - Chat completions for conversation features
  - Speech-to-text and text-to-speech for voice features
- Environment variables: `AI_INTEGRATIONS_OPENAI_API_KEY`, `AI_INTEGRATIONS_OPENAI_BASE_URL`

### Key NPM Packages
- **drizzle-orm** + **drizzle-kit** — Database ORM and migration tooling
- **express** v5 — HTTP server framework
- **zod** + **drizzle-zod** — Runtime validation
- **@tanstack/react-query** — Client-side data fetching/caching
- **wouter** — Client-side routing
- **shadcn/ui** components (Radix UI primitives) — UI component library
- **date-fns** — Date formatting (with Arabic locale support)
- **openai** — OpenAI SDK for AI features
- **framer-motion** — Animations (listed in requirements)
- **react-hook-form** + **@hookform/resolvers** — Form handling with Zod validation

### Google Fonts (CDN)
- Amiri (Arabic serif font)
- Noto Sans Arabic (Arabic sans-serif font)