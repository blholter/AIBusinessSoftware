# AI Marketplace - System Architecture

## Overview

This is a full-stack AI marketplace application built with React (frontend) and Express.js (backend). The application allows users to discover, browse, and manage AI applications through a modern web interface. It features user authentication via email/password registration and Google OAuth, a responsive UI built with shadcn/ui components, and a PostgreSQL database for data persistence.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **UI Framework**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **State Management**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for client-side routing
- **Forms**: React Hook Form with Zod validation

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Replit Auth with OpenID Connect
- **Session Management**: Express sessions with PostgreSQL session store
- **API Design**: RESTful API with JSON responses

### Database Architecture
- **ORM**: Drizzle ORM for type-safe database operations
- **Database**: PostgreSQL (configured for Neon serverless)
- **Schema**: Shared schema definition between frontend and backend
- **Migrations**: Drizzle Kit for database migrations

## Key Components

### Authentication System
- **Email/Password**: Secure password hashing with scrypt algorithm
- **Google OAuth**: Integration with Google sign-in using passport-google-oauth20
- **Session Storage**: PostgreSQL-backed session store with connect-pg-simple
- **Middleware**: Custom authentication middleware for protected routes
- **User Management**: Registration, login, logout, and profile management

### Database Schema
- **Users Table**: Stores user profiles with email, password, OAuth data, and profile information
- **Applications Table**: Stores AI application metadata (name, description, category, etc.)
- **Sessions Table**: Required for passport session management

### UI Components
- **Design System**: shadcn/ui components for consistent design
- **Responsive**: Mobile-first design with Tailwind CSS
- **Accessibility**: Built on Radix UI primitives for accessibility
- **Theming**: CSS variables for light/dark mode support

### API Layer
- **User Routes**: Authentication, profile management
- **Application Routes**: Browse and manage AI applications
- **Error Handling**: Centralized error handling with proper HTTP status codes

## Data Flow

1. **Authentication Flow**:
   - User visits app → Redirected to auth page if not authenticated
   - Registration/Login → Password hashing and session creation
   - Google OAuth → Automatic user creation/linking
   - Protected routes check session validity

2. **Application Browsing**:
   - Frontend fetches applications via React Query
   - Backend queries PostgreSQL using Drizzle ORM
   - Data cached on frontend for performance

3. **User Profile Management**:
   - Profile updates sent to backend API
   - Validated using Zod schemas
   - Database updated and response cached

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL connection for Neon
- **drizzle-orm**: Type-safe database operations
- **@tanstack/react-query**: Server state management
- **@radix-ui/***: Accessible UI primitives
- **express**: Web framework
- **passport**: Authentication middleware
- **passport-local**: Local authentication strategy
- **passport-google-oauth20**: Google OAuth strategy

### Development Dependencies
- **tsx**: TypeScript execution for development
- **esbuild**: Fast bundling for production
- **tailwindcss**: Utility-first CSS framework
- **vite**: Frontend build tool

## Deployment Strategy

### Build Process
- **Frontend**: Vite builds React app to `dist/public`
- **Backend**: esbuild bundles Express server to `dist/index.js`
- **Database**: Drizzle migrations ensure schema consistency

### Environment Requirements
- **DATABASE_URL**: PostgreSQL connection string (required)
- **SESSION_SECRET**: Secret for session encryption
- **GOOGLE_CLIENT_ID**: Google OAuth client ID (optional)
- **GOOGLE_CLIENT_SECRET**: Google OAuth client secret (optional)

### Production Deployment
- Application runs on Node.js
- Static files served from `dist/public`
- Database migrations run via `npm run db:push`
- Session storage handled by PostgreSQL

### Development Setup
- Hot reload via Vite for frontend changes
- tsx for TypeScript execution in development
- Replit-specific plugins for development environment