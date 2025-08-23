# Modern Agro Duck Farm Web Application

## Overview

Modern Agro is a fullstack web application for a duck farm business that sells premium duck products including fresh eggs and meat. The application features a modern, responsive design with a farm-fresh green theme, providing both a public-facing e-commerce website and an administrative dashboard for business management.

The system serves two primary user types: customers who browse and purchase products through the public website, and administrators who manage products, orders, blog content, and business operations through a secure admin panel.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript for type safety and better developer experience
- **Styling**: Tailwind CSS with a custom farm-themed color palette (farm-green, earth-brown, warm-yellow)
- **UI Components**: Radix UI primitives with shadcn/ui component library for consistent, accessible design
- **State Management**: React Query (TanStack Query) for server state management and React Context for cart functionality
- **Routing**: Wouter for lightweight client-side routing
- **Build Tool**: Vite for fast development and optimized builds

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Database Provider**: Neon serverless PostgreSQL for cloud deployment
- **Authentication**: Replit-specific OAuth integration with session management
- **API Design**: RESTful endpoints organized by resource type (products, orders, blog, etc.)

### Data Storage Solutions
- **Primary Database**: PostgreSQL hosted on Neon serverless platform
- **ORM**: Drizzle ORM with schema-first approach for type safety
- **Session Storage**: PostgreSQL-backed sessions using connect-pg-simple
- **Client-side Storage**: localStorage for guest cart persistence

### Authentication and Authorization
- **Authentication Provider**: Replit OAuth system with OpenID Connect
- **Session Management**: Express sessions stored in PostgreSQL
- **Authorization**: Role-based access control with admin flag in user records
- **Protected Routes**: Admin dashboard requires authentication and admin privileges

### Data Models
- **Users**: Stores user profiles with admin role flags
- **Products**: Duck products with pricing, inventory, and categorization
- **Orders**: Customer orders with associated order items and delivery details
- **Blog Posts**: Content management for farm-related articles
- **Contact Messages**: Customer inquiries and feedback
- **Sessions**: Secure session storage for authenticated users

### API Structure
- **Public APIs**: Product catalog, blog content, contact form submission
- **Protected APIs**: Admin product management, order management, blog administration
- **Authentication APIs**: Login, logout, user profile retrieval

## External Dependencies

### Core Framework Dependencies
- **React Ecosystem**: React 18+ with hooks, TypeScript support
- **Vite**: Development server and build tool with React plugin
- **Express.js**: Node.js web application framework

### UI and Styling
- **Tailwind CSS**: Utility-first CSS framework with custom theme
- **Radix UI**: Headless UI components for accessibility
- **shadcn/ui**: Pre-built component library built on Radix UI
- **Lucide React**: Icon library for consistent iconography

### Database and ORM
- **PostgreSQL**: Primary database system
- **Neon**: Serverless PostgreSQL hosting platform
- **Drizzle ORM**: TypeScript-first ORM with schema validation
- **Drizzle Kit**: Database migration and schema management tools

### Authentication
- **Replit OAuth**: Platform-specific authentication system
- **OpenID Client**: OAuth 2.0 and OpenID Connect client library
- **Passport.js**: Authentication middleware for Express
- **Express Session**: Session management with PostgreSQL storage

### State Management and Data Fetching
- **TanStack Query**: Server state management and caching
- **React Hook Form**: Form handling with validation
- **Zod**: Runtime type validation and schema validation

### Development and Build Tools
- **TypeScript**: Static type checking
- **ESBuild**: Fast JavaScript bundler for production builds
- **PostCSS**: CSS processing with Autoprefixer
- **TSX**: TypeScript execution for development server

### Utility Libraries
- **date-fns**: Date manipulation and formatting
- **clsx**: Conditional CSS class construction
- **class-variance-authority**: Component variant management
- **memoizee**: Function memoization for performance optimization